import Testing
@testable import HarmoniAgent

@Test func recognizesOnlyDeclaredLightingDeviceIdentifiers() {
    #expect(isKnownLightingDevice(vendorID: 12_610, productID: 40_976))
    #expect(isKnownLightingDevice(vendorID: 1_452, productID: 591))
    #expect(isKnownLightingDevice(vendorID: 1_133, productID: 49_288))
    #expect(!isKnownLightingDevice(vendorID: 1_133, productID: 1))
    #expect(!isKnownLightingDevice(vendorID: nil, productID: 49_288))
}

@Test func filtersServiceCollectionsAndGroupsPhysicalDevices() {
    let records = [
        metadata(
            name: "Keychron K10",
            manufacturer: "Keychron",
            vendorID: 1_452,
            productID: 591,
            locationID: 18_087_936,
            usagePage: 1,
            usage: 6
        ),
        metadata(
            name: "Keychron K10",
            manufacturer: "Keychron",
            vendorID: 1_452,
            productID: 591,
            locationID: 18_087_936,
            usagePage: 12,
            usage: 1
        ),
        metadata(
            name: "New Battery",
            transport: "SPMI",
            usagePage: 132,
            usage: 1,
            batteryPercent: 87
        ),
    ]

    let peripherals = normalizeHidMetadata(records)

    #expect(peripherals.count == 1)
    #expect(peripherals[0].name == "Keychron K10")
    #expect(peripherals[0].category == "keyboard")
}

@Test func reportsLightingCapabilitiesWithoutInferringWritableProtocols() {
    let records = [
        metadata(
            name: "fifine Microphone",
            manufacturer: "MV-SILICON",
            vendorID: 12_610,
            productID: 40_976,
            locationID: 1,
            usagePage: 12,
            usage: 1
        ),
        metadata(
            name: "Keychron K10",
            manufacturer: "Keychron",
            vendorID: 1_452,
            productID: 591,
            locationID: 2,
            usagePage: 1,
            usage: 6,
            maxOutputReportSize: 1,
            maxFeatureReportSize: 64
        ),
        metadata(
            name: "G Pro Wireless Gaming Mouse",
            manufacturer: "Logitech",
            vendorID: 1_133,
            productID: 49_288,
            locationID: 3,
            usagePage: 65_280,
            usage: 1,
            maxOutputReportSize: 20,
            maxFeatureReportSize: 1
        ),
        metadata(
            name: "Unknown Device",
            vendorID: 1_133,
            productID: 1,
            locationID: 4,
            usagePage: 1,
            usage: 2
        ),
    ]

    let diagnostic = makeLightingDiagnostic(records)

    #expect(diagnostic.schemaVersion == 1)
    #expect(diagnostic.candidates.count == 3)
    #expect(diagnostic.candidates[0].protocolStatus == .unsupported)
    #expect(diagnostic.candidates[0].power == .unsupported)
    #expect(diagnostic.candidates[1].protocolStatus == .unknown)
    #expect(diagnostic.candidates[1].staticColor == .unknown)
    #expect(diagnostic.candidates[2].name == "Keychron K10")
    #expect(diagnostic.candidates[2].protocolStatus == .unknown)
}

@Test func keepsOnlyValidBatteryMetadataAndBuildsStableFallbackName() {
    let records = [
        metadata(
            manufacturer: "Acme",
            vendorID: 1,
            productID: 2,
            locationID: 3,
            transport: "Bluetooth",
            usagePage: 1,
            usage: 2,
            batteryPercent: 101
        ),
    ]

    let peripherals = normalizeHidMetadata(records)

    #expect(peripherals.count == 1)
    #expect(peripherals[0].name == "Acme Mouse")
    #expect(peripherals[0].batteryPercent == nil)
}

@Test func usesProductSemanticsToChooseAmongValidCompositeFunctions() {
    let records = [
        metadata(
            name: "Apple Internal Keyboard / Trackpad",
            manufacturer: "Apple",
            locationID: 282,
            transport: "FIFO",
            usagePage: 1,
            usage: 2
        ),
        metadata(
            name: "Apple Internal Keyboard / Trackpad",
            manufacturer: "Apple",
            locationID: 282,
            transport: "FIFO",
            usagePage: 1,
            usage: 6
        ),
    ]

    let peripherals = normalizeHidMetadata(records)

    #expect(peripherals.count == 1)
    #expect(peripherals[0].category == "keyboard")
}

@Test func mapsSupportedHidUsagesAndTransports() {
    let records = [
        metadata(name: "Mouse", locationID: 1, transport: "USB", usagePage: 1, usage: 2),
        metadata(name: "Keyboard", locationID: 2, transport: "Bluetooth", usagePage: 1, usage: 6),
        metadata(name: "Trackpad", locationID: 3, transport: "SPI", usagePage: 13, usage: 5),
        metadata(name: "Controller", locationID: 4, transport: "Wireless", usagePage: 1, usage: 5),
    ]

    let peripherals = normalizeHidMetadata(records)
    let values = Dictionary(uniqueKeysWithValues: peripherals.map { ($0.name, ($0.category, $0.transport)) })

    #expect(values["Mouse"]?.0 == "mouse")
    #expect(values["Mouse"]?.1 == "usb")
    #expect(values["Keyboard"]?.0 == "keyboard")
    #expect(values["Keyboard"]?.1 == "bluetooth")
    #expect(values["Trackpad"]?.0 == "trackpad")
    #expect(values["Trackpad"]?.1 == "built-in")
    #expect(values["Controller"]?.0 == "game-controller")
    #expect(values["Controller"]?.1 == "wireless")
}

private func metadata(
    name: String = "",
    manufacturer: String = "",
    vendorID: Int? = nil,
    productID: Int? = nil,
    locationID: Int? = nil,
    transport: String = "USB",
    usagePage: Int,
    usage: Int,
    batteryPercent: Int? = nil,
    maxOutputReportSize: Int = 0,
    maxFeatureReportSize: Int = 0
) -> HidDeviceMetadata {
    HidDeviceMetadata(
        name: name,
        manufacturer: manufacturer,
        vendorID: vendorID,
        productID: productID,
        locationID: locationID,
        transport: transport,
        usagePage: usagePage,
        usage: usage,
        registryID: UInt64(locationID ?? 0),
        batteryPercent: batteryPercent,
        maxOutputReportSize: maxOutputReportSize,
        maxFeatureReportSize: maxFeatureReportSize
    )
}
