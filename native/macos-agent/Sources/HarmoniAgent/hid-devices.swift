import ApplicationServices
import Foundation
import IOKit.hid

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

struct HidDeviceIdentifier: Hashable {
    let vendorID: Int
    let productID: Int
}

private struct HidUsage: Hashable {
    let page: Int
    let usage: Int

    static let gameController = HidUsage(page: 1, usage: 5)
    static let joystick = HidUsage(page: 1, usage: 4)
    static let keyboard = HidUsage(page: 1, usage: 6)
    static let mouse = HidUsage(page: 1, usage: 2)
    static let trackpad = HidUsage(page: 13, usage: 5)
}

private enum PeripheralCategory: String {
    case gameController = "game-controller"
    case keyboard
    case mouse
    case trackpad
}

private enum PeripheralTransport: String {
    case bluetooth
    case builtIn = "built-in"
    case unknown
    case usb
    case wireless
}

private let knownLightingDeviceIdentifiers: Set<HidDeviceIdentifier> = [
    HidDeviceIdentifier(vendorID: 12_610, productID: 40_976),
    HidDeviceIdentifier(vendorID: 1_452, productID: 591),
    HidDeviceIdentifier(vendorID: 1_133, productID: 49_288),
]

private let peripheralCategoriesByUsage: [HidUsage: PeripheralCategory] = [
    .gameController: .gameController,
    .joystick: .gameController,
    .keyboard: .keyboard,
    .mouse: .mouse,
    .trackpad: .trackpad,
]

func discoverHidDevices() -> HidDiscoveryResult {
    let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
    IOHIDManagerSetDeviceMatching(manager, nil)
    IOHIDManagerOpen(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    let devices = (IOHIDManagerCopyDevices(manager) as? Set<IOHIDDevice>) ?? []
    let peripherals = normalizeHidMetadata(devices.map(hidMetadata))
    IOHIDManagerClose(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    return HidDiscoveryResult(
        inputMonitoring: CGPreflightListenEventAccess() ? .authorized : .notGranted,
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
            let status: LightingCapabilityStatus = hasWritableHidReport ? .unknown : .unsupported
            return LightingCandidate(
                id: "lighting-\(fnv1aHash(identity))",
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
    isKnownLightingDevice(vendorID: record.vendorID, productID: record.productID)
}

func isKnownLightingDevice(vendorID: Int?, productID: Int?) -> Bool {
    guard let vendorID, let productID else { return false }
    return knownLightingDeviceIdentifiers.contains(
        HidDeviceIdentifier(vendorID: vendorID, productID: productID)
    )
}

private func lightingIdentity(_ record: HidDeviceMetadata) -> String {
    "\(record.vendorID ?? 0)|\(record.productID ?? 0)|\(record.locationID ?? 0)|\(record.name.lowercased())|\(record.transport.lowercased())"
}

func watchHidDeviceEvents() -> Never {
    let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
    IOHIDManagerSetDeviceMatching(manager, nil)
    IOHIDManagerRegisterDeviceMatchingCallback(manager, { _, _, _, device in
        writeHidChangeEvent(device: device, change: .connected)
    }, nil)
    IOHIDManagerRegisterDeviceRemovalCallback(manager, { _, _, _, device in
        writeHidChangeEvent(device: device, change: .disconnected)
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
    let candidates = records.compactMap { record -> (String, PeripheralCategory, HidDeviceMetadata)? in
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
            id: "hid-\(fnv1aHash(identity))",
            name: name,
            manufacturer: visibleManufacturer,
            category: selected.1.rawValue,
            transport: hidTransport(record.transport),
            vendorId: record.vendorID,
            productId: record.productID,
            batteryPercent: battery
        )
    }.sorted { ($0.category, $0.name, $0.id) < ($1.category, $1.name, $1.id) }
}

private func selectPrimaryHidFunction(
    _ group: [(String, PeripheralCategory, HidDeviceMetadata)]
) -> (String, PeripheralCategory, HidDeviceMetadata)? {
    let name = group.first?.2.name.lowercased() ?? ""
    for (term, category) in [
        ("mouse", PeripheralCategory.mouse),
        ("keyboard", PeripheralCategory.keyboard),
        ("trackpad", PeripheralCategory.trackpad),
        ("controller", PeripheralCategory.gameController),
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

private func hidCategory(page: Int, usage: Int) -> PeripheralCategory? {
    peripheralCategoriesByUsage[HidUsage(page: page, usage: usage)]
}

private func categoryPriority(_ category: PeripheralCategory) -> Int {
    switch category {
    case .trackpad: 0
    case .mouse: 1
    case .keyboard: 2
    case .gameController: 3
    }
}

private func fallbackPeripheralName(
    manufacturer: String,
    category: PeripheralCategory
) -> String {
    let categoryName: String
    switch category {
    case .gameController: categoryName = "Game Controller"
    case .keyboard: categoryName = "Keyboard"
    case .mouse: categoryName = "Mouse"
    case .trackpad: categoryName = "Trackpad"
    }
    return manufacturer.isEmpty ? categoryName : "\(manufacturer) \(categoryName)"
}

private func hidTransport(_ value: String) -> String {
    let normalized = value.lowercased()
    let transport: PeripheralTransport
    if normalized.contains("usb") {
        transport = .usb
    } else if normalized.contains("bluetooth") {
        transport = .bluetooth
    } else if normalized.contains("spi")
        || normalized.contains("fifo")
        || normalized.contains("built") {
        transport = .builtIn
    } else if normalized.contains("wireless") {
        transport = .wireless
    } else {
        transport = .unknown
    }
    return transport.rawValue
}

private func writeHidChangeEvent(device: IOHIDDevice, change: DeviceEventChange) {
    guard let peripheral = normalizeHidMetadata([hidMetadata(device)]).first else { return }
    let category = peripheral.category
    let eventCategory = DeviceEventCategory(rawValue: category) ?? .peripheral
    let eventID = peripheral.id
    let envelope = DeviceEventEnvelope(kind: .deviceChange, version: PROTOCOL_VERSION, event: DeviceEvent(
        id: eventID, category: eventCategory, change: change,
        occurredAt: ISO8601DateFormatter().string(from: Date())
    ))
    let encoder = JSONEncoder(); encoder.outputFormatting = [.sortedKeys]
    guard let data = try? encoder.encode(envelope) else { return }
    FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data([0x0A]))
}
