use std::{
    process,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use serde::{de::DeserializeOwned, Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{async_runtime::Receiver, AppHandle, Runtime};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};
use tokio::time::timeout;

const AGENT_INFO_METHOD: &str = "agent.info";
const AGENT_SIDECAR: &str = "harmoni-agent";
const AGENT_TIMEOUT: Duration = Duration::from_secs(3);
const PROTOCOL_VERSION: u16 = 1;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AgentHealth {
    protocol_version: u16,
    app_version: String,
    agent_version: String,
    #[serde(rename = "macOSVersion")]
    mac_os_version: String,
    architecture: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NativeAgentError {
    code: NativeAgentErrorCode,
    message: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
enum NativeAgentErrorCode {
    InvalidArgument,
    NotFound,
    Unsupported,
    Unavailable,
    Timeout,
    Protocol,
    Process,
}

#[derive(Serialize)]
struct AgentRequest<'a> {
    id: &'a str,
    version: u16,
    method: &'a str,
    params: Value,
}

#[derive(Deserialize)]
struct AgentResponse<Payload> {
    id: Option<String>,
    version: u16,
    result: Option<Payload>,
    error: Option<AgentProtocolError>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentInfoResult {
    agent_version: String,
    architecture: String,
    #[serde(rename = "macOSVersion")]
    mac_os_version: String,
    process_identifier: i32,
    protocol_version: u16,
}

#[derive(Deserialize)]
struct AgentProtocolError {
    code: String,
    message: String,
}

pub(crate) struct AgentOutput {
    pub(crate) request_id: String,
    pub(crate) line: Vec<u8>,
}

pub(crate) async fn fetch_agent_health<R: Runtime>(
    app: &AppHandle<R>,
) -> Result<AgentHealth, NativeAgentError> {
    let output = request_agent_output(app, AGENT_INFO_METHOD, "health", json!({})).await?;
    parse_response(
        &output.line,
        &output.request_id,
        app.package_info().version.to_string(),
    )
}

pub(crate) async fn request_agent_output<R: Runtime>(
    app: &AppHandle<R>,
    method: &str,
    request_prefix: &str,
    params: Value,
) -> Result<AgentOutput, NativeAgentError> {
    let (request_id, mut events, child) = spawn_agent_request(app, method, request_prefix, params)?;

    let response = timeout(AGENT_TIMEOUT, async {
        loop {
            match events.recv().await {
                Some(CommandEvent::Stdout(line)) => return Ok(line),
                Some(CommandEvent::Stderr(_)) => {}
                Some(CommandEvent::Error(_)) | Some(CommandEvent::Terminated(_)) | None => {
                    return Err(NativeAgentError::process());
                }
                Some(_) => {}
            }
        }
    })
    .await;

    let _ = child.kill();

    let line = response.map_err(|_| NativeAgentError::timeout())??;
    Ok(AgentOutput { request_id, line })
}

pub(crate) fn spawn_agent_request<R: Runtime>(
    app: &AppHandle<R>,
    method: &str,
    request_prefix: &str,
    params: Value,
) -> Result<(String, Receiver<CommandEvent>, CommandChild), NativeAgentError> {
    let request_id = make_request_id(request_prefix)?;
    let request = encode_request(&request_id, method, params)?;
    let command = app
        .shell()
        .sidecar(AGENT_SIDECAR)
        .map_err(|_| NativeAgentError::unavailable())?;
    let (events, mut child) = command
        .spawn()
        .map_err(|_| NativeAgentError::unavailable())?;

    if child.write(request.as_bytes()).is_err() || child.write(b"\n").is_err() {
        let _ = child.kill();
        return Err(NativeAgentError::process());
    }

    Ok((request_id, events, child))
}

fn make_request_id(prefix: &str) -> Result<String, NativeAgentError> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| NativeAgentError::process())?
        .as_nanos();

    Ok(format!("{prefix}-{}-{timestamp}", process::id()))
}

fn encode_request(
    request_id: &str,
    method: &str,
    params: Value,
) -> Result<String, NativeAgentError> {
    serde_json::to_string(&AgentRequest {
        id: request_id,
        version: PROTOCOL_VERSION,
        method,
        params,
    })
    .map_err(|_| NativeAgentError::protocol())
}

fn parse_response(
    line: &[u8],
    request_id: &str,
    app_version: String,
) -> Result<AgentHealth, NativeAgentError> {
    let result = parse_agent_result_line(line, request_id)?;
    normalize_health(result, app_version)
}

pub(crate) fn parse_agent_result<Payload: DeserializeOwned>(
    output: &AgentOutput,
) -> Result<Payload, NativeAgentError> {
    parse_agent_result_line(&output.line, &output.request_id)
}

fn parse_agent_result_line<Payload: DeserializeOwned>(
    line: &[u8],
    request_id: &str,
) -> Result<Payload, NativeAgentError> {
    let response: AgentResponse<Payload> =
        serde_json::from_slice(line).map_err(|_| NativeAgentError::protocol())?;

    if response.id.as_deref() != Some(request_id) || response.version != PROTOCOL_VERSION {
        return Err(NativeAgentError::protocol());
    }

    match (response.result, response.error) {
        (Some(result), None) => Ok(result),
        (None, Some(error)) => {
            let _ = error.message;
            Err(match error.code.as_str() {
                "invalid_argument" => NativeAgentError::invalid_argument(),
                "not_found" => NativeAgentError::not_found(),
                "unsupported" => NativeAgentError::unsupported(),
                "process" => NativeAgentError::process(),
                _ => NativeAgentError::protocol(),
            })
        }
        _ => Err(NativeAgentError::protocol()),
    }
}

fn normalize_health(
    result: AgentInfoResult,
    app_version: String,
) -> Result<AgentHealth, NativeAgentError> {
    if result.protocol_version != PROTOCOL_VERSION
        || result.agent_version.is_empty()
        || result.architecture.is_empty()
        || result.mac_os_version.is_empty()
        || result.process_identifier <= 0
        || app_version.is_empty()
    {
        return Err(NativeAgentError::protocol());
    }

    Ok(AgentHealth {
        protocol_version: result.protocol_version,
        app_version,
        agent_version: result.agent_version,
        mac_os_version: result.mac_os_version,
        architecture: result.architecture,
    })
}

impl NativeAgentError {
    fn unavailable() -> Self {
        Self {
            code: NativeAgentErrorCode::Unavailable,
            message: "The native agent is unavailable.",
        }
    }

    fn timeout() -> Self {
        Self {
            code: NativeAgentErrorCode::Timeout,
            message: "The native agent did not respond in time.",
        }
    }

    pub(crate) fn protocol() -> Self {
        Self {
            code: NativeAgentErrorCode::Protocol,
            message: "The native agent returned an invalid response.",
        }
    }

    pub(crate) fn process() -> Self {
        Self {
            code: NativeAgentErrorCode::Process,
            message: "The native agent process failed.",
        }
    }

    pub(crate) fn invalid_argument() -> Self {
        Self {
            code: NativeAgentErrorCode::InvalidArgument,
            message: "The audio mutation arguments are invalid.",
        }
    }

    fn not_found() -> Self {
        Self {
            code: NativeAgentErrorCode::NotFound,
            message: "The requested audio device was not found.",
        }
    }

    fn unsupported() -> Self {
        Self {
            code: NativeAgentErrorCode::Unsupported,
            message: "The requested audio control is unsupported.",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{fetch_agent_health, parse_response, NativeAgentErrorCode};

    #[test]
    fn returns_health_through_the_real_sidecar_transport() {
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_shell::init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .expect("mock Tauri application should build");

        let health = tauri::async_runtime::block_on(fetch_agent_health(app.handle()))
            .expect("bundled agent should return health");

        assert_eq!(health.protocol_version, 1);
        assert!(!health.app_version.is_empty());
        assert!(!health.agent_version.is_empty());
        assert!(!health.mac_os_version.is_empty());
        assert!(!health.architecture.is_empty());
    }

    #[test]
    fn normalizes_a_valid_correlated_response() {
        let response = br#"{
            "id":"health-test",
            "version":1,
            "result":{
                "agentVersion":"0.1.0",
                "architecture":"arm64",
                "macOSVersion":"Version 26.0",
                "processIdentifier":123,
                "protocolVersion":1
            }
        }"#;

        let health = parse_response(response, "health-test", "0.1.0".to_owned())
            .expect("valid response should normalize");

        assert_eq!(health.protocol_version, 1);
        assert_eq!(health.app_version, "0.1.0");
        assert_eq!(health.agent_version, "0.1.0");
        assert_eq!(health.mac_os_version, "Version 26.0");
        assert_eq!(health.architecture, "arm64");
    }

    #[test]
    fn rejects_malformed_responses() {
        let error = parse_response(b"not-json", "health-test", "0.1.0".to_owned())
            .expect_err("malformed response should fail");

        assert!(matches!(error.code, NativeAgentErrorCode::Protocol));
    }

    #[test]
    fn rejects_uncorrelated_responses() {
        let response = br#"{
            "id":"different-id",
            "version":1,
            "result":{
                "agentVersion":"0.1.0",
                "architecture":"arm64",
                "macOSVersion":"Version 26.0",
                "processIdentifier":123,
                "protocolVersion":1
            }
        }"#;

        let error = parse_response(response, "health-test", "0.1.0".to_owned())
            .expect_err("uncorrelated response should fail");

        assert!(matches!(error.code, NativeAgentErrorCode::Protocol));
    }
}
