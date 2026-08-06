use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime};

use crate::sidecar::{request_agent_output, NativeAgentError};

const DEVELOPMENT_EVENT_METHOD: &str = "development.emitDeviceEvent";
const DEVICE_EVENT_KIND: &str = "device-change";
pub(crate) const DEVICE_EVENT_NAME: &str = "harmoni://device-change";
const PROTOCOL_VERSION: u16 = 1;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DeviceEvent {
    id: String,
    category: DeviceEventCategory,
    change: DeviceEventChange,
    occurred_at: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
enum DeviceEventCategory {
    AudioInput,
    AudioOutput,
    Camera,
    Keyboard,
    Mouse,
    Trackpad,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum DeviceEventChange {
    Connected,
    Disconnected,
}

#[derive(Deserialize)]
struct DeviceEventEnvelope {
    kind: String,
    version: u16,
    event: DeviceEvent,
}

pub(crate) async fn emit_development_device_event<R: Runtime>(
    app: &AppHandle<R>,
) -> Result<DeviceEvent, NativeAgentError> {
    let output = request_agent_output(app, DEVELOPMENT_EVENT_METHOD, "device-event").await?;
    let event = parse_device_event(&output.line)?;

    app.emit(DEVICE_EVENT_NAME, &event)
        .map_err(|_| NativeAgentError::process())?;

    Ok(event)
}

fn parse_device_event(line: &[u8]) -> Result<DeviceEvent, NativeAgentError> {
    let envelope: DeviceEventEnvelope =
        serde_json::from_slice(line).map_err(|_| NativeAgentError::protocol())?;

    if envelope.kind != DEVICE_EVENT_KIND
        || envelope.version != PROTOCOL_VERSION
        || !is_valid_identifier(&envelope.event.id)
        || !is_valid_timestamp(&envelope.event.occurred_at)
    {
        return Err(NativeAgentError::protocol());
    }

    Ok(envelope.event)
}

fn is_valid_identifier(identifier: &str) -> bool {
    !identifier.is_empty()
        && identifier.len() <= 128
        && identifier.bytes().all(|byte| {
            byte.is_ascii_lowercase() || byte.is_ascii_digit() || matches!(byte, b'.' | b'-')
        })
}

fn is_valid_timestamp(timestamp: &str) -> bool {
    timestamp.len() >= 20
        && timestamp.len() <= 64
        && timestamp.contains('T')
        && timestamp.ends_with('Z')
}

#[cfg(test)]
mod tests {
    use std::sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    };

    use tauri::Listener;

    use super::{
        emit_development_device_event, parse_device_event, DeviceEventCategory, DeviceEventChange,
        DEVICE_EVENT_NAME,
    };

    #[test]
    fn emits_one_validated_event_and_honors_unsubscribe() {
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_shell::init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .expect("mock Tauri application should build");
        let received_events = Arc::new(AtomicUsize::new(0));
        let listener_events = Arc::clone(&received_events);
        let listener_id = app.listen(DEVICE_EVENT_NAME, move |_| {
            listener_events.fetch_add(1, Ordering::SeqCst);
        });

        let event = tauri::async_runtime::block_on(emit_development_device_event(app.handle()))
            .expect("development event should be emitted");

        assert_eq!(event.id, "development.audio-input");
        assert!(matches!(event.category, DeviceEventCategory::AudioInput));
        assert!(matches!(event.change, DeviceEventChange::Connected));
        assert_eq!(received_events.load(Ordering::SeqCst), 1);

        app.unlisten(listener_id);
        tauri::async_runtime::block_on(emit_development_device_event(app.handle()))
            .expect("second development event should still be produced");

        assert_eq!(received_events.load(Ordering::SeqCst), 1);
    }

    #[test]
    fn rejects_malformed_events() {
        assert!(parse_device_event(b"not-json").is_err());
    }

    #[test]
    fn rejects_invalid_event_fields() {
        let invalid = br#"{
            "kind":"device-change",
            "version":1,
            "event":{
                "id":"Invalid Identifier",
                "category":"audio-input",
                "change":"connected",
                "occurredAt":"not-a-timestamp"
            }
        }"#;

        assert!(parse_device_event(invalid).is_err());
    }
}
