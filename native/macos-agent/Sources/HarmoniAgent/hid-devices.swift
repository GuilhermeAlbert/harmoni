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
    let connected: Bool
    let batteryPercent: Int?
    let canDisable: Bool
    let disableReason: String?
}

func discoverHidDevices() -> HidDiscoveryResult {
    let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
    IOHIDManagerSetDeviceMatching(manager, nil)
    IOHIDManagerOpen(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    let devices = (IOHIDManagerCopyDevices(manager) as? Set<IOHIDDevice>) ?? []
    let peripherals = devices.compactMap(makePeripheral).sorted { ($0.category, $0.name, $0.id) < ($1.category, $1.name, $1.id) }
    IOHIDManagerClose(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    return HidDiscoveryResult(
        inputMonitoring: CGPreflightListenEventAccess() ? "authorized" : "unknown",
        peripherals: peripherals
    )
}

func watchHidDeviceEvents() -> Never {
    let manager = IOHIDManagerCreate(kCFAllocatorDefault, IOOptionBits(kIOHIDOptionsTypeNone))
    IOHIDManagerSetDeviceMatching(manager, nil)
    IOHIDManagerRegisterDeviceMatchingCallback(manager, { _, _, _, _ in writeHidChangeEvent() }, nil)
    IOHIDManagerRegisterDeviceRemovalCallback(manager, { _, _, _, _ in writeHidChangeEvent() }, nil)
    IOHIDManagerScheduleWithRunLoop(manager, CFRunLoopGetCurrent(), CFRunLoopMode.defaultMode.rawValue)
    IOHIDManagerOpen(manager, IOOptionBits(kIOHIDOptionsTypeNone))
    CFRunLoopRun()
    fatalError("HID event run loop stopped unexpectedly.")
}

private func makePeripheral(_ device: IOHIDDevice) -> DiscoveredPeripheral? {
    let name = stringProperty(device, kIOHIDProductKey) ?? "Unnamed HID device"
    let manufacturer = stringProperty(device, kIOHIDManufacturerKey) ?? "Unknown"
    let vendor = intProperty(device, kIOHIDVendorIDKey)
    let product = intProperty(device, kIOHIDProductIDKey)
    let location = intProperty(device, kIOHIDLocationIDKey)
    let transportValue = stringProperty(device, kIOHIDTransportKey) ?? "Unknown"
    let usagePage = intProperty(device, kIOHIDPrimaryUsagePageKey) ?? 0
    let usage = intProperty(device, kIOHIDPrimaryUsageKey) ?? 0
    var registryID: UInt64 = 0
    IORegistryEntryGetRegistryEntryID(IOHIDDeviceGetService(device), &registryID)
    let identity = "\(vendor ?? 0)|\(product ?? 0)|\(location ?? 0)|\(usagePage)|\(usage)|\(registryID)|\(name)|\(transportValue)"
    return DiscoveredPeripheral(
        id: "hid-\(fnv1a(identity))", name: name, manufacturer: manufacturer,
        category: hidCategory(page: usagePage, usage: usage),
        transport: hidTransport(transportValue), vendorId: vendor, productId: product,
        connected: true, batteryPercent: intProperty(device, "BatteryPercent"),
        canDisable: false, disableReason: "unsupported-by-macos"
    )
}

private func stringProperty(_ device: IOHIDDevice, _ key: String) -> String? {
    IOHIDDeviceGetProperty(device, key as CFString) as? String
}

private func intProperty(_ device: IOHIDDevice, _ key: String) -> Int? {
    (IOHIDDeviceGetProperty(device, key as CFString) as? NSNumber)?.intValue
}

private func hidCategory(page: Int, usage: Int) -> String {
    if page == 1 && usage == 6 { return "keyboard" }
    if page == 1 && usage == 2 { return "mouse" }
    if page == 1 && (usage == 4 || usage == 5) { return "game-controller" }
    if page == 13 && usage == 5 { return "trackpad" }
    return "other"
}

private func hidTransport(_ value: String) -> String {
    let normalized = value.lowercased()
    if normalized.contains("usb") { return "usb" }
    if normalized.contains("bluetooth") { return "bluetooth" }
    if normalized.contains("spi") || normalized.contains("built") { return "built-in" }
    if normalized.contains("wireless") { return "wireless" }
    return "unknown"
}

private func fnv1a(_ value: String) -> String {
    var hash: UInt64 = 14_695_981_039_346_656_037
    for byte in value.utf8 { hash = (hash ^ UInt64(byte)) &* 1_099_511_628_211 }
    return String(hash, radix: 16)
}

private func writeHidChangeEvent() {
    let envelope = DeviceEventEnvelope(kind: "device-change", version: PROTOCOL_VERSION, event: DeviceEvent(
        id: "hid.devices", category: "peripheral", change: "changed",
        occurredAt: ISO8601DateFormatter().string(from: Date())
    ))
    let encoder = JSONEncoder(); encoder.outputFormatting = [.sortedKeys]
    guard let data = try? encoder.encode(envelope) else { return }
    FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data([0x0A]))
}
