use std::{
    collections::HashSet,
    fs,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Manager, Runtime};

use crate::sidecar::{parse_agent_result, request_agent_output, AgentOutput, NativeAgentError};

const CAMERA_DEVICES_METHOD: &str = "camera.devices";
const CAMERA_PREFERENCES_FILE: &str = "camera-preferences.json";
const SET_CAMERA_EXPOSURE_METHOD: &str = "camera.setExposure";
const SET_CAMERA_ZOOM_METHOD: &str = "camera.setZoom";

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum CameraAuthorization {
    Authorized,
    Denied,
    NotDetermined,
    Restricted,
    Unknown,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum CameraTransport {
    BuiltIn,
    Continuity,
    External,
    Unknown,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CameraFormat {
    width: u32,
    height: u32,
    frame_rate: f64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CameraCapability {
    min: f64,
    max: f64,
    value: f64,
    can_control: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CameraDevice {
    id: String,
    name: String,
    transport: CameraTransport,
    preferred: bool,
    formats: Vec<CameraFormat>,
    zoom: Option<CameraCapability>,
    exposure: Option<CameraCapability>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CameraDiscovery {
    authorization: CameraAuthorization,
    cameras: Vec<CameraDevice>,
    #[serde(default)]
    preferred_camera_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CameraPreference {
    preferred_camera_id: Option<String>,
}

#[derive(Deserialize)]
struct CameraMutationResult {
    camera: CameraDevice,
}

#[tauri::command]
pub(crate) async fn get_cameras<R: Runtime>(
    app: AppHandle<R>,
) -> Result<CameraDiscovery, NativeAgentError> {
    let output =
        request_agent_output(&app, CAMERA_DEVICES_METHOD, "camera-devices", json!({})).await?;
    let mut discovery = parse_camera_discovery(&output)?;
    let preferred = load_preferred_camera(&camera_preferences_path(&app)?)?;
    apply_preferred_camera(&mut discovery, preferred);
    Ok(discovery)
}

#[tauri::command]
pub(crate) fn set_preferred_camera<R: Runtime>(
    app: AppHandle<R>,
    camera_id: String,
) -> Result<CameraPreference, NativeAgentError> {
    validate_camera_id(&camera_id)?;
    save_preferred_camera(&camera_preferences_path(&app)?, &camera_id)?;
    Ok(CameraPreference {
        preferred_camera_id: Some(camera_id),
    })
}

#[tauri::command]
pub(crate) fn reset_preferred_camera<R: Runtime>(
    app: AppHandle<R>,
) -> Result<CameraPreference, NativeAgentError> {
    clear_preferred_camera(&camera_preferences_path(&app)?)?;
    Ok(CameraPreference {
        preferred_camera_id: None,
    })
}

#[tauri::command]
pub(crate) async fn set_camera_zoom<R: Runtime>(
    app: AppHandle<R>,
    camera_id: String,
    value: f64,
) -> Result<CameraDevice, NativeAgentError> {
    mutate_camera(&app, SET_CAMERA_ZOOM_METHOD, camera_id, value).await
}

#[tauri::command]
pub(crate) async fn set_camera_exposure<R: Runtime>(
    app: AppHandle<R>,
    camera_id: String,
    value: f64,
) -> Result<CameraDevice, NativeAgentError> {
    mutate_camera(&app, SET_CAMERA_EXPOSURE_METHOD, camera_id, value).await
}

async fn mutate_camera<R: Runtime>(
    app: &AppHandle<R>,
    method: &str,
    camera_id: String,
    value: f64,
) -> Result<CameraDevice, NativeAgentError> {
    validate_camera_id(&camera_id)?;
    validate_control_value(value)?;
    let output = request_agent_output(
        app,
        method,
        "camera-mutation",
        json!({ "cameraId": camera_id, "value": value }),
    )
    .await?;
    let result: CameraMutationResult = parse_agent_result(&output)?;
    if result.camera.id != camera_id || invalid_camera(&result.camera) {
        return Err(NativeAgentError::protocol());
    }
    Ok(result.camera)
}

fn parse_camera_discovery(output: &AgentOutput) -> Result<CameraDiscovery, NativeAgentError> {
    let result: CameraDiscovery = parse_agent_result(output)?;
    let identifiers: HashSet<_> = result
        .cameras
        .iter()
        .map(|camera| camera.id.as_str())
        .collect();
    let preferred_count = result
        .cameras
        .iter()
        .filter(|camera| camera.preferred)
        .count();

    if identifiers.len() != result.cameras.len()
        || preferred_count > 1
        || result.cameras.len() > 128
        || result.cameras.iter().any(invalid_camera)
    {
        return Err(NativeAgentError::protocol());
    }
    Ok(result)
}

fn apply_preferred_camera(discovery: &mut CameraDiscovery, preferred: Option<String>) {
    for camera in &mut discovery.cameras {
        camera.preferred = preferred.as_deref() == Some(camera.id.as_str());
    }
    discovery.preferred_camera_id = preferred;
}

fn camera_preferences_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, NativeAgentError> {
    app.path()
        .app_data_dir()
        .map(|directory| directory.join(CAMERA_PREFERENCES_FILE))
        .map_err(|_| NativeAgentError::process())
}

fn load_preferred_camera(path: &Path) -> Result<Option<String>, NativeAgentError> {
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

fn save_preferred_camera(path: &Path, camera_id: &str) -> Result<(), NativeAgentError> {
    validate_camera_id(camera_id)?;
    write_camera_preference(path, Some(camera_id))
}

fn clear_preferred_camera(path: &Path) -> Result<(), NativeAgentError> {
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

fn validate_camera_id(camera_id: &str) -> Result<(), NativeAgentError> {
    if camera_id.is_empty() || camera_id.len() > 1024 {
        return Err(NativeAgentError::invalid_argument());
    }
    Ok(())
}

fn validate_control_value(value: f64) -> Result<(), NativeAgentError> {
    if !value.is_finite() {
        return Err(NativeAgentError::invalid_argument());
    }
    Ok(())
}

fn invalid_camera(camera: &CameraDevice) -> bool {
    camera.id.is_empty()
        || camera.id.len() > 1024
        || camera.name.trim().is_empty()
        || camera.name.len() > 512
        || camera.formats.is_empty()
        || camera.formats.len() > 512
        || camera.formats.iter().any(|format| {
            format.width == 0
                || format.width > 16_384
                || format.height == 0
                || format.height > 16_384
                || !format.frame_rate.is_finite()
                || format.frame_rate <= 0.0
                || format.frame_rate > 1_000.0
        })
        || camera.zoom.as_ref().is_some_and(invalid_capability)
        || camera.exposure.as_ref().is_some_and(invalid_capability)
}

fn invalid_capability(capability: &CameraCapability) -> bool {
    !capability.min.is_finite()
        || !capability.max.is_finite()
        || !capability.value.is_finite()
        || capability.min > capability.max
        || capability.value < capability.min
        || capability.value > capability.max
        || (capability.can_control && capability.min == capability.max)
}

#[cfg(test)]
mod tests {
    use std::{
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };

    use super::{
        apply_preferred_camera, clear_preferred_camera, get_cameras, load_preferred_camera,
        parse_camera_discovery, save_preferred_camera, validate_control_value,
    };
    use crate::sidecar::AgentOutput;

    #[test]
    fn accepts_a_valid_camera_inventory() {
        let output = AgentOutput {
            request_id: "camera-test".to_owned(),
            line: br#"{
                "id":"camera-test",
                "version":1,
                "result":{
                    "authorization":"authorized",
                    "cameras":[{
                        "id":"camera-uid",
                        "name":"Studio Camera",
                        "transport":"external",
                        "preferred":true,
                        "formats":[{"width":1920,"height":1080,"frameRate":30.0}],
                        "zoom":{"min":1.0,"max":3.0,"value":1.25,"canControl":true},
                        "exposure":{"min":-2.0,"max":2.0,"value":0.0,"canControl":true}
                    }]
                }
            }"#
            .to_vec(),
        };

        let inventory =
            parse_camera_discovery(&output).expect("valid camera discovery should be accepted");
        assert_eq!(inventory.cameras.len(), 1);
        assert_eq!(inventory.cameras[0].id, "camera-uid");
    }

    #[test]
    fn rejects_invalid_formats_and_capability_ranges() {
        let output = AgentOutput {
            request_id: "camera-test".to_owned(),
            line: br#"{
                "id":"camera-test",
                "version":1,
                "result":{
                    "authorization":"authorized",
                    "cameras":[{
                        "id":"camera-uid",
                        "name":"Studio Camera",
                        "transport":"external",
                        "preferred":true,
                        "formats":[{"width":0,"height":1080,"frameRate":30.0}],
                        "zoom":{"min":3.0,"max":1.0,"value":2.0,"canControl":true},
                        "exposure":null
                    }]
                }
            }"#
            .to_vec(),
        };

        assert!(parse_camera_discovery(&output).is_err());
    }

    #[test]
    fn returns_real_camera_inventory_without_capture() {
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_shell::init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .expect("mock Tauri application should build");

        let discovery = tauri::async_runtime::block_on(get_cameras(app.handle().clone()))
            .expect("camera discovery should return a valid inventory");
        assert!(discovery.cameras.iter().all(|camera| !camera.id.is_empty()));
    }

    #[test]
    fn preferred_camera_survives_a_fresh_read_and_can_be_reset() {
        let directory = unique_test_directory();
        let path = directory.join("camera-preferences.json");

        save_preferred_camera(&path, "camera-stable-id").expect("preference should be persisted");
        assert_eq!(
            load_preferred_camera(&path).expect("preference should load"),
            Some("camera-stable-id".to_owned())
        );

        clear_preferred_camera(&path).expect("preference should reset");
        assert_eq!(
            load_preferred_camera(&path).expect("empty preference should load"),
            None
        );
        std::fs::remove_dir_all(directory).expect("test directory should be removable");
    }

    #[test]
    fn disconnected_preference_is_preserved_without_marking_another_camera() {
        let output = valid_camera_output();
        let mut discovery = parse_camera_discovery(&output).expect("inventory should parse");

        apply_preferred_camera(&mut discovery, Some("disconnected-camera".to_owned()));

        assert_eq!(
            discovery.preferred_camera_id.as_deref(),
            Some("disconnected-camera")
        );
        assert!(discovery.cameras.iter().all(|camera| !camera.preferred));
    }

    #[test]
    fn rejects_non_finite_control_values() {
        assert!(validate_control_value(f64::NAN).is_err());
        assert!(validate_control_value(f64::INFINITY).is_err());
        assert!(validate_control_value(1.0).is_ok());
    }

    fn valid_camera_output() -> AgentOutput {
        AgentOutput {
            request_id: "camera-test".to_owned(),
            line: br#"{
                "id":"camera-test",
                "version":1,
                "result":{
                    "authorization":"authorized",
                    "cameras":[{
                        "id":"camera-uid",
                        "name":"Studio Camera",
                        "transport":"external",
                        "preferred":false,
                        "formats":[{"width":1920,"height":1080,"frameRate":30.0}],
                        "zoom":null,
                        "exposure":null
                    }]
                }
            }"#
            .to_vec(),
        }
    }

    fn unique_test_directory() -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be after epoch")
            .as_nanos();
        std::env::temp_dir().join(format!("harmoni-camera-preference-{suffix}"))
    }
}
