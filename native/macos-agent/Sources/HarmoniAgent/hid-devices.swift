import ApplicationServices
import Foundation
import IOKit.hid

struct HidDiscoveryResult: Encodable {
    let inputMonitoring: String
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

struct HidDeviceMetadata {
    let name: String
    let manufacturer: String
    let vendorID: Int?
    let productID: Int?
    let locationID: Int?
    let transport: String
    let usagePage: Int
    let usage: Int
    let registryID: UInt64
    let batteryPercent: Int?
    let maxOutputReportSize: Int
    let maxFeatureReportSize: Int

    init(
        name: String,
        manufacturer: String,
        vendorID: Int?,
        productID: Int?,
        locationID: Int?,
        transport: String,
        usagePage: Int,
        usage: Int,
        registryID: UInt64,
        batteryPercent: Int?,
        maxOutputReportSize: Int = 0,
        maxFeatureReportSize: Int = 0
    ) {
        self.name = name
        self.manufacturer = manufacturer
        self.vendorID = vendorID
        self.productID = productID
        self.locationID = locationID
        self.transport = transport
        self.usagePage = usagePage
        self.usage = usage
        self.registryID = registryID
        self.batteryPercent = batteryPercent
        self.maxOutputReportSize = maxOutputReportSize
        self.maxFeatureReportSize = maxFeatureReportSize
    }
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
    let protocolStatus: String
    let power: String
    let brightness: String
    let staticColor: String
    let effectSelection: String
}

struct LightingInterface: Encodable {
    let usagePage: Int
    let usage: Int
    let maxOutputReportSize: Int
    let maxFeatureReportSize: Int
}

func discoverHidDevices() -> HidDiscoveryResult {
    let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
    IOHIDManagerSetDeviceMatching(manager, nil)
    IOHIDManagerOpen(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    let devices = (IOHIDManagerCopyDevices(manager) as? Set<IOHIDDevice>) ?? []
    let peripherals = normalizeHidMetadata(devices.map(hidMetadata))
    IOHIDManagerClose(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    return HidDiscoveryResult(
        inputMonitoring: CGPreflightListenEventAccess() ? "authorized" : "not-granted",
        peripherals: peripherals
    )
}

func discoverLightingDiagnostics() -> LightingDiagnosticResult {
    let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
    IOHIDManagerSetDeviceMatching(manager, nil)
    IOHIDManagerOpen(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    let devices = (IOHIDManagerCopyDevices(manager) as? Set<IOHIDDevice>) ?? []
    let result = makeLightingDiagnostic(devices.map(hidMetadata))
    IOHIDManagerClose(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    return result
}

func makeLightingDiagnostic(_ records: [HidDeviceMetadata]) -> LightingDiagnosticResult {
    let candidates = Dictionary(grouping: records.filter(isLightingCandidate), by: lightingIdentity)
        .compactMap { identity, group -> LightingCandidate? in
            guard let first = group.first,
                  let vendorID = first.vendorID,
                  let productID = first.productID
            else { return nil }
            let hasWritableHidReport = group.contains {
                $0.maxOutputReportSize > 0 || $0.maxFeatureReportSize > 0
            }
            let status = hasWritableHidReport ? "unknown" : "unsupported"
            return LightingCandidate(
                id: "lighting-\(fnv1a(identity))",
                name: first.name,
                manufacturer: first.manufacturer,
                vendorId: vendorID,
                productId: productID,
                transport: hidTransport(first.transport),
                interfaces: group.map {
                    LightingInterface(
                        usagePage: $0.usagePage,
                        usage: $0.usage,
                        maxOutputReportSize: $0.maxOutputReportSize,
                        maxFeatureReportSize: $0.maxFeatureReportSize
                    )
                }.sorted { ($0.usagePage, $0.usage) < ($1.usagePage, $1.usage) },
                protocolStatus: status,
                power: status,
                brightness: status,
                staticColor: status,
                effectSelection: status
            )
        }
        .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    return LightingDiagnosticResult(schemaVersion: 1, candidates: candidates)
}

private func isLightingCandidate(_ record: HidDeviceMetadata) -> Bool {
    (record.vendorID == 12_610 && record.productID == 40_976)
        || (record.vendorID == 1_452 && record.productID == 591)
}

private func lightingIdentity(_ record: HidDeviceMetadata) -> String {
    "\(record.vendorID ?? 0)|\(record.productID ?? 0)|\(record.locationID ?? 0)|\(record.name.lowercased())|\(record.transport.lowercased())"
}

func watchHidDeviceEvents() -> Never {
    let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
    IOHIDManagerSetDeviceMatching(manager, nil)
    IOHIDManagerRegisterDeviceMatchingCallback(manager, { _, _, _, device in
        writeHidChangeEvent(device: device, change: "connected")
    }, nil)
    IOHIDManagerRegisterDeviceRemovalCallback(manager, { _, _, _, device in
        writeHidChangeEvent(device: device, change: "disconnected")
    }, nil)
    IOHIDManagerScheduleWithRunLoop(manager, CFRunLoopGetCurrent(), CFRunLoopMode.defaultMode.rawValue)
    IOHIDManagerOpen(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    CFRunLoopRun()
    fatalError("HID event run loop stopped unexpectedly.")
}

private func hidMetadata(_ device: IOHIDDevice) -> HidDeviceMetadata {
    let name = stringProperty(device, kIOHIDProductKey) ?? ""
    let manufacturer = stringProperty(device, kIOHIDManufacturerKey) ?? ""
    let vendor = intProperty(device, kIOHIDVendorIDKey)
    let product = intProperty(device, kIOHIDProductIDKey)
    let location = intProperty(device, kIOHIDLocationIDKey)
    let transportValue = stringProperty(device, kIOHIDTransportKey) ?? "Unknown"
    let usagePage = intProperty(device, kIOHIDPrimaryUsagePageKey) ?? 0
    let usage = intProperty(device, kIOHIDPrimaryUsageKey) ?? 0
    var registryID: UInt64 = 0
    IORegistryEntryGetRegistryEntryID(IOHIDDeviceGetService(device), &registryID)
    return HidDeviceMetadata(
        name: name, manufacturer: manufacturer, vendorID: vendor,
        productID: product, locationID: location, transport: transportValue,
        usagePage: usagePage, usage: usage, registryID: registryID,
        batteryPercent: intProperty(device, "BatteryPercent"),
        maxOutputReportSize: intProperty(device, "MaxOutputReportSize") ?? 0,
        maxFeatureReportSize: intProperty(device, "MaxFeatureReportSize") ?? 0
    )
}

func normalizeHidMetadata(_ records: [HidDeviceMetadata]) -> [DiscoveredPeripheral] {
    let candidates = records.compactMap { record -> (String, String, HidDeviceMetadata)? in
        guard let category = hidCategory(page: record.usagePage, usage: record.usage) else {
            return nil
        }
        let normalizedName = record.name.trimmingCharacters(in: .whitespacesAndNewlines)
        let fallbackIdentity = record.locationID == nil ? record.registryID : 0
        let physicalIdentity = [
            String(record.vendorID ?? 0),
            String(record.productID ?? 0),
            String(record.locationID ?? 0),
            normalizedName.lowercased(),
            record.transport.lowercased(),
            String(fallbackIdentity),
        ].joined(separator: "|")
        return (physicalIdentity, category, record)
    }

    let grouped = Dictionary(grouping: candidates, by: { $0.0 })
    return grouped.compactMap { identity, group in
        guard let selected = selectPrimaryHidFunction(group) else {
            return nil
        }
        let record = selected.2
        let manufacturer = record.manufacturer.trimmingCharacters(in: .whitespacesAndNewlines)
        let visibleManufacturer = manufacturer.isEmpty ? "Unknown" : manufacturer
        let rawName = record.name.trimmingCharacters(in: .whitespacesAndNewlines)
        let name = rawName.isEmpty
            ? fallbackPeripheralName(manufacturer: manufacturer, category: selected.1)
            : rawName
        let battery = group.compactMap(\.2.batteryPercent).first(where: { (0...100).contains($0) })
        return DiscoveredPeripheral(
            id: "hid-\(fnv1a(identity))",
            name: name,
            manufacturer: visibleManufacturer,
            category: selected.1,
            transport: hidTransport(record.transport),
            vendorId: record.vendorID,
            productId: record.productID,
            batteryPercent: battery
        )
    }.sorted { ($0.category, $0.name, $0.id) < ($1.category, $1.name, $1.id) }
}

private func selectPrimaryHidFunction(
    _ group: [(String, String, HidDeviceMetadata)]
) -> (String, String, HidDeviceMetadata)? {
    let name = group.first?.2.name.lowercased() ?? ""
    for (term, category) in [
        ("mouse", "mouse"),
        ("keyboard", "keyboard"),
        ("trackpad", "trackpad"),
        ("controller", "game-controller"),
    ] where name.contains(term) {
        if let matching = group.first(where: { $0.1 == category }) {
            return matching
        }
    }
    return group.min(by: { categoryPriority($0.1) < categoryPriority($1.1) })
}

private func stringProperty(_ device: IOHIDDevice, _ key: String) -> String? {
    IOHIDDeviceGetProperty(device, key as CFString) as? String
}

private func intProperty(_ device: IOHIDDevice, _ key: String) -> Int? {
    (IOHIDDeviceGetProperty(device, key as CFString) as? NSNumber)?.intValue
}

private func hidCategory(page: Int, usage: Int) -> String? {
    if page == 13 && usage == 5 { return "trackpad" }
    if page == 1 && usage == 2 { return "mouse" }
    if page == 1 && usage == 6 { return "keyboard" }
    if page == 1 && (usage == 4 || usage == 5) { return "game-controller" }
    return nil
}

private func categoryPriority(_ category: String) -> Int {
    switch category {
    case "trackpad": 0
    case "mouse": 1
    case "keyboard": 2
    case "game-controller": 3
    default: 4
    }
}

private func fallbackPeripheralName(manufacturer: String, category: String) -> String {
    let categoryName: String
    switch category {
    case "game-controller": categoryName = "Game Controller"
    case "keyboard": categoryName = "Keyboard"
    case "mouse": categoryName = "Mouse"
    case "trackpad": categoryName = "Trackpad"
    default: categoryName = "Peripheral"
    }
    return manufacturer.isEmpty ? categoryName : "\(manufacturer) \(categoryName)"
}

private func hidTransport(_ value: String) -> String {
    let normalized = value.lowercased()
    if normalized.contains("usb") { return "usb" }
    if normalized.contains("bluetooth") { return "bluetooth" }
    if normalized.contains("spi") || normalized.contains("fifo") || normalized.contains("built") { return "built-in" }
    if normalized.contains("wireless") { return "wireless" }
    return "unknown"
}

private func fnv1a(_ value: String) -> String {
    var hash: UInt64 = 14_695_981_039_346_656_037
    for byte in value.utf8 { hash = (hash ^ UInt64(byte)) &* 1_099_511_628_211 }
    return String(hash, radix: 16)
}

private func writeHidChangeEvent(device: IOHIDDevice, change: String) {
    guard let peripheral = normalizeHidMetadata([hidMetadata(device)]).first else { return }
    let category = peripheral.category
    let eventCategory = ["keyboard", "mouse", "trackpad"].contains(category)
        ? category
        : "peripheral"
    let eventID = peripheral.id
    let envelope = DeviceEventEnvelope(kind: "device-change", version: PROTOCOL_VERSION, event: DeviceEvent(
        id: eventID, category: eventCategory, change: change,
        occurredAt: ISO8601DateFormatter().string(from: Date())
    ))
    let encoder = JSONEncoder(); encoder.outputFormatting = [.sortedKeys]
    guard let data = try? encoder.encode(envelope) else { return }
    FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data([0x0A]))
}
