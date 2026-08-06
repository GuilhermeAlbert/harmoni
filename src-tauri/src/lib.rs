mod commands;
mod events;
mod sidecar;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::native_agent::get_agent_health,
            commands::device_events::trigger_development_device_event,
            commands::permissions::get_permission_status,
            commands::permissions::open_permission_settings
        ])
        .run(tauri::generate_context!())
        .expect("failed to run the Harmoni desktop host");
}
