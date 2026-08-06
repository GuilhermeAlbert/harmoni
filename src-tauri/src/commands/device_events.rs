use tauri::{AppHandle, Runtime};

use crate::{
    events::{emit_development_device_event, DeviceEvent},
    sidecar::NativeAgentError,
};

#[tauri::command]
pub(crate) async fn trigger_development_device_event<R: Runtime>(
    app: AppHandle<R>,
) -> Result<DeviceEvent, NativeAgentError> {
    emit_development_device_event(&app).await
}
