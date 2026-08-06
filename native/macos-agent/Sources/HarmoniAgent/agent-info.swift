import Foundation

private let AGENT_VERSION = "0.1.0"

func handleRequest(_ request: RequestEnvelope) -> AgentOutput {
    guard !request.id.isEmpty else {
        return .response(makeErrorResponse(
            id: nil,
            code: "invalid_request",
            message: "Request id must not be empty."
        ))
    }

    guard request.version == PROTOCOL_VERSION else {
        return .response(makeErrorResponse(
            id: request.id,
            code: "protocol_mismatch",
            message: "Unsupported protocol version."
        ))
    }

    if request.method == "development.emitDeviceEvent" {
        return .deviceEvent(makeDevelopmentDeviceEvent())
    }

    guard request.method == "agent.info" else {
        return .response(makeErrorResponse(
            id: request.id,
            code: "method_not_found",
            message: "Unsupported method."
        ))
    }

    let processInfo = ProcessInfo.processInfo
    let result = AgentInfoResult(
        agentVersion: AGENT_VERSION,
        architecture: currentArchitecture(),
        macOSVersion: processInfo.operatingSystemVersionString,
        processIdentifier: processInfo.processIdentifier,
        protocolVersion: PROTOCOL_VERSION
    )

    return .response(.result(id: request.id, value: result))
}

private func currentArchitecture() -> String {
    #if arch(arm64)
        "arm64"
    #elseif arch(x86_64)
        "x86_64"
    #else
        "unknown"
    #endif
}
