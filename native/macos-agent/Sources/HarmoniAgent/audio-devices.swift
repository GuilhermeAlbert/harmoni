import CoreAudio
import Foundation

struct AudioDiscoveryResult: Encodable {
    let devices: [DiscoveredAudioDevice]
}

struct DiscoveredAudioDevice: Encodable {
    let id: String
    let uid: String
    let name: String
    let direction: String
    let transport: String
    let isDefault: Bool
    let volume: Int?
    let muted: Bool?
    let canReadVolume: Bool
    let canReadMute: Bool
}

func discoverAudioDevices() -> AudioDiscoveryResult {
    let defaultInput = defaultDevice(
        selector: kAudioHardwarePropertyDefaultInputDevice
    )
    let defaultOutput = defaultDevice(
        selector: kAudioHardwarePropertyDefaultOutputDevice
    )
    var discovered: [DiscoveredAudioDevice] = []

    for deviceID in audioDeviceIDs() {
        guard let uid = stringProperty(
            objectID: deviceID,
            selector: kAudioDevicePropertyDeviceUID
        ),
            let name = stringProperty(
                objectID: deviceID,
                selector: kAudioObjectPropertyName
            )
        else {
            continue
        }

        let transport = transportName(deviceID: deviceID)

        if hasStreams(deviceID: deviceID, scope: kAudioDevicePropertyScopeInput) {
            discovered.append(makeAudioDevice(
                deviceID: deviceID,
                uid: uid,
                name: name,
                direction: "input",
                scope: kAudioDevicePropertyScopeInput,
                transport: transport,
                isDefault: deviceID == defaultInput
            ))
        }

        if hasStreams(deviceID: deviceID, scope: kAudioDevicePropertyScopeOutput) {
            discovered.append(makeAudioDevice(
                deviceID: deviceID,
                uid: uid,
                name: name,
                direction: "output",
                scope: kAudioDevicePropertyScopeOutput,
                transport: transport,
                isDefault: deviceID == defaultOutput
            ))
        }
    }

    return AudioDiscoveryResult(devices: discovered.sorted {
        ($0.direction, $0.name, $0.uid) < ($1.direction, $1.name, $1.uid)
    })
}

func watchAudioDeviceEvents() -> Never {
    var address = AudioObjectPropertyAddress(
        mSelector: kAudioHardwarePropertyDevices,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
    let queue = DispatchQueue(label: "com.harmoni.audio-device-events")
    let status = AudioObjectAddPropertyListenerBlock(
        AudioObjectID(kAudioObjectSystemObject),
        &address,
        queue
    ) { _, _ in
        writeAudioDeviceChangeEvent()
    }

    guard status == noErr else {
        FileHandle.standardError.write(
            Data("Failed to observe Core Audio device changes.\n".utf8)
        )
        exit(EXIT_FAILURE)
    }

    while true {
        RunLoop.current.run(until: Date.distantFuture)
    }
}

private func makeAudioDevice(
    deviceID: AudioDeviceID,
    uid: String,
    name: String,
    direction: String,
    scope: AudioObjectPropertyScope,
    transport: String,
    isDefault: Bool
) -> DiscoveredAudioDevice {
    let volumeScalar = floatProperty(
        objectID: deviceID,
        selector: kAudioDevicePropertyVolumeScalar,
        scope: scope
    )
    let muteValue = uint32Property(
        objectID: deviceID,
        selector: kAudioDevicePropertyMute,
        scope: scope
    )

    return DiscoveredAudioDevice(
        id: "\(uid):\(direction)",
        uid: uid,
        name: name,
        direction: direction,
        transport: transport,
        isDefault: isDefault,
        volume: volumeScalar.map { Int(($0 * 100).rounded()) },
        muted: muteValue.map { $0 != 0 },
        canReadVolume: volumeScalar != nil,
        canReadMute: muteValue != nil
    )
}

private func audioDeviceIDs() -> [AudioDeviceID] {
    var address = AudioObjectPropertyAddress(
        mSelector: kAudioHardwarePropertyDevices,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
    var size: UInt32 = 0

    guard AudioObjectGetPropertyDataSize(
        AudioObjectID(kAudioObjectSystemObject),
        &address,
        0,
        nil,
        &size
    ) == noErr else {
        return []
    }

    let count = Int(size) / MemoryLayout<AudioDeviceID>.size
    var devices = [AudioDeviceID](repeating: 0, count: count)

    guard AudioObjectGetPropertyData(
        AudioObjectID(kAudioObjectSystemObject),
        &address,
        0,
        nil,
        &size,
        &devices
    ) == noErr else {
        return []
    }

    return devices
}

private func defaultDevice(selector: AudioObjectPropertySelector) -> AudioDeviceID {
    uint32Property(
        objectID: AudioObjectID(kAudioObjectSystemObject),
        selector: selector,
        scope: kAudioObjectPropertyScopeGlobal
    ) ?? AudioDeviceID(kAudioObjectUnknown)
}

private func hasStreams(
    deviceID: AudioDeviceID,
    scope: AudioObjectPropertyScope
) -> Bool {
    var address = AudioObjectPropertyAddress(
        mSelector: kAudioDevicePropertyStreams,
        mScope: scope,
        mElement: kAudioObjectPropertyElementMain
    )
    var size: UInt32 = 0

    return AudioObjectGetPropertyDataSize(
        deviceID,
        &address,
        0,
        nil,
        &size
    ) == noErr && size > 0
}

private func transportName(deviceID: AudioDeviceID) -> String {
    guard let value = uint32Property(
        objectID: deviceID,
        selector: kAudioDevicePropertyTransportType,
        scope: kAudioObjectPropertyScopeGlobal
    ) else {
        return "unknown"
    }

    switch value {
    case kAudioDeviceTransportTypeBuiltIn:
        return "built-in"
    case kAudioDeviceTransportTypeBluetooth, kAudioDeviceTransportTypeBluetoothLE:
        return "bluetooth"
    case kAudioDeviceTransportTypeHDMI, kAudioDeviceTransportTypeDisplayPort:
        return "hdmi"
    case kAudioDeviceTransportTypeUSB:
        return "usb"
    case kAudioDeviceTransportTypeAirPlay:
        return "airplay"
    case kAudioDeviceTransportTypeVirtual, kAudioDeviceTransportTypeAggregate:
        return "virtual"
    default:
        return "unknown"
    }
}

private func uint32Property(
    objectID: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope
) -> UInt32? {
    var address = AudioObjectPropertyAddress(
        mSelector: selector,
        mScope: scope,
        mElement: kAudioObjectPropertyElementMain
    )
    var value: UInt32 = 0
    var size = UInt32(MemoryLayout<UInt32>.size)

    guard AudioObjectHasProperty(objectID, &address),
          AudioObjectGetPropertyData(
              objectID,
              &address,
              0,
              nil,
              &size,
              &value
          ) == noErr
    else {
        return nil
    }

    return value
}

private func floatProperty(
    objectID: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope
) -> Float32? {
    var address = AudioObjectPropertyAddress(
        mSelector: selector,
        mScope: scope,
        mElement: kAudioObjectPropertyElementMain
    )
    var value: Float32 = 0
    var size = UInt32(MemoryLayout<Float32>.size)

    guard AudioObjectHasProperty(objectID, &address),
          AudioObjectGetPropertyData(
              objectID,
              &address,
              0,
              nil,
              &size,
              &value
          ) == noErr
    else {
        return nil
    }

    return value
}

private func stringProperty(
    objectID: AudioObjectID,
    selector: AudioObjectPropertySelector
) -> String? {
    var address = AudioObjectPropertyAddress(
        mSelector: selector,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
    var value: Unmanaged<CFString>?
    var size = UInt32(MemoryLayout<Unmanaged<CFString>?>.size)

    guard AudioObjectHasProperty(objectID, &address),
          AudioObjectGetPropertyData(
              objectID,
              &address,
              0,
              nil,
              &size,
              &value
          ) == noErr
    else {
        return nil
    }

    return value?.takeUnretainedValue() as String?
}

private func writeAudioDeviceChangeEvent() {
    let envelope = DeviceEventEnvelope(
        kind: "device-change",
        version: PROTOCOL_VERSION,
        event: DeviceEvent(
            id: "audio.devices",
            category: "audio",
            change: "changed",
            occurredAt: ISO8601DateFormatter().string(from: Date())
        )
    )
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]

    guard let data = try? encoder.encode(envelope) else {
        return
    }

    FileHandle.standardOutput.write(data)
    FileHandle.standardOutput.write(Data([0x0A]))
}
