import CoreAudio
import Foundation


struct AudioPropertyListener {
    let objectID: AudioObjectID
    var address: AudioObjectPropertyAddress
    let block: AudioObjectPropertyListenerBlock
}

final class AudioDeviceEventWatcher {
    private let queue = DispatchQueue(label: "com.harmoni.audio-device-events")
    private var deviceListeners: [AudioPropertyListener] = []
    private var systemListeners: [AudioPropertyListener] = []

    func start() -> Bool {
        guard addSystemListener(
            selector: kAudioHardwarePropertyDevices,
            id: "audio.inventory",
            category: .audio,
            change: .inventoryChanged,
            rebuildDevices: true
        ), addSystemListener(
            selector: kAudioHardwarePropertyDefaultInputDevice,
            id: "audio.default-input",
            category: .audioInput,
            change: .defaultChanged
        ), addSystemListener(
            selector: kAudioHardwarePropertyDefaultOutputDevice,
            id: "audio.default-output",
            category: .audioOutput,
            change: .defaultChanged
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
        category: DeviceEventCategory,
        change: DeviceEventChange,
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
                (AudioDirection.input, kAudioDevicePropertyScopeInput, DeviceEventCategory.audioInput),
                (AudioDirection.output, kAudioDevicePropertyScopeOutput, DeviceEventCategory.audioOutput),
            ] where hasStreams(deviceID: deviceID, scope: scope) {
                let stableID = "\(uid):\(direction.rawValue)"
                _ = addListener(
                    objectID: deviceID,
                    selector: kAudioDevicePropertyVolumeScalar,
                    scope: scope,
                    storage: &deviceListeners
                ) {
                    writeAudioDeviceChangeEvent(
                        id: stableID,
                        category: category,
                        change: .volumeChanged
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
                        change: .muteChanged
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

func writeAudioDeviceChangeEvent(
    id: String,
    category: DeviceEventCategory,
    change: DeviceEventChange
) {
    let envelope = DeviceEventEnvelope(
        kind: .deviceChange,
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
