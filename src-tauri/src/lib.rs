mod commands;
mod events;
mod sidecar;
mod storage;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(events::AudioEventProcess::default())
        .manage(events::CameraEventProcess::default())
        .manage(events::HidEventProcess::default())
        .manage(commands::camera::CameraPreviewProcess::default())
        .setup(|app| {
            events::start_audio_device_events(app.handle().clone());
            events::start_camera_device_events(app.handle().clone());
            events::start_hid_device_events(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::audio::get_audio_devices,
            commands::audio::set_audio_mute,
            commands::audio::set_audio_volume,
            commands::audio::set_default_audio_input,
            commands::audio::set_default_audio_output,
            commands::camera::get_cameras,
            commands::camera::reset_preferred_camera,
            commands::camera::set_camera_exposure,
            commands::camera::set_camera_zoom,
            commands::camera::set_preferred_camera,
            commands::camera::start_camera_preview,
            commands::camera::stop_camera_preview,
            commands::hid::get_peripherals,
            commands::native_agent::get_agent_health,
            commands::device_events::trigger_development_device_event,
            commands::permissions::get_permission_status,
            commands::permissions::open_permission_settings,
            commands::profiles::get_profiles,
            commands::profiles::save_profile,
            commands::profiles::apply_profile
        ])
        .build(tauri::generate_context!())
        .expect("failed to build the Harmoni desktop host");

    app.run(|app_handle, event| {
        if matches!(event, tauri::RunEvent::Exit) {
            commands::camera::stop_camera_preview_process(
                app_handle
                    .state::<commands::camera::CameraPreviewProcess>()
                    .inner(),
            );
            events::stop_audio_device_events(app_handle);
            events::stop_camera_device_events(app_handle);
            events::stop_hid_device_events(app_handle);
        }
    });
}
