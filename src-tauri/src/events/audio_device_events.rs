use serde_json::json;
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_shell::process::CommandEvent;
use tokio::time::sleep;

use super::device_event::{parse_device_event, DEVICE_EVENT_NAME};
use super::watcher::{retry_delay, WatcherProcess, MAX_RESTART_ATTEMPTS};
use crate::sidecar::spawn_agent_request;

const AUDIO_EVENT_METHOD: &str = "audio.watchDeviceEvents";

#[derive(Default)]
pub(crate) struct AudioEventProcess(pub(crate) WatcherProcess);

pub(crate) fn start_audio_device_events<R: Runtime>(app: AppHandle<R>) {
    tauri::async_runtime::spawn(async move {
        let state = app.state::<AudioEventProcess>();
        if !state.0.begin() {
            return;
        }
        for attempt in 0..=MAX_RESTART_ATTEMPTS {
            let Ok((_, mut events, child)) =
                spawn_agent_request(&app, AUDIO_EVENT_METHOD, "audio-events", json!({}))
            else {
                eprintln!("native-agent watcher spawn failed: method={AUDIO_EVENT_METHOD} attempt={attempt}");
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
                        if let Ok(device_event) = parse_device_event(&line) {
                            if device_event.is_audio_change() {
                                let _ = app.emit(DEVICE_EVENT_NAME, device_event);
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
                "native-agent watcher terminated: method={AUDIO_EVENT_METHOD} attempt={attempt}"
            );
            sleep(retry_delay(attempt)).await;
        }
        state.0.finish();
    });
}

pub(crate) fn stop_audio_device_events<R: Runtime>(app: &AppHandle<R>) {
    app.state::<AudioEventProcess>().0.stop();
}
