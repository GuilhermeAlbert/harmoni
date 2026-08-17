use serde::Serialize;

use super::AgentProtocolError;

const ERROR_INVALID_ARGUMENT: &str = "The native operation arguments are invalid.";
const ERROR_NOT_FOUND: &str = "The requested native device was not found.";
const ERROR_PROCESS: &str = "The native operation was rejected.";
const ERROR_PROTOCOL: &str = "The native agent returned an invalid response.";
const ERROR_SPAWN: &str = "The bundled native agent could not be started.";
const ERROR_TERMINATED: &str = "The native agent terminated before responding.";
const ERROR_TIMEOUT: &str = "The native agent did not respond in time.";
const ERROR_UNSUPPORTED: &str = "The requested native control is unsupported.";
const ERROR_WRITE: &str = "The request could not be sent to the native agent.";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NativeAgentError {
    pub(super) code: NativeAgentErrorCode,
    pub(super) message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub(super) enum NativeAgentErrorCode {
    InvalidArgument,
    NotFound,
    Unsupported,
    Timeout,
    Protocol,
    Process,
    Spawn,
    Terminated,
    Write,
    PermissionDenied,
    CameraInUse,
}

impl NativeAgentError {
    pub(super) fn timeout() -> Self {
        Self::new(NativeAgentErrorCode::Timeout, ERROR_TIMEOUT)
    }

    pub(crate) fn protocol() -> Self {
        Self::new(NativeAgentErrorCode::Protocol, ERROR_PROTOCOL)
    }

    pub(crate) fn process() -> Self {
        Self::new(NativeAgentErrorCode::Process, ERROR_PROCESS)
    }

    pub(crate) fn invalid_argument() -> Self {
        Self::new(
            NativeAgentErrorCode::InvalidArgument,
            ERROR_INVALID_ARGUMENT,
        )
    }

    pub(crate) fn not_found() -> Self {
        Self::new(NativeAgentErrorCode::NotFound, ERROR_NOT_FOUND)
    }

    pub(crate) fn unsupported() -> Self {
        Self::new(NativeAgentErrorCode::Unsupported, ERROR_UNSUPPORTED)
    }

    pub(super) fn spawn() -> Self {
        Self::new(NativeAgentErrorCode::Spawn, ERROR_SPAWN)
    }

    pub(super) fn write() -> Self {
        Self::new(NativeAgentErrorCode::Write, ERROR_WRITE)
    }

    pub(super) fn terminated() -> Self {
        Self::new(NativeAgentErrorCode::Terminated, ERROR_TERMINATED)
    }

    pub(super) fn from_agent(error: AgentProtocolError) -> Self {
        let Some(message) = safe_agent_message(&error.message) else {
            return match error.code.as_str() {
                "invalid_argument" => Self::invalid_argument(),
                "not_found" => Self::not_found(),
                "unsupported" => Self::unsupported(),
                "process" => Self::process(),
                _ => Self::protocol(),
            };
        };
        let code = match error.code.as_str() {
            "invalid_argument" => NativeAgentErrorCode::InvalidArgument,
            "not_found" => NativeAgentErrorCode::NotFound,
            "unsupported" => NativeAgentErrorCode::Unsupported,
            "process" => NativeAgentErrorCode::Process,
            "permission_denied" => NativeAgentErrorCode::PermissionDenied,
            "camera_in_use" => NativeAgentErrorCode::CameraInUse,
            _ => return Self::protocol(),
        };
        Self { code, message }
    }

    fn new(code: NativeAgentErrorCode, message: &str) -> Self {
        Self {
            code,
            message: message.to_owned(),
        }
    }
}

fn safe_agent_message(message: &str) -> Option<String> {
    let trimmed = message.trim();
    if trimmed.is_empty() || trimmed.len() > 256 || trimmed.chars().any(char::is_control) {
        return None;
    }
    Some(trimmed.to_owned())
}
