struct HidDiscoveryResult: Encodable {
    let inputMonitoring: PermissionStatus
    let peripherals: [DiscoveredPeripheral]
}

struct DiscoveredPeripheral: Encodable {
    let id: String
    let name: String
    let manufacturer: String
    let category: String
    let transport: String
    let vendorId: Int?
    let productId: Int?
    let batteryPercent: Int?
}

struct LightingDiagnosticResult: Encodable {
    let schemaVersion: Int
    let candidates: [LightingCandidate]
}

struct LightingCandidate: Encodable {
    let id: String
    let name: String
    let manufacturer: String
    let vendorId: Int
    let productId: Int
    let transport: String
    let interfaces: [LightingInterface]
    let protocolStatus: LightingCapabilityStatus
    let power: LightingCapabilityStatus
    let brightness: LightingCapabilityStatus
    let staticColor: LightingCapabilityStatus
    let effectSelection: LightingCapabilityStatus
}

struct LightingInterface: Encodable {
    let usagePage: Int
    let usage: Int
    let maxOutputReportSize: Int
    let maxFeatureReportSize: Int
}

enum LightingCapabilityStatus: String, Encodable {
    case unknown
    case unsupported
}
