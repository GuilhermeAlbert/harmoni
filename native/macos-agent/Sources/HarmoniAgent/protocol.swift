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
    case permissionStatus(PermissionStatusResult)
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
        case let .permissionStatus(result):
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
