use serde::Serialize;
use tauri::{AppHandle, Runtime};

use crate::{
    events::{watcher_health, WatcherHealth},
    sidecar::{fetch_agent_health, AgentHealth, NativeAgentError},
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NativeSystemHealth {
    #[serde(flatten)]
    agent: AgentHealth,
    watchers: WatcherHealth,
}

#[tauri::command]
pub(crate) async fn get_agent_health<R: Runtime>(
    app: AppHandle<R>,
) -> Result<NativeSystemHealth, NativeAgentError> {
    let agent = fetch_agent_health(&app).await?;
    Ok(NativeSystemHealth {
        agent,
        watchers: watcher_health(&app),
    })
}
