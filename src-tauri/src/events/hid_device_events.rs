use super::device_event::{parse_device_event, DEVICE_EVENT_NAME};
use crate::sidecar::spawn_agent_request;
use serde_json::json;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};

#[derive(Default)]
pub(crate) struct HidEventProcess(Mutex<Option<CommandChild>>);

pub(crate) fn start_hid_device_events<R: Runtime>(app: AppHandle<R>) {
    tauri::async_runtime::spawn(async move {
        let Ok((_, mut events, child)) =
            spawn_agent_request(&app, "hid.watchDeviceEvents", "hid-events", json!({}))
        else {
            return;
        };
        if let Err(child) = app.state::<HidEventProcess>().store(child) {
            let _ = child.kill();
            return;
        }
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    if let Ok(item) = parse_device_event(&line) {
                        if item.is_peripheral_change() {
                            let _ = app.emit(DEVICE_EVENT_NAME, item);
                        }
                    }
                }
                CommandEvent::Error(_) | CommandEvent::Terminated(_) => break,
                _ => {}
            }
        }
        app.state::<HidEventProcess>().take();
    });
}
pub(crate) fn stop_hid_device_events<R: Runtime>(app: &AppHandle<R>) {
    if let Some(child) = app.state::<HidEventProcess>().take() {
        let _ = child.kill();
    }
}
impl HidEventProcess {
    fn store(&self, child: CommandChild) -> Result<(), CommandChild> {
        match self.0.lock() {
            Ok(mut slot) => {
                *slot = Some(child);
                Ok(())
            }
            Err(_) => Err(child),
        }
    }
    fn take(&self) -> Option<CommandChild> {
        self.0.lock().ok()?.take()
    }
}
