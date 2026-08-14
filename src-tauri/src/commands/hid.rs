use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Runtime};

use crate::sidecar::{
    parse_agent_result, request_agent_output, AgentMethod, AgentOutput, NativeAgentError,
};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum PeripheralCategory {
    GameController,
    Keyboard,
    Mouse,
    Other,
    Trackpad,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum PeripheralTransport {
    Bluetooth,
    BuiltIn,
    Unknown,
    Usb,
    Wireless,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub(crate) struct Peripheral {
    id: String,
    name: String,
    manufacturer: String,
    category: PeripheralCategory,
    transport: PeripheralTransport,
    vendor_id: Option<u16>,
    product_id: Option<u16>,
    battery_percent: Option<u8>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct HidDiscovery {
    input_monitoring: String,
    peripherals: Vec<Peripheral>,
}

#[tauri::command]
pub(crate) async fn get_peripherals<R: Runtime>(
    app: AppHandle<R>,
) -> Result<HidDiscovery, NativeAgentError> {
    let output =
        request_agent_output(&app, AgentMethod::HidDevices, "hid-devices", json!({})).await?;
    parse_hid_discovery(&output)
}

fn parse_hid_discovery(output: &AgentOutput) -> Result<HidDiscovery, NativeAgentError> {
    let result: HidDiscovery = parse_agent_result(output)?;
    let ids: HashSet<_> = result
        .peripherals
        .iter()
        .map(|item| item.id.as_str())
        .collect();
    if !matches!(
        result.input_monitoring.as_str(),
        "authorized" | "not-granted" | "unknown" | "unsupported"
    ) || ids.len() != result.peripherals.len()
        || result.peripherals.len() > 512
        || result.peripherals.iter().any(|item| {
            item.id.is_empty()
                || item.id.len() > 128
                || item.name.trim().is_empty()
                || item.name.len() > 512
                || item.manufacturer.len() > 512
                || item.battery_percent.is_some_and(|value| value > 100)
        })
    {
        return Err(NativeAgentError::protocol());
    }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::{get_peripherals, parse_hid_discovery};
    use crate::sidecar::AgentOutput;

    #[test]
    fn accepts_safe_real_hid_metadata() {
        let output = AgentOutput {
            request_id: "hid-test".to_owned(),
            line: br#"{"id":"hid-test","version":1,"result":{"inputMonitoring":"authorized","peripherals":[{"id":"hid-abc123","name":"Keyboard","manufacturer":"Acme","category":"keyboard","transport":"usb","vendorId":123,"productId":456,"batteryPercent":null}]}}"#.to_vec(),
        };
        let result = parse_hid_discovery(&output).expect("valid HID inventory should parse");
        assert_eq!(result.peripherals.len(), 1);
    }

    #[test]
    fn rejects_fabricated_or_unsafe_capabilities() {
        let output = AgentOutput {
            request_id: "hid-test".to_owned(),
            line: br#"{"id":"hid-test","version":1,"result":{"inputMonitoring":"unknown","peripherals":[{"id":"hid-bad","name":"Mouse","manufacturer":"Acme","category":"mouse","transport":"usb","vendorId":1,"productId":2,"batteryPercent":101}]}}"#.to_vec(),
        };
        assert!(parse_hid_discovery(&output).is_err());
    }

    #[test]
    fn rejects_removed_device_control_claims() {
        let output = AgentOutput {
            request_id: "hid-test".to_owned(),
            line: br#"{"id":"hid-test","version":1,"result":{"inputMonitoring":"unknown","peripherals":[{"id":"hid-bad","name":"Mouse","manufacturer":"Acme","category":"mouse","transport":"usb","vendorId":1,"productId":2,"batteryPercent":50,"connected":true,"canDisable":false}]}}"#.to_vec(),
        };
        assert!(parse_hid_discovery(&output).is_err());
    }

    #[test]
    fn returns_real_hid_inventory_without_input_capture() {
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_shell::init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .expect("app should build");
        let result = tauri::async_runtime::block_on(get_peripherals(app.handle().clone()))
            .expect("HID inventory should validate");
        assert!(result.peripherals.iter().all(|item| !item.id.is_empty()));
    }
}
