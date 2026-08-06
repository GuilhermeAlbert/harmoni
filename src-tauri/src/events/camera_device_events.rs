use std::sync::Mutex;

use serde_json::json;
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};

use super::device_event::{parse_device_event, DEVICE_EVENT_NAME};
use crate::sidecar::spawn_agent_request;

const CAMERA_EVENT_METHOD: &str = "camera.watchDeviceEvents";

#[derive(Default)]
pub(crate) struct CameraEventProcess(Mutex<Option<CommandChild>>);

pub(crate) fn start_camera_device_events<R: Runtime>(app: AppHandle<R>) {
    tauri::async_runtime::spawn(async move {
        let Ok((_, mut events, child)) =
            spawn_agent_request(&app, CAMERA_EVENT_METHOD, "camera-events", json!({}))
        else {
            return;
        };
        let state = app.state::<CameraEventProcess>();
        if let Err(child) = state.store(child) {
            let _ = child.kill();
            return;
        }
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    if let Ok(device_event) = parse_device_event(&line) {
                        if device_event.is_camera_change() {
                            let _ = app.emit(DEVICE_EVENT_NAME, device_event);
                        }
                    }
                }
                CommandEvent::Stderr(_) => {}
                CommandEvent::Error(_) | CommandEvent::Terminated(_) => break,
                _ => {}
            }
        }
        app.state::<CameraEventProcess>().take();
    });
}

pub(crate) fn stop_camera_device_events<R: Runtime>(app: &AppHandle<R>) {
    if let Some(child) = app.state::<CameraEventProcess>().take() {
        let _ = child.kill();
    }
}

impl CameraEventProcess {
    fn store(&self, child: CommandChild) -> Result<(), CommandChild> {
        match self.0.lock() {
            Ok(mut process) => {
                *process = Some(child);
                Ok(())
            }
            Err(_) => Err(child),
        }
    }

    fn take(&self) -> Option<CommandChild> {
        match self.0.lock() {
            Ok(mut process) => process.take(),
            Err(_) => None,
        }
    }
}
