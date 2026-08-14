use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Runtime};

use crate::sidecar::{
    parse_agent_result, request_agent_output, AgentMethod, AgentOutput, NativeAgentError,
};

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum PermissionCategory {
    Accessibility,
    Camera,
    InputMonitoring,
    Microphone,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum PermissionStatus {
    Authorized,
    Denied,
    NotGranted,
    NotDetermined,
    Restricted,
    Unsupported,
    Unknown,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub(crate) struct Permission {
    id: String,
    category: PermissionCategory,
    status: PermissionStatus,
}

#[derive(Deserialize)]
struct PermissionStatusResult {
    permissions: Vec<Permission>,
}

#[derive(Deserialize)]
struct OpenSettingsResult {
    category: PermissionCategory,
    opened: bool,
}

#[tauri::command]
pub(crate) async fn get_permission_status<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<Permission>, NativeAgentError> {
    let output = request_agent_output(
        &app,
        AgentMethod::PermissionsStatus,
        "permissions",
        json!({}),
    )
    .await?;
    parse_permission_status(&output)
}

#[tauri::command]
pub(crate) async fn open_permission_settings<R: Runtime>(
    app: AppHandle<R>,
    category: PermissionCategory,
) -> Result<(), NativeAgentError> {
    let output = request_agent_output(
        &app,
        AgentMethod::PermissionsOpenSettings,
        "permission-settings",
        json!({ "category": category }),
    )
    .await?;
    let result: OpenSettingsResult = parse_agent_result(&output)?;

    if result.opened && result.category == category {
        Ok(())
    } else {
        Err(NativeAgentError::process())
    }
}

fn parse_permission_status(output: &AgentOutput) -> Result<Vec<Permission>, NativeAgentError> {
    let result: PermissionStatusResult = parse_agent_result(output)?;
    let categories: HashSet<_> = result
        .permissions
        .iter()
        .map(|permission| permission.category)
        .collect();

    if result.permissions.len() != 4
        || categories.len() != 4
        || result
            .permissions
            .iter()
            .any(|permission| permission.id != permission.category.identifier())
    {
        return Err(NativeAgentError::protocol());
    }

    Ok(result.permissions)
}

impl PermissionCategory {
    fn identifier(self) -> &'static str {
        match self {
            Self::Accessibility => "accessibility-permission",
            Self::Camera => "camera-permission",
            Self::InputMonitoring => "input-monitoring-permission",
            Self::Microphone => "microphone-permission",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{
        get_permission_status, parse_permission_status, PermissionCategory, PermissionStatus,
    };
    use crate::sidecar::AgentOutput;

    #[test]
    fn returns_all_real_permission_categories_without_prompting() {
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_shell::init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .expect("mock Tauri application should build");

        let permissions =
            tauri::async_runtime::block_on(get_permission_status(app.handle().clone()))
                .expect("permission status should be returned");

        assert_eq!(permissions.len(), 4);
        assert!(permissions
            .iter()
            .any(|permission| permission.category == PermissionCategory::Camera));
        assert!(permissions
            .iter()
            .any(|permission| permission.category == PermissionCategory::Microphone));
        assert!(permissions
            .iter()
            .any(|permission| permission.category == PermissionCategory::Accessibility));
        assert!(permissions
            .iter()
            .any(|permission| permission.category == PermissionCategory::InputMonitoring));
    }

    #[test]
    fn accepts_not_granted_for_boolean_only_permission_apis() {
        let output = AgentOutput {
            request_id: "permissions-test".to_owned(),
            line: br#"{"id":"permissions-test","version":1,"result":{"permissions":[{"id":"camera-permission","category":"camera","status":"denied"},{"id":"microphone-permission","category":"microphone","status":"not-determined"},{"id":"accessibility-permission","category":"accessibility","status":"not-granted"},{"id":"input-monitoring-permission","category":"input-monitoring","status":"not-granted"}]}}"#.to_vec(),
        };

        let permissions =
            parse_permission_status(&output).expect("permission payload should parse");

        assert_eq!(
            permissions
                .iter()
                .filter(|permission| matches!(permission.status, PermissionStatus::NotGranted))
                .count(),
            2
        );
    }
}
