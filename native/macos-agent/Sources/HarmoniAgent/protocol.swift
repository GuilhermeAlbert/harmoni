import Foundation

let PROTOCOL_VERSION = 1

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
    let code: String
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
    let kind: String
    let version: Int
    let event: DeviceEvent
}

struct DeviceEvent: Encodable {
    let id: String
    let category: String
    let change: String
    let occurredAt: String
}

func stableDeviceEventID(prefix: String, value: String) -> String {
    var hash: UInt64 = 14_695_981_039_346_656_037
    for byte in value.utf8 {
        hash = (hash ^ UInt64(byte)) &* 1_099_511_628_211
    }
    return "\(prefix).\(String(hash, radix: 16))"
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
    code: String,
    message: String
) -> ResponseEnvelope {
    .error(id: id, value: ErrorPayload(code: code, message: message))
}

func makeDevelopmentDeviceEvent() -> DeviceEventEnvelope {
    DeviceEventEnvelope(
        kind: "device-change",
        version: PROTOCOL_VERSION,
        event: DeviceEvent(
            id: "development.audio-input",
            category: "audio-input",
            change: "connected",
            occurredAt: "2026-01-01T00:00:00Z"
        )
    )
}
