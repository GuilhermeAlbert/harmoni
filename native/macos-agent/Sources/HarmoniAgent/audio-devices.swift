import CoreAudio
import Foundation

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
                direction: .input,
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
                direction: .output,
                scope: kAudioDevicePropertyScopeOutput,
                transport: transport,
                isDefault: deviceID == defaultOutput
            ))
        }
    }

    return AudioDiscoveryResult(devices: discovered.sorted {
        ($0.direction.rawValue, $0.name, $0.uid)
            < ($1.direction.rawValue, $1.name, $1.uid)
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

func makeAudioDevice(
    deviceID: AudioDeviceID,
    uid: String,
    name: String,
    direction: AudioDirection,
    scope: AudioObjectPropertyScope,
    transport: AudioTransport,
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
        id: "\(uid):\(direction.rawValue)",
        uid: uid,
        name: name,
        direction: direction,
        transport: transport,
        isDefault: isDefault,
        volume: volumeScalar.map(normalizedAudioVolumePercentage),
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
