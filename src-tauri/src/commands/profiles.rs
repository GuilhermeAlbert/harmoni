use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime};

use crate::{
    commands::{audio, camera},
    sidecar::NativeAgentError,
    storage::profiles::{load_store, save_store, seed_store},
};

pub(crate) const PROFILE_SCHEMA_VERSION: u16 = 1;
const PROFILES_FILE: &str = "profiles.json";

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfilePreferences {
    pub(crate) audio_input_id: String,
    pub(crate) audio_output_id: String,
    pub(crate) camera_id: String,
    pub(crate) input_volume: u8,
    pub(crate) microphones_muted: bool,
    pub(crate) camera_enabled: bool,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Profile {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) description: Option<String>,
    pub(crate) origin: String,
    pub(crate) preset: Option<String>,
    pub(crate) active: bool,
    pub(crate) preferences: ProfilePreferences,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfileStore {
    pub(crate) version: u16,
    pub(crate) active_profile_id: Option<String>,
    pub(crate) profiles: Vec<Profile>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfileOperationResult {
    operation: &'static str,
    status: &'static str,
    error: Option<NativeAgentError>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfileApplicationResult {
    profile_id: String,
    fully_applied: bool,
    operations: Vec<ProfileOperationResult>,
    profiles: Vec<Profile>,
}

impl ProfileStore {
    pub(crate) fn is_valid(&self) -> bool {
        self.profiles.len() <= 256
            && self.profiles.iter().all(Profile::is_valid)
            && self.profiles.iter().enumerate().all(|(index, profile)| {
                self.profiles[..index]
                    .iter()
                    .all(|other| other.id != profile.id)
            })
            && self.active_profile_id.as_ref().is_none_or(|id| {
                self.profiles
                    .iter()
                    .any(|profile| &profile.id == id && profile.active)
            })
            && self
                .profiles
                .iter()
                .filter(|profile| profile.active)
                .count()
                <= 1
    }
}

impl Profile {
    fn is_valid(&self) -> bool {
        !self.id.is_empty()
            && self.id.len() <= 128
            && !self.name.trim().is_empty()
            && self.name.len() <= 40
            && self
                .description
                .as_ref()
                .is_none_or(|value| value.len() <= 120)
            && matches!(self.origin.as_str(), "seeded" | "local")
            && self.preferences.input_volume <= 100
            && [
                &self.preferences.audio_input_id,
                &self.preferences.audio_output_id,
                &self.preferences.camera_id,
            ]
            .iter()
            .all(|id| !id.is_empty() && id.len() <= 1024)
    }
}

#[tauri::command]
pub(crate) async fn get_profiles<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<Profile>, NativeAgentError> {
    let path = profiles_path(&app)?;
    if path.exists() {
        return Ok(load_store(&path)?.profiles);
    }
    let devices = audio::get_audio_devices(app.clone()).await?;
    let cameras = camera::get_cameras(app.clone()).await?;
    let input = devices
        .iter()
        .find(|device| device.is_input() && device.is_default())
        .or_else(|| devices.iter().find(|device| device.is_input()))
        .map_or("unavailable:input", |device| device.id());
    let output = devices
        .iter()
        .find(|device| device.is_output() && device.is_default())
        .or_else(|| devices.iter().find(|device| device.is_output()))
        .map_or("unavailable:output", |device| device.id());
    let camera_id = cameras
        .cameras()
        .iter()
        .find(|camera| camera.preferred())
        .or_else(|| cameras.cameras().first())
        .map_or("unavailable:camera", |camera| camera.id());
    let store = seed_store(&path, input, output, camera_id)?;
    Ok(store.profiles)
}

#[tauri::command]
pub(crate) fn save_profile<R: Runtime>(
    app: AppHandle<R>,
    mut profile: Profile,
) -> Result<Vec<Profile>, NativeAgentError> {
    profile.origin = "local".to_owned();
    profile.preset = None;
    profile.active = false;
    if !profile.is_valid() {
        return Err(NativeAgentError::invalid_argument());
    }
    let path = profiles_path(&app)?;
    let mut store = load_store(&path)?;
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
pub(crate) async fn apply_profile<R: Runtime>(
    app: AppHandle<R>,
    profile_id: String,
) -> Result<ProfileApplicationResult, NativeAgentError> {
    let path = profiles_path(&app)?;
    let mut store = load_store(&path)?;
    let profile = store
        .profiles
        .iter()
        .find(|profile| profile.id == profile_id)
        .cloned()
        .ok_or_else(NativeAgentError::not_found)?;
    let mut operations = Vec::new();
    record(
        &mut operations,
        "audio-input",
        audio::set_default_audio_input(app.clone(), profile.preferences.audio_input_id.clone())
            .await
            .map(|_| ()),
    );
    record(
        &mut operations,
        "audio-output",
        audio::set_default_audio_output(app.clone(), profile.preferences.audio_output_id.clone())
            .await
            .map(|_| ()),
    );
    record(
        &mut operations,
        "input-volume",
        audio::set_audio_volume(
            app.clone(),
            profile.preferences.audio_input_id.clone(),
            profile.preferences.input_volume,
        )
        .await
        .map(|_| ()),
    );
    record(
        &mut operations,
        "microphone-mute",
        audio::set_audio_mute(
            app.clone(),
            profile.preferences.audio_input_id.clone(),
            profile.preferences.microphones_muted,
        )
        .await
        .map(|_| ()),
    );
    record(
        &mut operations,
        "camera-preference",
        camera::set_preferred_camera(app.clone(), profile.preferences.camera_id.clone())
            .map(|_| ()),
    );
    if profile.preferences.camera_enabled {
        operations.push(success("camera-privacy"));
    } else {
        operations.push(failure("camera-privacy", NativeAgentError::unsupported()));
    }
    let fully_applied = operations
        .iter()
        .all(|operation| operation.status == "success");
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
        status: "success",
        error: None,
    }
}
fn failure(operation: &'static str, error: NativeAgentError) -> ProfileOperationResult {
    ProfileOperationResult {
        operation,
        status: "failed",
        error: Some(error),
    }
}
fn profiles_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, NativeAgentError> {
    app.path()
        .app_data_dir()
        .map(|path| path.join(PROFILES_FILE))
        .map_err(|_| NativeAgentError::process())
}

#[cfg(test)]
mod tests {
    use super::{ProfileStore, PROFILE_SCHEMA_VERSION};
    use crate::storage::profiles::{load_store, save_store, seed_store};
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
    fn seeds_three_versioned_profiles_once() {
        let path = test_path("seed");
        let seeded = seed_store(&path, "input", "output", "camera").unwrap();
        let loaded = seed_store(&path, "other", "other", "other").unwrap();
        assert_eq!(seeded.profiles.len(), 3);
        assert_eq!(loaded, seeded);
        assert_eq!(loaded.version, PROFILE_SCHEMA_VERSION);
    }
    #[test]
    fn corrupt_storage_is_not_overwritten() {
        let path = test_path("corrupt");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, b"not-json").unwrap();
        assert!(load_store(&path).is_err());
        assert!(seed_store(&path, "input", "output", "camera").is_err());
        assert_eq!(fs::read(path).unwrap(), b"not-json");
    }
    #[test]
    fn rejects_an_unknown_schema_version() {
        let path = test_path("version");
        let store = ProfileStore {
            version: PROFILE_SCHEMA_VERSION + 1,
            profiles: vec![],
            active_profile_id: None,
        };
        let parent = path.parent().unwrap();
        fs::create_dir_all(parent).unwrap();
        fs::write(&path, serde_json::to_vec(&store).unwrap()).unwrap();
        assert!(load_store(&path).is_err());
        assert!(save_store(&path, &store).is_err());
    }
}
