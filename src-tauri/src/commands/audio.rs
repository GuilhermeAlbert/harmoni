use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Runtime};

use crate::sidecar::{parse_agent_result, request_agent_output, AgentOutput, NativeAgentError};

const AUDIO_DEVICES_METHOD: &str = "audio.devices";
const SET_DEFAULT_INPUT_METHOD: &str = "audio.setDefaultInput";
const SET_DEFAULT_OUTPUT_METHOD: &str = "audio.setDefaultOutput";
const SET_MUTE_METHOD: &str = "audio.setMute";
const SET_VOLUME_METHOD: &str = "audio.setVolume";

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum AudioDirection {
    Input,
    Output,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum AudioTransport {
    Airplay,
    Bluetooth,
    BuiltIn,
    Hdmi,
    Unknown,
    Usb,
    Virtual,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AudioDevice {
    id: String,
    uid: String,
    name: String,
    direction: AudioDirection,
    transport: AudioTransport,
    #[serde(rename = "isDefault")]
    is_default: bool,
    volume: Option<u8>,
    muted: Option<bool>,
    can_read_volume: bool,
    can_read_mute: bool,
    can_set_volume: bool,
    can_set_mute: bool,
    can_set_default: bool,
}

#[derive(Deserialize)]
struct AudioDiscoveryResult {
    devices: Vec<AudioDevice>,
}

#[derive(Deserialize)]
struct AudioMutationResult {
    device: AudioDevice,
}

#[tauri::command]
pub(crate) async fn get_audio_devices<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<AudioDevice>, NativeAgentError> {
    let output =
        request_agent_output(&app, AUDIO_DEVICES_METHOD, "audio-devices", json!({})).await?;
    parse_audio_devices(&output)
}

#[tauri::command]
pub(crate) async fn set_default_audio_input<R: Runtime>(
    app: AppHandle<R>,
    device_id: String,
) -> Result<AudioDevice, NativeAgentError> {
    mutate_audio_device(&app, SET_DEFAULT_INPUT_METHOD, device_id, json!({})).await
}

#[tauri::command]
pub(crate) async fn set_default_audio_output<R: Runtime>(
    app: AppHandle<R>,
    device_id: String,
) -> Result<AudioDevice, NativeAgentError> {
    mutate_audio_device(&app, SET_DEFAULT_OUTPUT_METHOD, device_id, json!({})).await
}

#[tauri::command]
pub(crate) async fn set_audio_volume<R: Runtime>(
    app: AppHandle<R>,
    device_id: String,
    volume: u8,
) -> Result<AudioDevice, NativeAgentError> {
    validate_volume(volume)?;
    mutate_audio_device(&app, SET_VOLUME_METHOD, device_id, json!({ "volume": volume })).await
}

#[tauri::command]
pub(crate) async fn set_audio_mute<R: Runtime>(
    app: AppHandle<R>,
    device_id: String,
    muted: bool,
) -> Result<AudioDevice, NativeAgentError> {
    mutate_audio_device(&app, SET_MUTE_METHOD, device_id, json!({ "muted": muted })).await
}

async fn mutate_audio_device<R: Runtime>(
    app: &AppHandle<R>,
    method: &str,
    device_id: String,
    mut params: serde_json::Value,
) -> Result<AudioDevice, NativeAgentError> {
    validate_device_id(&device_id)?;
    params["deviceId"] = json!(device_id);
    let output = request_agent_output(app, method, "audio-mutation", params).await?;
    parse_audio_mutation(&output, &device_id)
}

fn parse_audio_devices(output: &AgentOutput) -> Result<Vec<AudioDevice>, NativeAgentError> {
    let result: AudioDiscoveryResult = parse_agent_result(output)?;
    let identifiers: HashSet<_> = result
        .devices
        .iter()
        .map(|device| device.id.as_str())
        .collect();
    let default_inputs = result
        .devices
        .iter()
        .filter(|device| device.direction == AudioDirection::Input && device.is_default)
        .count();
    let default_outputs = result
        .devices
        .iter()
        .filter(|device| device.direction == AudioDirection::Output && device.is_default)
        .count();

    if identifiers.len() != result.devices.len()
        || default_inputs > 1
        || default_outputs > 1
        || result.devices.iter().any(invalid_audio_device)
    {
        return Err(NativeAgentError::protocol());
    }

    Ok(result.devices)
}

fn parse_audio_mutation(
    output: &AgentOutput,
    requested_device_id: &str,
) -> Result<AudioDevice, NativeAgentError> {
    let result: AudioMutationResult = parse_agent_result(output)?;
    if result.device.id != requested_device_id || invalid_audio_device(&result.device) {
        return Err(NativeAgentError::protocol());
    }
    Ok(result.device)
}

fn validate_device_id(device_id: &str) -> Result<(), NativeAgentError> {
    if device_id.is_empty() || device_id.len() > 1024 {
        return Err(NativeAgentError::invalid_argument());
    }
    Ok(())
}

fn validate_volume(volume: u8) -> Result<(), NativeAgentError> {
    if volume > 100 {
        return Err(NativeAgentError::invalid_argument());
    }
    Ok(())
}

fn invalid_audio_device(device: &AudioDevice) -> bool {
    device.id.is_empty()
        || device.id.len() > 1024
        || device.uid.is_empty()
        || device.uid.len() > 1024
        || device.name.trim().is_empty()
        || device.name.len() > 512
        || device.id != format!("{}:{}", device.uid, device.direction.identifier())
        || device.can_read_volume != device.volume.is_some()
        || device.can_read_mute != device.muted.is_some()
        || (device.can_set_volume && !device.can_read_volume)
        || (device.can_set_mute && !device.can_read_mute)
        || device.volume.is_some_and(|volume| volume > 100)
}

impl AudioDirection {
    fn identifier(self) -> &'static str {
        match self {
            Self::Input => "input",
            Self::Output => "output",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{
        get_audio_devices, parse_audio_mutation, validate_device_id, validate_volume,
        AudioDirection,
    };
    use crate::sidecar::AgentOutput;

    #[test]
    fn returns_real_validated_audio_devices() {
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_shell::init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .expect("mock Tauri application should build");

        let devices = tauri::async_runtime::block_on(get_audio_devices(app.handle().clone()))
            .expect("audio discovery should return a valid list");

        assert!(devices.iter().all(|device| !device.id.is_empty()));
        assert!(devices.iter().all(|device| {
            matches!(
                device.direction,
                AudioDirection::Input | AudioDirection::Output
            )
        }));
    }

    #[test]
    fn rejects_invalid_mutation_arguments() {
        assert!(validate_device_id("").is_err());
        assert!(validate_device_id(&"x".repeat(1025)).is_err());
        assert!(validate_volume(101).is_err());
        assert!(validate_volume(0).is_ok());
        assert!(validate_volume(100).is_ok());
    }

    #[test]
    fn accepts_only_the_requested_refreshed_device() {
        let output = AgentOutput {
            request_id: "audio-mutation-test".to_owned(),
            line: br#"{
                "id":"audio-mutation-test",
                "version":1,
                "result":{
                    "device":{
                        "id":"device-uid:input",
                        "uid":"device-uid",
                        "name":"Studio microphone",
                        "direction":"input",
                        "transport":"usb",
                        "isDefault":true,
                        "volume":55,
                        "muted":false,
                        "canReadVolume":true,
                        "canReadMute":true,
                        "canSetVolume":true,
                        "canSetMute":true,
                        "canSetDefault":true
                    }
                }
            }"#.to_vec(),
        };

        let device = parse_audio_mutation(&output, "device-uid:input")
            .expect("matching refreshed device should be accepted");
        assert_eq!(device.id, "device-uid:input");
        assert!(parse_audio_mutation(&output, "another-device:input").is_err());
    }
}
