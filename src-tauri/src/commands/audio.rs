use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Runtime};

use crate::sidecar::{parse_agent_result, request_agent_output, AgentOutput, NativeAgentError};

const AUDIO_DEVICES_METHOD: &str = "audio.devices";

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
}

#[derive(Deserialize)]
struct AudioDiscoveryResult {
    devices: Vec<AudioDevice>,
}

#[tauri::command]
pub(crate) async fn get_audio_devices<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<AudioDevice>, NativeAgentError> {
    let output =
        request_agent_output(&app, AUDIO_DEVICES_METHOD, "audio-devices", json!({})).await?;
    parse_audio_devices(&output)
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
    use super::{get_audio_devices, AudioDirection};

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
}
