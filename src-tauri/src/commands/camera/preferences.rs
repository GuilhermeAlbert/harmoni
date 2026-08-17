use std::{
    fs,
    path::{Path, PathBuf},
};

use tauri::{AppHandle, Manager, Runtime};

use super::{CameraDiscovery, CameraPreference};
use crate::sidecar::NativeAgentError;

const CAMERA_PREFERENCES_FILE: &str = "camera-preferences.json";

pub(super) fn apply_preferred_camera(discovery: &mut CameraDiscovery, preferred: Option<String>) {
    for camera in &mut discovery.cameras {
        camera.preferred = preferred.as_deref() == Some(camera.id.as_str());
    }
    discovery.preferred_camera_id = preferred;
}

pub(super) fn camera_preferences_path<R: Runtime>(
    app: &AppHandle<R>,
) -> Result<PathBuf, NativeAgentError> {
    app.path()
        .app_data_dir()
        .map(|directory| directory.join(CAMERA_PREFERENCES_FILE))
        .map_err(|_| NativeAgentError::process())
}

pub(super) fn load_preferred_camera(path: &Path) -> Result<Option<String>, NativeAgentError> {
    if !path.exists() {
        return Ok(None);
    }
    let bytes = fs::read(path).map_err(|_| NativeAgentError::process())?;
    let preference: CameraPreference =
        serde_json::from_slice(&bytes).map_err(|_| NativeAgentError::protocol())?;
    if let Some(camera_id) = preference.preferred_camera_id.as_deref() {
        validate_camera_id(camera_id)?;
    }
    Ok(preference.preferred_camera_id)
}

pub(super) fn save_preferred_camera(path: &Path, camera_id: &str) -> Result<(), NativeAgentError> {
    validate_camera_id(camera_id)?;
    write_camera_preference(path, Some(camera_id))
}

pub(super) fn clear_preferred_camera(path: &Path) -> Result<(), NativeAgentError> {
    write_camera_preference(path, None)
}

fn write_camera_preference(path: &Path, camera_id: Option<&str>) -> Result<(), NativeAgentError> {
    let parent = path.parent().ok_or_else(NativeAgentError::process)?;
    fs::create_dir_all(parent).map_err(|_| NativeAgentError::process())?;
    let temporary = path.with_extension("json.tmp");
    let bytes = serde_json::to_vec(&CameraPreference {
        preferred_camera_id: camera_id.map(str::to_owned),
    })
    .map_err(|_| NativeAgentError::protocol())?;
    fs::write(&temporary, bytes).map_err(|_| NativeAgentError::process())?;
    fs::rename(&temporary, path).map_err(|_| NativeAgentError::process())
}

pub(super) fn validate_camera_id(camera_id: &str) -> Result<(), NativeAgentError> {
    if camera_id.is_empty() || camera_id.len() > 1024 {
        return Err(NativeAgentError::invalid_argument());
    }
    Ok(())
}
