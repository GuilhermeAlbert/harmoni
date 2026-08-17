import CoreAudio
import Foundation

func setDefaultAudioDevice(
    stableID: String,
    direction: AudioDirection
) -> Result<AudioMutationResult, AudioMutationFailure> {
    guard let target = resolveAudioDevice(stableID: stableID),
          target.device.direction == direction
    else {
        return .failure(AudioMutationFailure(
            code: .notFound,
            message: AudioErrorMessage.deviceNotFound
        ))
    }

    let selector = direction == .input
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
            code: .invalidArgument,
            message: AudioErrorMessage.volumeOutOfRange
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
        let directions: [(AudioDirection, AudioObjectPropertyScope, Bool)] = [
            (AudioDirection.input, kAudioDevicePropertyScopeInput, deviceID == defaults.input),
            (AudioDirection.output, kAudioDevicePropertyScopeOutput, deviceID == defaults.output),
        ]
        for (direction, scope, isDefault) in directions
        where stableID == "\(uid):\(direction.rawValue)" && hasStreams(deviceID: deviceID, scope: scope) {
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
            code: .process,
            message: AudioErrorMessage.processRejected
        ))
    }
    guard let refreshed = resolveAudioDevice(stableID: stableID)?.device else {
        return missingAudioDevice()
    }
    return .success(AudioMutationResult(device: refreshed))
}

private func missingAudioDevice() -> Result<AudioMutationResult, AudioMutationFailure> {
    .failure(AudioMutationFailure(
        code: .notFound,
        message: AudioErrorMessage.deviceNotFound
    ))
}

private func unsupportedMutation() -> Result<AudioMutationResult, AudioMutationFailure> {
    .failure(AudioMutationFailure(
        code: .unsupported,
        message: AudioErrorMessage.unsupportedControl
    ))
}
