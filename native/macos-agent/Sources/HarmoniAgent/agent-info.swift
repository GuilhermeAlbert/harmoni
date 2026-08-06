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

    if request.method == "permissions.status" {
        return .response(.result(
            id: request.id,
            value: .permissionStatus(readPermissionStatus())
        ))
    }

    if request.method == "permissions.openSettings" {
        guard let category = request.params.category else {
            return .response(makeErrorResponse(
                id: request.id,
                code: "invalid_request",
                message: "Permission category is required."
            ))
        }

        guard let result = openPermissionSettings(category: category) else {
            return .response(makeErrorResponse(
                id: request.id,
                code: "invalid_request",
                message: "Unsupported permission category."
            ))
        }

        return .response(.result(id: request.id, value: .openSettings(result)))
    }

    if request.method == "audio.devices" {
        return .response(.result(
            id: request.id,
            value: .audioDevices(discoverAudioDevices())
        ))
    }

    if request.method == "audio.setDefaultInput" {
        return audioMutationOutput(request: request) {
            setDefaultAudioDevice(stableID: $0, direction: "input")
        }
    }

    if request.method == "audio.setDefaultOutput" {
        return audioMutationOutput(request: request) {
            setDefaultAudioDevice(stableID: $0, direction: "output")
        }
    }

    if request.method == "audio.setVolume" {
        guard let volume = request.params.volume else {
            return .response(makeErrorResponse(
                id: request.id,
                code: "invalid_argument",
                message: "Volume is required."
            ))
        }
        return audioMutationOutput(request: request) {
            setAudioVolume(stableID: $0, volume: volume)
        }
    }

    if request.method == "audio.setMute" {
        guard let muted = request.params.muted else {
            return .response(makeErrorResponse(
                id: request.id,
                code: "invalid_argument",
                message: "Mute state is required."
            ))
        }
        return audioMutationOutput(request: request) {
            setAudioMute(stableID: $0, muted: muted)
        }
    }

    if request.method == "audio.watchDeviceEvents" {
        watchAudioDeviceEvents()
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

    return .response(.result(id: request.id, value: .agentInfo(result)))
}

private func audioMutationOutput(
    request: RequestEnvelope,
    mutation: (String) -> Result<AudioMutationResult, AudioMutationFailure>
) -> AgentOutput {
    guard let deviceID = request.params.deviceId, !deviceID.isEmpty else {
        return .response(makeErrorResponse(
            id: request.id,
            code: "invalid_argument",
            message: "Audio device id is required."
        ))
    }
    switch mutation(deviceID) {
    case let .success(result):
        return .response(.result(
            id: request.id,
            value: .audioMutation(result)
        ))
    case let .failure(error):
        return .response(makeErrorResponse(
            id: request.id,
            code: error.code,
            message: error.message
        ))
    }
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
