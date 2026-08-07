mod audio_device_events;
mod camera_device_events;
mod device_event;
mod hid_device_events;
mod watcher;

use serde::Serialize;
use tauri::{AppHandle, Manager, Runtime};

pub(crate) use audio_device_events::{
    start_audio_device_events, stop_audio_device_events, AudioEventProcess,
};
pub(crate) use camera_device_events::{
    start_camera_device_events, stop_camera_device_events, CameraEventProcess,
};
pub(crate) use device_event::{emit_development_device_event, DeviceEvent};
pub(crate) use hid_device_events::{
    start_hid_device_events, stop_hid_device_events, HidEventProcess,
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WatcherHealth {
    audio: watcher::WatcherState,
    camera: watcher::WatcherState,
    peripheral: watcher::WatcherState,
}

pub(crate) fn watcher_health<R: Runtime>(app: &AppHandle<R>) -> WatcherHealth {
    WatcherHealth {
        audio: app.state::<AudioEventProcess>().0.status(),
        camera: app.state::<CameraEventProcess>().0.status(),
        peripheral: app.state::<HidEventProcess>().0.status(),
    }
}
