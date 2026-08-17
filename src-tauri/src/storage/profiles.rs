use std::{fs, path::Path};

use serde::Deserialize;

use crate::{
    commands::profiles::{
        Profile, ProfileOrigin, ProfilePreferences, ProfilePreset, ProfileStore,
        PROFILE_SCHEMA_VERSION,
    },
    sidecar::NativeAgentError,
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LegacyStore {
    version: u16,
    active_profile_id: Option<String>,
    profiles: Vec<LegacyProfile>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LegacyProfile {
    id: String,
    name: String,
    description: Option<String>,
    origin: String,
    preset: Option<String>,
    active: bool,
    preferences: LegacyPreferences,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LegacyPreferences {
    audio_input_id: String,
    audio_output_id: String,
    camera_id: String,
    input_volume: u8,
    microphones_muted: bool,
    camera_enabled: bool,
}

pub(crate) fn load_or_migrate_store(path: &Path) -> Result<ProfileStore, NativeAgentError> {
    let bytes = fs::read(path).map_err(|_| NativeAgentError::process())?;
    let version = serde_json::from_slice::<serde_json::Value>(&bytes)
        .ok()
        .and_then(|value| value.get("version").and_then(|value| value.as_u64()))
        .ok_or_else(NativeAgentError::protocol)?;
    if version == u64::from(PROFILE_SCHEMA_VERSION) {
        let store: ProfileStore =
            serde_json::from_slice(&bytes).map_err(|_| NativeAgentError::protocol())?;
        return store
            .is_valid()
            .then_some(store)
            .ok_or_else(NativeAgentError::protocol);
    }
    if version != 1 {
        return Err(NativeAgentError::protocol());
    }
    let legacy: LegacyStore =
        serde_json::from_slice(&bytes).map_err(|_| NativeAgentError::protocol())?;
    if legacy.version != 1 {
        return Err(NativeAgentError::protocol());
    }
    let profiles = legacy
        .profiles
        .into_iter()
        .map(|item| {
            Ok(Profile {
                id: item.id,
                name: item.name,
                description: item.description,
                origin: match item.origin.as_str() {
                    "local" => ProfileOrigin::Local,
                    "seeded" => ProfileOrigin::Seeded,
                    _ => return Err(NativeAgentError::protocol()),
                },
                preset: match item.preset.as_deref() {
                    None => None,
                    Some("private") => Some(ProfilePreset::Private),
                    Some("recording") => Some(ProfilePreset::Recording),
                    Some("work") => Some(ProfilePreset::Work),
                    Some(_) => return Err(NativeAgentError::protocol()),
                },
                active: item.active,
                preferences: ProfilePreferences {
                    audio_input_id: Some(item.preferences.audio_input_id),
                    set_audio_input_default: true,
                    audio_output_id: Some(item.preferences.audio_output_id),
                    camera_id: Some(item.preferences.camera_id),
                    input_volume: Some(item.preferences.input_volume),
                    microphones_muted: Some(item.preferences.microphones_muted),
                    stop_camera_preview: !item.preferences.camera_enabled,
                },
            })
        })
        .collect::<Result<Vec<_>, NativeAgentError>>()?;
    let store = ProfileStore {
        version: PROFILE_SCHEMA_VERSION,
        active_profile_id: legacy.active_profile_id,
        profiles,
    };
    if !store.is_valid() {
        return Err(NativeAgentError::protocol());
    }
    let backup = path.with_extension("v1.backup.json");
    if !backup.exists() {
        fs::write(&backup, &bytes).map_err(|_| NativeAgentError::process())?;
    }
    save_store(path, &store)?;
    Ok(store)
}

pub(crate) fn save_store(path: &Path, store: &ProfileStore) -> Result<(), NativeAgentError> {
    if store.version != PROFILE_SCHEMA_VERSION || !store.is_valid() {
        return Err(NativeAgentError::invalid_argument());
    }
    let parent = path.parent().ok_or_else(NativeAgentError::process)?;
    fs::create_dir_all(parent).map_err(|_| NativeAgentError::process())?;
    let temporary = path.with_extension("json.tmp");
    let bytes = serde_json::to_vec_pretty(store).map_err(|_| NativeAgentError::protocol())?;
    fs::write(&temporary, bytes).map_err(|_| NativeAgentError::process())?;
    fs::rename(temporary, path).map_err(|_| NativeAgentError::process())
}

pub(crate) fn seed_store(
    path: &Path,
    input: Option<(&str, bool, bool, bool)>,
    output: Option<(&str, bool)>,
    camera: Option<&str>,
) -> Result<ProfileStore, NativeAgentError> {
    if path.exists() {
        return load_or_migrate_store(path);
    }
    let preferences = |volume: u8, muted: bool, private: bool| ProfilePreferences {
        audio_input_id: input.map(|item| item.0.to_owned()),
        set_audio_input_default: !private && input.is_some_and(|item| item.1),
        audio_output_id: if private {
            None
        } else {
            output
                .filter(|(_, can_default)| *can_default)
                .map(|item| item.0.to_owned())
        },
        camera_id: if private {
            None
        } else {
            camera.map(str::to_owned)
        },
        input_volume: input
            .filter(|(_, _, can_volume, _)| *can_volume)
            .map(|_| volume),
        microphones_muted: input.filter(|(_, _, _, can_mute)| *can_mute).map(|_| muted),
        stop_camera_preview: private,
    };
    let profile = |preset: ProfilePreset, volume: u8, muted: bool, private: bool| Profile {
        id: match preset {
            ProfilePreset::Private => "private",
            ProfilePreset::Recording => "recording",
            ProfilePreset::Work => "work",
        }
        .to_owned(),
        name: match preset {
            ProfilePreset::Private => "private",
            ProfilePreset::Recording => "recording",
            ProfilePreset::Work => "work",
        }
        .to_owned(),
        description: None,
        origin: ProfileOrigin::Seeded,
        preset: Some(preset),
        active: false,
        preferences: preferences(volume, muted, private),
    };
    let store = ProfileStore {
        version: PROFILE_SCHEMA_VERSION,
        active_profile_id: None,
        profiles: vec![
            profile(ProfilePreset::Work, 65, false, false),
            profile(ProfilePreset::Recording, 80, false, false),
            profile(ProfilePreset::Private, 0, true, true),
        ],
    };
    save_store(path, &store)?;
    Ok(store)
}
