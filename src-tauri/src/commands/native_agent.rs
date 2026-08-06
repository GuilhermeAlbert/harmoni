use tauri::{AppHandle, Runtime};

use crate::sidecar::{fetch_agent_health, AgentHealth, NativeAgentError};

#[tauri::command]
pub(crate) async fn get_agent_health<R: Runtime>(
    app: AppHandle<R>,
) -> Result<AgentHealth, NativeAgentError> {
    fetch_agent_health(&app).await
}
