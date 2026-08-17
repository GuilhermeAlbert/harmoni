func handleRequest(_ request: RequestEnvelope) -> AgentOutput {
    guard !request.id.isEmpty else {
        return errorOutput(id: nil, code: .invalidRequest, message: AgentErrorMessage.emptyRequestID)
    }
    guard request.version == PROTOCOL_VERSION else {
        return errorOutput(
            id: request.id,
            code: .protocolMismatch,
            message: AgentErrorMessage.unsupportedProtocolVersion
        )
    }
    guard let method = AgentMethod(rawValue: request.method) else {
        return errorOutput(
            id: request.id,
            code: .methodNotFound,
            message: AgentErrorMessage.unsupportedMethod
        )
    }

    switch method {
    case .agentInfo:
        return resultOutput(id: request.id, value: .agentInfo(makeAgentInfo()))
    case .audioDevices:
        return resultOutput(id: request.id, value: .audioDevices(discoverAudioDevices()))
    case .audioSetDefaultInput:
        return audioMutationOutput(request: request) {
            setDefaultAudioDevice(stableID: $0, direction: .input)
        }
    case .audioSetDefaultOutput:
        return audioMutationOutput(request: request) {
            setDefaultAudioDevice(stableID: $0, direction: .output)
        }
    case .audioSetMute:
        guard let muted = request.params.muted else {
            return errorOutput(
                id: request.id,
                code: .invalidArgument,
                message: AgentErrorMessage.muteRequired
            )
        }
        return audioMutationOutput(request: request) {
            setAudioMute(stableID: $0, muted: muted)
        }
    case .audioSetVolume:
        guard let volume = request.params.volume else {
            return errorOutput(
                id: request.id,
                code: .invalidArgument,
                message: AgentErrorMessage.volumeRequired
            )
        }
        return audioMutationOutput(request: request) {
            setAudioVolume(stableID: $0, volume: volume)
        }
    case .audioWatchDeviceEvents:
        watchAudioDeviceEvents()
    case .cameraDevices:
        return resultOutput(id: request.id, value: .cameras(discoverCameras()))
    case .cameraSetExposure:
        return cameraMutationOutput(request: request) {
            setCameraExposure(stableID: $0, value: $1)
        }
    case .cameraSetZoom:
        return cameraMutationOutput(request: request) {
            setCameraZoom(stableID: $0, value: $1)
        }
    case .cameraStartPreview:
        return cameraPreviewOutput(request: request)
    case .cameraWatchDeviceEvents:
        watchCameraDeviceEvents()
    case .developmentEmitDeviceEvent:
        return .deviceEvent(makeDevelopmentDeviceEvent())
    case .hidDevices:
        return resultOutput(id: request.id, value: .hidDevices(discoverHidDevices()))
    case .hidLightingDiagnostics:
        return resultOutput(
            id: request.id,
            value: .lightingDiagnostics(discoverLightingDiagnostics())
        )
    case .hidWatchDeviceEvents:
        watchHidDeviceEvents()
    case .permissionsOpenSettings:
        return permissionSettingsOutput(request: request)
    case .permissionsStatus:
        return resultOutput(id: request.id, value: .permissionStatus(readPermissionStatus()))
    }
}

private func permissionSettingsOutput(request: RequestEnvelope) -> AgentOutput {
    guard let category = request.params.category else {
        return errorOutput(
            id: request.id,
            code: .invalidRequest,
            message: AgentErrorMessage.permissionCategoryRequired
        )
    }
    guard let result = openPermissionSettings(category: category) else {
        return errorOutput(
            id: request.id,
            code: .invalidRequest,
            message: AgentErrorMessage.unsupportedPermissionCategory
        )
    }
    return resultOutput(id: request.id, value: .openSettings(result))
}

private func cameraPreviewOutput(request: RequestEnvelope) -> AgentOutput {
    guard let cameraID = request.params.cameraId,
          let outputPath = request.params.outputPath
    else {
        return errorOutput(
            id: request.id,
            code: .invalidArgument,
            message: AgentErrorMessage.cameraPreviewRequired
        )
    }
    switch CameraPreviewManager.shared.start(cameraID: cameraID, outputPath: outputPath) {
    case let .success(result):
        return resultOutput(id: request.id, value: .previewStart(result))
    case let .failure(error):
        return errorOutput(id: request.id, code: error.code, message: error.message)
    }
}

private func cameraMutationOutput(
    request: RequestEnvelope,
    mutation: (String, Double) -> Result<CameraMutationResult, CameraMutationFailure>
) -> AgentOutput {
    guard let cameraID = request.params.cameraId, !cameraID.isEmpty,
          let value = request.params.value
    else {
        return errorOutput(
            id: request.id,
            code: .invalidArgument,
            message: AgentErrorMessage.cameraControlRequired
        )
    }
    switch mutation(cameraID, value) {
    case let .success(result):
        return resultOutput(id: request.id, value: .cameraMutation(result))
    case let .failure(error):
        return errorOutput(id: request.id, code: error.code, message: error.message)
    }
}

private func audioMutationOutput(
    request: RequestEnvelope,
    mutation: (String) -> Result<AudioMutationResult, AudioMutationFailure>
) -> AgentOutput {
    guard let deviceID = request.params.deviceId, !deviceID.isEmpty else {
        return errorOutput(
            id: request.id,
            code: .invalidArgument,
            message: AgentErrorMessage.audioDeviceIDRequired
        )
    }
    switch mutation(deviceID) {
    case let .success(result):
        return resultOutput(id: request.id, value: .audioMutation(result))
    case let .failure(error):
        return errorOutput(id: request.id, code: error.code, message: error.message)
    }
}

private func resultOutput(id: String, value: ResultPayload) -> AgentOutput {
    .response(.result(id: id, value: value))
}

private func errorOutput(id: String?, code: AgentErrorCode, message: String) -> AgentOutput {
    .response(makeErrorResponse(id: id, code: code, message: message))
}
