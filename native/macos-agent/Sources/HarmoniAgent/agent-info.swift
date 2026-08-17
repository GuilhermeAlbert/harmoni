import Foundation

private let AGENT_VERSION = "0.1.0"

func makeAgentInfo() -> AgentInfoResult {
    let processInfo = ProcessInfo.processInfo
    return AgentInfoResult(
        agentVersion: AGENT_VERSION,
        architecture: currentArchitecture(),
        macOSVersion: processInfo.operatingSystemVersionString,
        processIdentifier: processInfo.processIdentifier,
        protocolVersion: PROTOCOL_VERSION
    )
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
