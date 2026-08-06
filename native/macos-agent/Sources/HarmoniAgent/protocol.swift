import Foundation

let PROTOCOL_VERSION = 1

struct RequestEnvelope: Decodable {
    let id: String
    let version: Int
    let method: String
    let params: AgentInfoParameters
}

struct AgentInfoParameters: Codable {}

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

enum ResponseEnvelope: Encodable {
    case result(id: String, value: AgentInfoResult)
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
