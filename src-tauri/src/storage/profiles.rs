use std::{fs, path::Path};

use crate::{
    commands::profiles::{Profile, ProfilePreferences, ProfileStore, PROFILE_SCHEMA_VERSION},
    sidecar::NativeAgentError,
};

pub(crate) fn load_store(path: &Path) -> Result<ProfileStore, NativeAgentError> {
    let bytes = fs::read(path).map_err(|_| NativeAgentError::process())?;
    let store: ProfileStore =
        serde_json::from_slice(&bytes).map_err(|_| NativeAgentError::protocol())?;
    if store.version != PROFILE_SCHEMA_VERSION || !store.is_valid() {
        return Err(NativeAgentError::protocol());
    }
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
    input: &str,
    output: &str,
    camera: &str,
) -> Result<ProfileStore, NativeAgentError> {
    if path.exists() {
        return load_store(path);
    }
    let profile = |id: &str, volume: u8, muted: bool, camera_enabled: bool| Profile {
        id: id.to_owned(),
        name: id.to_owned(),
        description: None,
        origin: "seeded".to_owned(),
        preset: Some(id.to_owned()),
        active: false,
        preferences: ProfilePreferences {
            audio_input_id: input.to_owned(),
            audio_output_id: output.to_owned(),
            camera_id: camera.to_owned(),
            input_volume: volume,
            microphones_muted: muted,
            camera_enabled,
        },
    };
    let store = ProfileStore {
        version: PROFILE_SCHEMA_VERSION,
        active_profile_id: None,
        profiles: vec![
            profile("work", 65, false, true),
            profile("recording", 80, false, true),
            profile("private", 0, true, false),
        ],
    };
    save_store(path, &store)?;
    Ok(store)
}
