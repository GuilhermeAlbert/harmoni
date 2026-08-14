struct AudioDiscoveryResult: Encodable {
    let devices: [DiscoveredAudioDevice]
}

struct DiscoveredAudioDevice: Encodable {
    let id: String
    let uid: String
    let name: String
    let direction: AudioDirection
    let transport: AudioTransport
    let isDefault: Bool
    let volume: Int?
    let muted: Bool?
    let canReadVolume: Bool
    let canReadMute: Bool
    let canSetVolume: Bool
    let canSetMute: Bool
    let canSetDefault: Bool
}

enum AudioDirection: String, Encodable {
    case input
    case output
}

enum AudioTransport: String, Encodable {
    case airplay
    case bluetooth
    case builtIn = "built-in"
    case hdmi
    case unknown
    case usb
    case virtual
}

enum AudioErrorMessage {
    static let deviceNotFound = "The requested audio device was not found."
    static let processRejected = "Core Audio rejected the requested change."
    static let unsupportedControl = "The requested control is not supported by this audio device."
    static let volumeOutOfRange = "Volume must be between 0 and 100."
}

struct AudioMutationResult: Encodable {
    let device: DiscoveredAudioDevice
}

struct AudioMutationFailure: Error {
    let code: AgentErrorCode
    let message: String
}
