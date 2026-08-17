import Foundation

let PROTOCOL_VERSION = 1

enum AgentMethod: String, CaseIterable {
    case agentInfo = "agent.info"
    case audioDevices = "audio.devices"
    case audioSetDefaultInput = "audio.setDefaultInput"
    case audioSetDefaultOutput = "audio.setDefaultOutput"
    case audioSetMute = "audio.setMute"
    case audioSetVolume = "audio.setVolume"
    case audioWatchDeviceEvents = "audio.watchDeviceEvents"
    case cameraDevices = "camera.devices"
    case cameraSetExposure = "camera.setExposure"
    case cameraSetZoom = "camera.setZoom"
    case cameraStartPreview = "camera.startPreview"
    case cameraWatchDeviceEvents = "camera.watchDeviceEvents"
    case developmentEmitDeviceEvent = "development.emitDeviceEvent"
    case hidDevices = "hid.devices"
    case hidLightingDiagnostics = "hid.lightingDiagnostics"
    case hidWatchDeviceEvents = "hid.watchDeviceEvents"
    case permissionsOpenSettings = "permissions.openSettings"
    case permissionsStatus = "permissions.status"
}

enum AgentErrorCode: String, Encodable {
    case cameraInUse = "camera_in_use"
    case invalidArgument = "invalid_argument"
    case invalidRequest = "invalid_request"
    case methodNotFound = "method_not_found"
    case notFound = "not_found"
    case permissionDenied = "permission_denied"
    case process
    case protocolMismatch = "protocol_mismatch"
    case unsupported
}

enum DeviceEventKind: String, Encodable {
    case deviceChange = "device-change"
}

enum DeviceEventCategory: String, Encodable {
    case audio
    case audioInput = "audio-input"
    case audioOutput = "audio-output"
    case camera
    case keyboard
    case mouse
    case peripheral
    case trackpad
}

enum DeviceEventChange: String, Encodable {
    case connected
    case defaultChanged = "default-changed"
    case disconnected
    case inventoryChanged = "inventory-changed"
    case muteChanged = "mute-changed"
    case volumeChanged = "volume-changed"
}

struct RequestEnvelope: Decodable {
    let id: String
    let version: Int
    let method: String
    let params: RequestParameters
}

struct RequestParameters: Codable {
    let category: String?
    let deviceId: String?
    let volume: Int?
    let muted: Bool?
    let cameraId: String?
    let value: Double?
    let outputPath: String?
}

struct AgentInfoResult: Encodable {
    let agentVersion: String
    let architecture: String
    let macOSVersion: String
    let processIdentifier: Int32
    let protocolVersion: Int
}

struct ErrorPayload: Encodable {
    let code: AgentErrorCode
    let message: String
}

enum ResultPayload: Encodable {
    case agentInfo(AgentInfoResult)
    case audioDevices(AudioDiscoveryResult)
    case audioMutation(AudioMutationResult)
    case cameras(CameraDiscoveryResult)
    case cameraMutation(CameraMutationResult)
    case hidDevices(HidDiscoveryResult)
    case lightingDiagnostics(LightingDiagnosticResult)
    case permissionStatus(PermissionStatusResult)
    case previewStart(CameraPreviewStartResult)
    case openSettings(OpenSettingsResult)

    func encode(to encoder: Encoder) throws {
        switch self {
        case let .agentInfo(result):
            try result.encode(to: encoder)
        case let .audioDevices(result):
            try result.encode(to: encoder)
        case let .audioMutation(result):
            try result.encode(to: encoder)
        case let .cameras(result):
            try result.encode(to: encoder)
        case let .cameraMutation(result):
            try result.encode(to: encoder)
        case let .hidDevices(result):
            try result.encode(to: encoder)
        case let .lightingDiagnostics(result):
            try result.encode(to: encoder)
        case let .permissionStatus(result):
            try result.encode(to: encoder)
        case let .previewStart(result):
            try result.encode(to: encoder)
        case let .openSettings(result):
            try result.encode(to: encoder)
        }
    }
}

struct DeviceEventEnvelope: Encodable {
    let kind: DeviceEventKind
    let version: Int
    let event: DeviceEvent
}

struct DeviceEvent: Encodable {
    let id: String
    let category: DeviceEventCategory
    let change: DeviceEventChange
    let occurredAt: String
}

func stableDeviceEventID(prefix: String, value: String) -> String {
    "\(prefix).\(fnv1aHash(value))"
}

func fnv1aHash(_ value: String) -> String {
    var hash: UInt64 = 14_695_981_039_346_656_037
    for byte in value.utf8 {
        hash = (hash ^ UInt64(byte)) &* 1_099_511_628_211
    }
    return String(hash, radix: 16)
}

enum AgentOutput: Encodable {
    case response(ResponseEnvelope)
    case deviceEvent(DeviceEventEnvelope)

    func encode(to encoder: Encoder) throws {
        switch self {
        case let .response(response):
            try response.encode(to: encoder)
        case let .deviceEvent(event):
            try event.encode(to: encoder)
        }
    }
}

enum ResponseEnvelope: Encodable {
    case result(id: String, value: ResultPayload)
    case error(id: String?, value: ErrorPayload)

    private enum CodingKeys: String, CodingKey {
        case id
        case version
        case result
        case error
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)

        switch self {
        case let .result(id, value):
            try container.encode(id, forKey: .id)
            try container.encode(PROTOCOL_VERSION, forKey: .version)
            try container.encode(value, forKey: .result)
        case let .error(id, value):
            if let id {
                try container.encode(id, forKey: .id)
            } else {
                try container.encodeNil(forKey: .id)
            }
            try container.encode(PROTOCOL_VERSION, forKey: .version)
            try container.encode(value, forKey: .error)
        }
    }
}

func makeErrorResponse(
    id: String?,
    code: AgentErrorCode,
    message: String
) -> ResponseEnvelope {
    .error(id: id, value: ErrorPayload(code: code, message: message))
}

func makeDevelopmentDeviceEvent() -> DeviceEventEnvelope {
    DeviceEventEnvelope(
        kind: .deviceChange,
        version: PROTOCOL_VERSION,
        event: DeviceEvent(
            id: AgentProtocolIdentifier.developmentAudioInput,
            category: .audioInput,
            change: .connected,
            occurredAt: "2026-01-01T00:00:00Z"
        )
    )
}
