import Testing
@testable import HarmoniAgent

@Test func filtersServiceCollectionsAndGroupsPhysicalDevices() {
    let records = [
        HidDeviceMetadata(name: "Keychron K10", manufacturer: "Keychron", vendorID: 1452, productID: 591, locationID: 18087936, transport: "USB", usagePage: 1, usage: 6, registryID: 1, batteryPercent: nil),
        HidDeviceMetadata(name: "Keychron K10", manufacturer: "Keychron", vendorID: 1452, productID: 591, locationID: 18087936, transport: "USB", usagePage: 12, usage: 1, registryID: 2, batteryPercent: nil),
        HidDeviceMetadata(name: "New Battery", manufacturer: "", vendorID: nil, productID: nil, locationID: nil, transport: "SPMI", usagePage: 132, usage: 1, registryID: 3, batteryPercent: 87),
    ]

    let peripherals = normalizeHidMetadata(records)

    #expect(peripherals.count == 1)
    #expect(peripherals[0].name == "Keychron K10")
    #expect(peripherals[0].category == "keyboard")
}

@Test func reportsLightingCapabilitiesWithoutInferringWritableProtocols() {
    let records = [
        HidDeviceMetadata(name: "fifine Microphone", manufacturer: "MV-SILICON", vendorID: 12610, productID: 40976, locationID: 1, transport: "USB", usagePage: 12, usage: 1, registryID: 1, batteryPercent: nil, maxOutputReportSize: 0, maxFeatureReportSize: 0),
        HidDeviceMetadata(name: "Keychron K10", manufacturer: "Keychron", vendorID: 1452, productID: 591, locationID: 2, transport: "USB", usagePage: 1, usage: 6, registryID: 2, batteryPercent: nil, maxOutputReportSize: 1, maxFeatureReportSize: 64),
    ]

    let diagnostic = makeLightingDiagnostic(records)

    #expect(diagnostic.schemaVersion == 1)
    #expect(diagnostic.candidates.count == 2)
    #expect(diagnostic.candidates[0].protocolStatus == "unsupported")
    #expect(diagnostic.candidates[0].power == "unsupported")
    #expect(diagnostic.candidates[1].protocolStatus == "unknown")
    #expect(diagnostic.candidates[1].staticColor == "unknown")
}

@Test func keepsOnlyValidBatteryMetadataAndBuildsStableFallbackName() {
    let records = [
        HidDeviceMetadata(name: "", manufacturer: "Acme", vendorID: 1, productID: 2, locationID: 3, transport: "Bluetooth", usagePage: 1, usage: 2, registryID: 10, batteryPercent: 101),
    ]

    let peripherals = normalizeHidMetadata(records)

    #expect(peripherals.count == 1)
    #expect(peripherals[0].name == "Acme Mouse")
    #expect(peripherals[0].batteryPercent == nil)
}

@Test func usesProductSemanticsToChooseAmongValidCompositeFunctions() {
    let records = [
        HidDeviceMetadata(name: "Apple Internal Keyboard / Trackpad", manufacturer: "Apple", vendorID: nil, productID: nil, locationID: 282, transport: "FIFO", usagePage: 1, usage: 2, registryID: 20, batteryPercent: nil),
        HidDeviceMetadata(name: "Apple Internal Keyboard / Trackpad", manufacturer: "Apple", vendorID: nil, productID: nil, locationID: 282, transport: "FIFO", usagePage: 1, usage: 6, registryID: 21, batteryPercent: nil),
    ]

    let peripherals = normalizeHidMetadata(records)

    #expect(peripherals.count == 1)
    #expect(peripherals[0].category == "keyboard")
}
