use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Runtime};

use crate::sidecar::{parse_agent_result, request_agent_output, AgentOutput, NativeAgentError};

const CAMERA_DEVICES_METHOD: &str = "camera.devices";

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
}

#[tauri::command]
pub(crate) async fn get_cameras<R: Runtime>(
    app: AppHandle<R>,
) -> Result<CameraDiscovery, NativeAgentError> {
    let output =
        request_agent_output(&app, CAMERA_DEVICES_METHOD, "camera-devices", json!({})).await?;
    parse_camera_discovery(&output)
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
    use super::{get_cameras, parse_camera_discovery};
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
}
