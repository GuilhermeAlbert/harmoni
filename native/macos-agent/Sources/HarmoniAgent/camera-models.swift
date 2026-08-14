struct CameraDiscoveryResult: Encodable {
    let authorization: PermissionStatus
    let cameras: [DiscoveredCamera]
}

struct DiscoveredCamera: Encodable {
    let id: String
    let name: String
    let transport: CameraTransport
    let preferred: Bool
    let formats: [DiscoveredCameraFormat]
    let zoom: CameraCapability?
    let exposure: CameraCapability?
}

enum CameraTransport: String, Encodable {
    case builtIn = "built-in"
    case continuity
    case external
    case unknown
}

enum CameraErrorMessage {
    static let cameraDisconnected = "The selected camera is no longer connected."
    static let cameraInUse = "The camera could not start. It may be in use by another application."
    static let cameraNotFound = "The requested camera was not found."
    static let invalidControlValue = "Camera control value must be finite."
    static let previewPermissionRequired = "Camera access is required to start the preview."
    static let previewUnavailable = "The selected camera cannot provide a preview right now."

    static func unsupportedControl(_ control: String) -> String {
        "AVFoundation does not expose reversible \(control) control on macOS."
    }
}

struct DiscoveredCameraFormat: Encodable {
    let width: Int32
    let height: Int32
    let frameRate: Double
}

struct CameraCapability: Encodable {
    let min: Double
    let max: Double
    let value: Double
    let canControl: Bool
}

struct CameraMutationResult: Encodable {
    let camera: DiscoveredCamera
}

struct CameraMutationFailure: Error {
    let code: AgentErrorCode
    let message: String
}
