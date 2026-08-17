import CoreAudio

func normalizedAudioVolumePercentage(_ scalar: Float32) -> Int {
    Int((scalar * 100).rounded())
}

func isDefaultPropertySettable(direction: AudioDirection) -> Bool {
    var address = AudioObjectPropertyAddress(
        mSelector: direction == .input
            ? kAudioHardwarePropertyDefaultInputDevice
            : kAudioHardwarePropertyDefaultOutputDevice,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
    return isPropertySettable(
        objectID: AudioObjectID(kAudioObjectSystemObject),
        address: &address
    )
}

func isPropertySettable(
    objectID: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope
) -> Bool {
    var address = AudioObjectPropertyAddress(
        mSelector: selector,
        mScope: scope,
        mElement: kAudioObjectPropertyElementMain
    )
    return isPropertySettable(objectID: objectID, address: &address)
}

func isPropertySettable(
    objectID: AudioObjectID,
    address: inout AudioObjectPropertyAddress
) -> Bool {
    var settable = DarwinBoolean(false)
    return AudioObjectIsPropertySettable(objectID, &address, &settable) == noErr
        && settable.boolValue
}

func audioDeviceIDs() -> [AudioDeviceID] {
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

func defaultDevice(selector: AudioObjectPropertySelector) -> AudioDeviceID {
    uint32Property(
        objectID: AudioObjectID(kAudioObjectSystemObject),
        selector: selector,
        scope: kAudioObjectPropertyScopeGlobal
    ) ?? AudioDeviceID(kAudioObjectUnknown)
}

func hasStreams(
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

func transportName(deviceID: AudioDeviceID) -> AudioTransport {
    guard let value = uint32Property(
        objectID: deviceID,
        selector: kAudioDevicePropertyTransportType,
        scope: kAudioObjectPropertyScopeGlobal
    ) else {
        return .unknown
    }

    switch value {
    case kAudioDeviceTransportTypeBuiltIn:
        return .builtIn
    case kAudioDeviceTransportTypeBluetooth, kAudioDeviceTransportTypeBluetoothLE:
        return .bluetooth
    case kAudioDeviceTransportTypeHDMI, kAudioDeviceTransportTypeDisplayPort:
        return .hdmi
    case kAudioDeviceTransportTypeUSB:
        return .usb
    case kAudioDeviceTransportTypeAirPlay:
        return .airplay
    case kAudioDeviceTransportTypeVirtual, kAudioDeviceTransportTypeAggregate:
        return .virtual
    default:
        return .unknown
    }
}

func uint32Property(
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

func floatProperty(
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

func stringProperty(
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
