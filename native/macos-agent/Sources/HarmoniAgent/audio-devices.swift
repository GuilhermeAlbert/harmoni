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
    let canSetVolume: Bool
    let canSetMute: Bool
    let canSetDefault: Bool
}

struct AudioMutationResult: Encodable {
    let device: DiscoveredAudioDevice
}

struct AudioMutationFailure: Error {
    let code: String
    let message: String
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
    let watcher = AudioDeviceEventWatcher()
    guard watcher.start() else {
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
        canReadMute: muteValue != nil,
        canSetVolume: volumeScalar != nil && isPropertySettable(
            objectID: deviceID,
            selector: kAudioDevicePropertyVolumeScalar,
            scope: scope
        ),
        canSetMute: muteValue != nil && isPropertySettable(
            objectID: deviceID,
            selector: kAudioDevicePropertyMute,
            scope: scope
        ),
        canSetDefault: isDefaultPropertySettable(direction: direction)
    )
}

func setDefaultAudioDevice(
    stableID: String,
    direction: String
) -> Result<AudioMutationResult, AudioMutationFailure> {
    guard let target = resolveAudioDevice(stableID: stableID),
          target.device.direction == direction
    else {
        return .failure(AudioMutationFailure(
            code: "not_found",
            message: "The requested audio device was not found."
        ))
    }

    let selector = direction == "input"
        ? kAudioHardwarePropertyDefaultInputDevice
        : kAudioHardwarePropertyDefaultOutputDevice
    var address = AudioObjectPropertyAddress(
        mSelector: selector,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
    guard isPropertySettable(
        objectID: AudioObjectID(kAudioObjectSystemObject),
        address: &address
    ) else {
        return unsupportedMutation()
    }

    var deviceID = target.deviceID
    let status = AudioObjectSetPropertyData(
        AudioObjectID(kAudioObjectSystemObject),
        &address,
        0,
        nil,
        UInt32(MemoryLayout<AudioDeviceID>.size),
        &deviceID
    )
    return mutationResult(stableID: stableID, status: status)
}

func setAudioVolume(
    stableID: String,
    volume: Int
) -> Result<AudioMutationResult, AudioMutationFailure> {
    guard (0...100).contains(volume) else {
        return .failure(AudioMutationFailure(
            code: "invalid_argument",
            message: "Volume must be between 0 and 100."
        ))
    }
    guard let target = resolveAudioDevice(stableID: stableID) else {
        return missingAudioDevice()
    }
    var value = Float32(volume) / 100
    return setFloatAudioProperty(
        target: target,
        selector: kAudioDevicePropertyVolumeScalar,
        value: &value
    )
}

func setAudioMute(
    stableID: String,
    muted: Bool
) -> Result<AudioMutationResult, AudioMutationFailure> {
    guard let target = resolveAudioDevice(stableID: stableID) else {
        return missingAudioDevice()
    }
    var value: UInt32 = muted ? 1 : 0
    return setUInt32AudioProperty(
        target: target,
        selector: kAudioDevicePropertyMute,
        value: &value
    )
}

private struct ResolvedAudioDevice {
    let deviceID: AudioDeviceID
    let scope: AudioObjectPropertyScope
    let device: DiscoveredAudioDevice
}

private func resolveAudioDevice(stableID: String) -> ResolvedAudioDevice? {
    let defaults = (
        input: defaultDevice(selector: kAudioHardwarePropertyDefaultInputDevice),
        output: defaultDevice(selector: kAudioHardwarePropertyDefaultOutputDevice)
    )
    for deviceID in audioDeviceIDs() {
        guard let uid = stringProperty(
            objectID: deviceID,
            selector: kAudioDevicePropertyDeviceUID
        ), let name = stringProperty(
            objectID: deviceID,
            selector: kAudioObjectPropertyName
        ) else {
            continue
        }
        let transport = transportName(deviceID: deviceID)
        let directions: [(String, AudioObjectPropertyScope, Bool)] = [
            ("input", kAudioDevicePropertyScopeInput, deviceID == defaults.input),
            ("output", kAudioDevicePropertyScopeOutput, deviceID == defaults.output),
        ]
        for (direction, scope, isDefault) in directions
        where stableID == "\(uid):\(direction)" && hasStreams(deviceID: deviceID, scope: scope) {
            return ResolvedAudioDevice(
                deviceID: deviceID,
                scope: scope,
                device: makeAudioDevice(
                    deviceID: deviceID,
                    uid: uid,
                    name: name,
                    direction: direction,
                    scope: scope,
                    transport: transport,
                    isDefault: isDefault
                )
            )
        }
    }
    return nil
}

private func setFloatAudioProperty(
    target: ResolvedAudioDevice,
    selector: AudioObjectPropertySelector,
    value: inout Float32
) -> Result<AudioMutationResult, AudioMutationFailure> {
    setAudioProperty(
        target: target,
        selector: selector,
        data: &value,
        size: UInt32(MemoryLayout<Float32>.size)
    )
}

private func setUInt32AudioProperty(
    target: ResolvedAudioDevice,
    selector: AudioObjectPropertySelector,
    value: inout UInt32
) -> Result<AudioMutationResult, AudioMutationFailure> {
    setAudioProperty(
        target: target,
        selector: selector,
        data: &value,
        size: UInt32(MemoryLayout<UInt32>.size)
    )
}

private func setAudioProperty(
    target: ResolvedAudioDevice,
    selector: AudioObjectPropertySelector,
    data: UnsafeRawPointer,
    size: UInt32
) -> Result<AudioMutationResult, AudioMutationFailure> {
    var address = AudioObjectPropertyAddress(
        mSelector: selector,
        mScope: target.scope,
        mElement: kAudioObjectPropertyElementMain
    )
    guard isPropertySettable(objectID: target.deviceID, address: &address) else {
        return unsupportedMutation()
    }
    let status = AudioObjectSetPropertyData(
        target.deviceID,
        &address,
        0,
        nil,
        size,
        data
    )
    return mutationResult(stableID: target.device.id, status: status)
}

private func mutationResult(
    stableID: String,
    status: OSStatus
) -> Result<AudioMutationResult, AudioMutationFailure> {
    guard status == noErr else {
        return .failure(AudioMutationFailure(
            code: "process",
            message: "Core Audio rejected the requested change."
        ))
    }
    guard let refreshed = resolveAudioDevice(stableID: stableID)?.device else {
        return missingAudioDevice()
    }
    return .success(AudioMutationResult(device: refreshed))
}

private func missingAudioDevice() -> Result<AudioMutationResult, AudioMutationFailure> {
    .failure(AudioMutationFailure(
        code: "not_found",
        message: "The requested audio device was not found."
    ))
}

private func unsupportedMutation() -> Result<AudioMutationResult, AudioMutationFailure> {
    .failure(AudioMutationFailure(
        code: "unsupported",
        message: "The requested control is not supported by this audio device."
    ))
}

private func isDefaultPropertySettable(direction: String) -> Bool {
    var address = AudioObjectPropertyAddress(
        mSelector: direction == "input"
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

private func isPropertySettable(
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

private func isPropertySettable(
    objectID: AudioObjectID,
    address: inout AudioObjectPropertyAddress
) -> Bool {
    var settable = DarwinBoolean(false)
    return AudioObjectIsPropertySettable(objectID, &address, &settable) == noErr
        && settable.boolValue
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

private struct AudioPropertyListener {
    let objectID: AudioObjectID
    var address: AudioObjectPropertyAddress
    let block: AudioObjectPropertyListenerBlock
}

private final class AudioDeviceEventWatcher {
    private let queue = DispatchQueue(label: "com.harmoni.audio-device-events")
    private var deviceListeners: [AudioPropertyListener] = []
    private var systemListeners: [AudioPropertyListener] = []

    func start() -> Bool {
        guard addSystemListener(
            selector: kAudioHardwarePropertyDevices,
            id: "audio.inventory",
            category: "audio",
            change: "inventory-changed",
            rebuildDevices: true
        ), addSystemListener(
            selector: kAudioHardwarePropertyDefaultInputDevice,
            id: "audio.default-input",
            category: "audio-input",
            change: "default-changed"
        ), addSystemListener(
            selector: kAudioHardwarePropertyDefaultOutputDevice,
            id: "audio.default-output",
            category: "audio-output",
            change: "default-changed"
        ) else {
            removeAllListeners()
            return false
        }
        rebuildDeviceListeners()
        return true
    }

    private func addSystemListener(
        selector: AudioObjectPropertySelector,
        id: String,
        category: String,
        change: String,
        rebuildDevices: Bool = false
    ) -> Bool {
        addListener(
            objectID: AudioObjectID(kAudioObjectSystemObject),
            selector: selector,
            scope: kAudioObjectPropertyScopeGlobal,
            storage: &systemListeners
        ) { [weak self] in
            writeAudioDeviceChangeEvent(id: id, category: category, change: change)
            if rebuildDevices { self?.rebuildDeviceListeners() }
        }
    }

    private func rebuildDeviceListeners() {
        removeListeners(&deviceListeners)
        for deviceID in audioDeviceIDs() {
            guard let uid = stringProperty(
                objectID: deviceID,
                selector: kAudioDevicePropertyDeviceUID
            ) else { continue }
            for (direction, scope, category) in [
                ("input", kAudioDevicePropertyScopeInput, "audio-input"),
                ("output", kAudioDevicePropertyScopeOutput, "audio-output"),
            ] where hasStreams(deviceID: deviceID, scope: scope) {
                let stableID = "\(uid):\(direction)"
                _ = addListener(
                    objectID: deviceID,
                    selector: kAudioDevicePropertyVolumeScalar,
                    scope: scope,
                    storage: &deviceListeners
                ) {
                    writeAudioDeviceChangeEvent(
                        id: stableID,
                        category: category,
                        change: "volume-changed"
                    )
                }
                _ = addListener(
                    objectID: deviceID,
                    selector: kAudioDevicePropertyMute,
                    scope: scope,
                    storage: &deviceListeners
                ) {
                    writeAudioDeviceChangeEvent(
                        id: stableID,
                        category: category,
                        change: "mute-changed"
                    )
                }
            }
        }
    }

    private func addListener(
        objectID: AudioObjectID,
        selector: AudioObjectPropertySelector,
        scope: AudioObjectPropertyScope,
        storage: inout [AudioPropertyListener],
        onChange: @escaping () -> Void
    ) -> Bool {
        var address = AudioObjectPropertyAddress(
            mSelector: selector,
            mScope: scope,
            mElement: kAudioObjectPropertyElementMain
        )
        guard AudioObjectHasProperty(objectID, &address) else { return false }
        let block: AudioObjectPropertyListenerBlock = { _, _ in onChange() }
        guard AudioObjectAddPropertyListenerBlock(objectID, &address, queue, block) == noErr else {
            return false
        }
        storage.append(AudioPropertyListener(objectID: objectID, address: address, block: block))
        return true
    }

    private func removeListeners(_ listeners: inout [AudioPropertyListener]) {
        for var listener in listeners {
            AudioObjectRemovePropertyListenerBlock(
                listener.objectID,
                &listener.address,
                queue,
                listener.block
            )
        }
        listeners.removeAll()
    }

    private func removeAllListeners() {
        removeListeners(&deviceListeners)
        removeListeners(&systemListeners)
    }
}

private func writeAudioDeviceChangeEvent(
    id: String,
    category: String,
    change: String
) {
    let envelope = DeviceEventEnvelope(
        kind: "device-change",
        version: PROTOCOL_VERSION,
        event: DeviceEvent(
            id: id,
            category: category,
            change: change,
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
