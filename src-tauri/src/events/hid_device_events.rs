use super::device_event::{parse_device_event, DEVICE_EVENT_NAME};
use super::watcher::{retry_delay, WatcherProcess, MAX_RESTART_ATTEMPTS};
use crate::sidecar::spawn_agent_request;
use serde_json::json;
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_shell::process::CommandEvent;
use tokio::time::sleep;

#[derive(Default)]
pub(crate) struct HidEventProcess(pub(crate) WatcherProcess);

pub(crate) fn start_hid_device_events<R: Runtime>(app: AppHandle<R>) {
    tauri::async_runtime::spawn(async move {
        let state = app.state::<HidEventProcess>();
        if !state.0.begin() {
            return;
        };
        for attempt in 0..=MAX_RESTART_ATTEMPTS {
            let Ok((_, mut events, child)) =
                spawn_agent_request(&app, "hid.watchDeviceEvents", "hid-events", json!({}))
            else {
                eprintln!("native-agent watcher spawn failed: method=hid.watchDeviceEvents attempt={attempt}");
                if attempt < MAX_RESTART_ATTEMPTS && !state.0.is_stopping() {
                    sleep(retry_delay(attempt)).await;
                    continue;
                }
                break;
            };
            if let Err(child) = state.0.store(child) {
                let _ = child.kill();
                break;
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
                    CommandEvent::Stderr(_) => {}
                    CommandEvent::Error(_) | CommandEvent::Terminated(_) => break,
                    _ => {}
                }
            }
            state.0.take();
            if state.0.is_stopping() || attempt == MAX_RESTART_ATTEMPTS {
                break;
            }
            eprintln!(
                "native-agent watcher terminated: method=hid.watchDeviceEvents attempt={attempt}"
            );
            sleep(retry_delay(attempt)).await;
        }
        state.0.finish();
    });
}
pub(crate) fn stop_hid_device_events<R: Runtime>(app: &AppHandle<R>) {
    app.state::<HidEventProcess>().0.stop();
}
