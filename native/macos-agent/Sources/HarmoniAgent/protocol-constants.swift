enum AgentErrorMessage {
    static let audioDeviceIDRequired = "Audio device id is required."
    static let cameraControlRequired = "Camera id and control value are required."
    static let cameraPreviewRequired = "Camera id and preview output path are required."
    static let emptyRequestID = "Request id must not be empty."
    static let muteRequired = "Mute state is required."
    static let malformedRequestEnvelope = "Malformed request envelope."
    static let permissionCategoryRequired = "Permission category is required."
    static let unsupportedMethod = "Unsupported method."
    static let unsupportedPermissionCategory = "Unsupported permission category."
    static let unsupportedProtocolVersion = "Unsupported protocol version."
    static let volumeRequired = "Volume is required."
}

enum AgentProtocolIdentifier {
    static let developmentAudioInput = "development.audio-input"
}
