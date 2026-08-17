use std::{
    fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use tauri::{AppHandle, Manager, Runtime, State};

use crate::{
    commands::{audio, camera},
    sidecar::NativeAgentError,
    storage::profiles::{load_or_migrate_store, save_store, seed_store},
};

const PROFILES_FILE: &str = "profiles.json";

mod model;

use model::ProfileOperationStatus;
pub(crate) use model::{
    Profile, ProfileApplicationResult, ProfileOperationResult, ProfileOrigin, ProfilePreferences,
    ProfilePreset, ProfileStore, PROFILE_SCHEMA_VERSION,
};

#[tauri::command]
pub(crate) async fn get_profiles<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<Profile>, NativeAgentError> {
    let path = profiles_path(&app)?;
    if path.exists() {
        return Ok(load_or_migrate_store(&path)?.profiles);
    }
    let devices = audio::get_audio_devices(app.clone()).await?;
    let cameras = camera::get_cameras(app.clone()).await?;
    let input = devices
        .iter()
        .find(|item| item.is_input() && item.is_default())
        .or_else(|| devices.iter().find(|item| item.is_input()));
    let output = devices
        .iter()
        .find(|item| item.is_output() && item.is_default())
        .or_else(|| devices.iter().find(|item| item.is_output()));
    let selected_camera = cameras
        .cameras()
        .iter()
        .find(|item| item.preferred())
        .or_else(|| cameras.cameras().first());
    Ok(seed_store(
        &path,
        input.map(|item| {
            (
                item.id(),
                item.can_set_default(),
                item.can_set_volume(),
                item.can_set_mute(),
            )
        }),
        output.map(|item| (item.id(), item.can_set_default())),
        selected_camera.map(|item| item.id()),
    )?
    .profiles)
}

#[tauri::command]
pub(crate) fn save_profile<R: Runtime>(
    app: AppHandle<R>,
    mut profile: Profile,
) -> Result<Vec<Profile>, NativeAgentError> {
    profile.origin = ProfileOrigin::Local;
    profile.preset = None;
    profile.active = false;
    if !profile.is_valid() {
        return Err(NativeAgentError::invalid_argument());
    }
    let path = profiles_path(&app)?;
    let mut store = load_or_migrate_store(&path)?;
    if store.active_profile_id.as_deref() == Some(profile.id.as_str()) {
        store.active_profile_id = None;
    }
    if let Some(index) = store.profiles.iter().position(|item| item.id == profile.id) {
        store.profiles[index] = profile;
    } else {
        store.profiles.push(profile);
    }
    save_store(&path, &store)?;
    Ok(store.profiles)
}

#[tauri::command]
pub(crate) fn export_profiles_recovery_copy<R: Runtime>(
    app: AppHandle<R>,
) -> Result<String, NativeAgentError> {
    let source = profiles_path(&app)?;
    let bytes = fs::read(&source).map_err(|_| NativeAgentError::process())?;
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| NativeAgentError::process())?
        .as_secs();
    let destination = source.with_file_name(format!("profiles-recovery-{timestamp}.json"));
    fs::write(&destination, bytes).map_err(|_| NativeAgentError::process())?;
    Ok(destination.to_string_lossy().into_owned())
}

#[tauri::command]
pub(crate) async fn apply_profile<R: Runtime>(
    app: AppHandle<R>,
    preview: State<'_, camera::CameraPreviewProcess>,
    profile_id: String,
) -> Result<ProfileApplicationResult, NativeAgentError> {
    let path = profiles_path(&app)?;
    let mut store = load_or_migrate_store(&path)?;
    let profile = store
        .profiles
        .iter()
        .find(|item| item.id == profile_id)
        .cloned()
        .ok_or_else(NativeAgentError::not_found)?;
    let devices = audio::get_audio_devices(app.clone()).await?;
    let cameras = camera::get_cameras(app.clone()).await?;
    let input = profile
        .preferences
        .audio_input_id
        .as_deref()
        .and_then(|id| {
            devices
                .iter()
                .find(|item| item.id() == id && item.is_input())
        });
    let output = profile
        .preferences
        .audio_output_id
        .as_deref()
        .and_then(|id| {
            devices
                .iter()
                .find(|item| item.id() == id && item.is_output())
        });
    let selected_camera = profile
        .preferences
        .camera_id
        .as_deref()
        .and_then(|id| cameras.cameras().iter().find(|item| item.id() == id));
    let mut operations = Vec::with_capacity(6);

    match (
        profile.preferences.set_audio_input_default,
        &profile.preferences.audio_input_id,
        input,
    ) {
        (false, _, _) => operations.push(skipped(
            "audio-input",
            ProfileOperationStatus::SkippedNotRequested,
        )),
        (true, None, _) | (true, Some(_), None) => operations.push(skipped(
            "audio-input",
            ProfileOperationStatus::MissingDevice,
        )),
        (true, Some(_), Some(device)) if !device.can_set_default() => operations.push(skipped(
            "audio-input",
            ProfileOperationStatus::SkippedUnsupported,
        )),
        (true, Some(id), Some(_)) => record(
            &mut operations,
            "audio-input",
            audio::set_default_audio_input(app.clone(), id.clone())
                .await
                .map(|_| ()),
        ),
    }
    match (&profile.preferences.audio_output_id, output) {
        (None, _) => operations.push(skipped(
            "audio-output",
            ProfileOperationStatus::SkippedNotRequested,
        )),
        (Some(_), None) => operations.push(skipped(
            "audio-output",
            ProfileOperationStatus::MissingDevice,
        )),
        (Some(_), Some(device)) if !device.can_set_default() => operations.push(skipped(
            "audio-output",
            ProfileOperationStatus::SkippedUnsupported,
        )),
        (Some(id), Some(_)) => record(
            &mut operations,
            "audio-output",
            audio::set_default_audio_output(app.clone(), id.clone())
                .await
                .map(|_| ()),
        ),
    }
    match (profile.preferences.input_volume, input) {
        (None, _) => operations.push(skipped(
            "input-volume",
            ProfileOperationStatus::SkippedNotRequested,
        )),
        (Some(_), None) => operations.push(skipped(
            "input-volume",
            ProfileOperationStatus::MissingDevice,
        )),
        (Some(_), Some(device)) if !device.can_set_volume() => operations.push(skipped(
            "input-volume",
            ProfileOperationStatus::SkippedUnsupported,
        )),
        (Some(value), Some(_)) => record(
            &mut operations,
            "input-volume",
            audio::set_audio_volume(
                app.clone(),
                profile.preferences.audio_input_id.clone().unwrap(),
                value,
            )
            .await
            .map(|_| ()),
        ),
    }
    match (profile.preferences.microphones_muted, input) {
        (None, _) => operations.push(skipped(
            "microphone-mute",
            ProfileOperationStatus::SkippedNotRequested,
        )),
        (Some(_), None) => operations.push(skipped(
            "microphone-mute",
            ProfileOperationStatus::MissingDevice,
        )),
        (Some(_), Some(device)) if !device.can_set_mute() => operations.push(skipped(
            "microphone-mute",
            ProfileOperationStatus::SkippedUnsupported,
        )),
        (Some(value), Some(_)) => record(
            &mut operations,
            "microphone-mute",
            audio::set_audio_mute(
                app.clone(),
                profile.preferences.audio_input_id.clone().unwrap(),
                value,
            )
            .await
            .map(|_| ()),
        ),
    }
    match (&profile.preferences.camera_id, selected_camera) {
        (None, _) => operations.push(skipped(
            "camera-preference",
            ProfileOperationStatus::SkippedNotRequested,
        )),
        (Some(_), None) => operations.push(skipped(
            "camera-preference",
            ProfileOperationStatus::MissingDevice,
        )),
        (Some(id), Some(_)) => record(
            &mut operations,
            "camera-preference",
            camera::set_preferred_camera(app.clone(), id.clone()).map(|_| ()),
        ),
    }
    if profile.preferences.stop_camera_preview {
        camera::stop_camera_preview_process(preview.inner());
        operations.push(success("camera-preview"));
    } else {
        operations.push(skipped(
            "camera-preview",
            ProfileOperationStatus::SkippedNotRequested,
        ));
    }

    let fully_applied = are_operations_fully_applied(&operations);
    if fully_applied {
        store.active_profile_id = Some(profile_id.clone());
        for item in &mut store.profiles {
            item.active = item.id == profile_id;
        }
        save_store(&path, &store)?;
    }
    Ok(ProfileApplicationResult {
        profile_id,
        fully_applied,
        operations,
        profiles: store.profiles,
    })
}

fn record(
    operations: &mut Vec<ProfileOperationResult>,
    name: &'static str,
    result: Result<(), NativeAgentError>,
) {
    operations.push(match result {
        Ok(()) => success(name),
        Err(error) => failure(name, error),
    });
}
fn success(operation: &'static str) -> ProfileOperationResult {
    ProfileOperationResult {
        operation,
        status: ProfileOperationStatus::Success,
        error: None,
    }
}
fn skipped(operation: &'static str, status: ProfileOperationStatus) -> ProfileOperationResult {
    ProfileOperationResult {
        operation,
        status,
        error: None,
    }
}
fn failure(operation: &'static str, error: NativeAgentError) -> ProfileOperationResult {
    ProfileOperationResult {
        operation,
        status: ProfileOperationStatus::Failed,
        error: Some(error),
    }
}

fn are_operations_fully_applied(operations: &[ProfileOperationResult]) -> bool {
    operations.iter().all(|item| {
        matches!(
            item.status,
            ProfileOperationStatus::Success | ProfileOperationStatus::SkippedNotRequested
        )
    })
}
fn profiles_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, NativeAgentError> {
    app.path()
        .app_data_dir()
        .map(|path| path.join(PROFILES_FILE))
        .map_err(|_| NativeAgentError::process())
}

#[cfg(test)]
mod tests {
    use super::{
        are_operations_fully_applied, skipped, Profile, ProfileOperationStatus, ProfileOrigin,
        ProfilePreferences, ProfilePreset, ProfileStore, PROFILE_SCHEMA_VERSION,
    };
    use crate::storage::profiles::{load_or_migrate_store, save_store, seed_store};
    use std::{
        fs,
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };
    fn test_path(name: &str) -> PathBuf {
        std::env::temp_dir()
            .join(format!(
                "harmoni-{name}-{}",
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ))
            .join("profiles.json")
    }

    #[test]
    fn requested_unsupported_operation_is_not_fully_applied() {
        let operations = vec![skipped(
            "audio-input",
            ProfileOperationStatus::SkippedUnsupported,
        )];

        assert!(!are_operations_fully_applied(&operations));
    }

    #[test]
    fn seeds_capability_aware_profiles_once() {
        let path = test_path("seed-v2");
        let seeded = seed_store(
            &path,
            Some(("input", true, true, true)),
            Some(("output", true)),
            Some("camera"),
        )
        .unwrap();
        let loaded = seed_store(&path, None, None, None).unwrap();
        assert_eq!(seeded, loaded);
        assert_eq!(loaded.version, PROFILE_SCHEMA_VERSION);
        let private = loaded
            .profiles
            .iter()
            .find(|item| item.preset == Some(ProfilePreset::Private))
            .unwrap();
        assert!(private.preferences.stop_camera_preview);
        assert_eq!(private.preferences.microphones_muted, Some(true));
    }

    #[test]
    fn corrupt_storage_is_not_overwritten() {
        let path = test_path("corrupt-v2");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, b"not-json").unwrap();
        assert!(load_or_migrate_store(&path).is_err());
        assert_eq!(fs::read(path).unwrap(), b"not-json");
    }

    #[test]
    fn migrates_v1_once_and_keeps_a_backup() {
        let path = test_path("migrate-v1");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        let legacy = serde_json::json!({"version":1,"activeProfileId":null,"profiles":[{"id":"custom","name":"Custom","description":"Kept","origin":"local","preset":null,"active":false,"preferences":{"audioInputId":"in","audioOutputId":"out","cameraId":"cam","inputVolume":42,"microphonesMuted":true,"cameraEnabled":false}}]});
        fs::write(&path, serde_json::to_vec(&legacy).unwrap()).unwrap();
        let migrated = load_or_migrate_store(&path).unwrap();
        assert_eq!(migrated.version, 2);
        assert_eq!(migrated.profiles[0].name, "Custom");
        assert!(path.with_extension("v1.backup.json").exists());
        assert_eq!(load_or_migrate_store(&path).unwrap(), migrated);
    }

    #[test]
    fn rejects_an_unknown_schema_version() {
        let path = test_path("version-v2");
        let store = ProfileStore {
            version: PROFILE_SCHEMA_VERSION + 1,
            profiles: vec![],
            active_profile_id: None,
        };
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, serde_json::to_vec(&store).unwrap()).unwrap();
        assert!(load_or_migrate_store(&path).is_err());
        assert!(save_store(&path, &store).is_err());
    }

    #[test]
    fn volume_or_mute_requires_an_input_selection() {
        let profile = Profile {
            id: "x".into(),
            name: "X".into(),
            description: None,
            origin: ProfileOrigin::Local,
            preset: None,
            active: false,
            preferences: ProfilePreferences {
                input_volume: Some(10),
                ..Default::default()
            },
        };
        assert!(!profile.is_valid());
    }

    #[test]
    fn local_profile_survives_a_fresh_store_read() {
        let path = test_path("persist-v2");
        let mut store = seed_store(&path, None, None, None).unwrap();
        store.profiles.push(Profile {
            id: "focus".into(),
            name: "Focus".into(),
            description: Some("A saved local setup".into()),
            origin: ProfileOrigin::Local,
            preset: None,
            active: false,
            preferences: ProfilePreferences {
                stop_camera_preview: true,
                ..Default::default()
            },
        });
        save_store(&path, &store).unwrap();
        let restored = load_or_migrate_store(&path).unwrap();
        assert_eq!(restored.profiles.last().unwrap().name, "Focus");
    }
}
