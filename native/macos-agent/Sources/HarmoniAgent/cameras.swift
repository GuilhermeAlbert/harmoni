import AVFoundation
import CoreMedia
import Foundation

func discoverCameras() -> CameraDiscoveryResult {
    let discovery = AVCaptureDevice.DiscoverySession(
        deviceTypes: cameraDeviceTypes(),
        mediaType: .video,
        position: .unspecified
    )
    let cameras = discovery.devices.map { device in
        makeCamera(device)
    }.sorted {
        ($0.preferred ? 0 : 1, $0.name, $0.id)
            < ($1.preferred ? 0 : 1, $1.name, $1.id)
    }

    return CameraDiscoveryResult(
        authorization: cameraAuthorization(),
        cameras: cameras
    )
}

func cameraDevice(stableID: String) -> AVCaptureDevice? {
    AVCaptureDevice.DiscoverySession(
        deviceTypes: cameraDeviceTypes(),
        mediaType: .video,
        position: .unspecified
    ).devices.first(where: { $0.uniqueID == stableID })
}

private func makeCamera(_ device: AVCaptureDevice) -> DiscoveredCamera {
    return DiscoveredCamera(
            id: device.uniqueID,
            name: device.localizedName,
            transport: cameraTransport(device),
            preferred: false,
            formats: cameraFormats(device),
            zoom: nil,
            exposure: nil
        )
}

func setCameraZoom(
    stableID: String,
    value: Double
) -> Result<CameraMutationResult, CameraMutationFailure> {
    guard value.isFinite else { return invalidCameraValue() }
    guard cameraDevice(stableID: stableID) != nil else { return missingCamera() }
    return unsupportedCameraControl(control: "zoom")
}

func setCameraExposure(
    stableID: String,
    value: Double
) -> Result<CameraMutationResult, CameraMutationFailure> {
    guard value.isFinite else { return invalidCameraValue() }
    guard cameraDevice(stableID: stableID) != nil else { return missingCamera() }
    return unsupportedCameraControl(control: "exposure")
}

private func invalidCameraValue() -> Result<CameraMutationResult, CameraMutationFailure> {
    .failure(CameraMutationFailure(code: .invalidArgument, message: CameraErrorMessage.invalidControlValue))
}

private func missingCamera() -> Result<CameraMutationResult, CameraMutationFailure> {
    .failure(CameraMutationFailure(code: .notFound, message: CameraErrorMessage.cameraNotFound))
}

private func unsupportedCameraControl(control: String) -> Result<CameraMutationResult, CameraMutationFailure> {
    return .failure(CameraMutationFailure(
        code: .unsupported,
        message: CameraErrorMessage.unsupportedControl(control)
    ))
}

func watchCameraDeviceEvents() -> Never {
    let center = NotificationCenter.default
    let connected = center.addObserver(
        forName: .AVCaptureDeviceWasConnected,
        object: nil,
        queue: nil
    ) { notification in
        writeCameraDeviceChangeEvent(notification: notification, change: .connected)
    }
    let disconnected = center.addObserver(
        forName: .AVCaptureDeviceWasDisconnected,
        object: nil,
        queue: nil
    ) { notification in
        writeCameraDeviceChangeEvent(notification: notification, change: .disconnected)
    }
    _ = (connected, disconnected)

    while true {
        RunLoop.current.run(until: Date.distantFuture)
    }
}

private func cameraDeviceTypes() -> [AVCaptureDevice.DeviceType] {
    [
        .builtInWideAngleCamera,
        .continuityCamera,
        .deskViewCamera,
        .external,
    ]
}

private func cameraAuthorization() -> PermissionStatus {
    switch AVCaptureDevice.authorizationStatus(for: .video) {
    case .authorized:
        return .authorized
    case .denied:
        return .denied
    case .notDetermined:
        return .notDetermined
    case .restricted:
        return .restricted
    @unknown default:
        return .unknown
    }
}

private func cameraTransport(_ device: AVCaptureDevice) -> CameraTransport {
    switch device.deviceType {
    case .builtInWideAngleCamera:
        return .builtIn
    case .continuityCamera, .deskViewCamera:
        return .continuity
    case .external:
        return .external
    default:
        return .unknown
    }
}

private func cameraFormats(_ device: AVCaptureDevice) -> [DiscoveredCameraFormat] {
    var formatsByKey: [String: DiscoveredCameraFormat] = [:]
    for format in device.formats {
        let dimensions = CMVideoFormatDescriptionGetDimensions(format.formatDescription)
        for range in format.videoSupportedFrameRateRanges {
            let frameRate = range.maxFrameRate
            guard dimensions.width > 0, dimensions.height > 0, frameRate > 0 else {
                continue
            }
            let key = "\(dimensions.width)x\(dimensions.height)@\(frameRate)"
            formatsByKey[key] = DiscoveredCameraFormat(
                width: dimensions.width,
                height: dimensions.height,
                frameRate: frameRate
            )
        }
    }
    return formatsByKey.values.sorted {
        ($0.width * $0.height, $0.frameRate, $0.width)
            > ($1.width * $1.height, $1.frameRate, $1.width)
    }
}

private func writeCameraDeviceChangeEvent(notification: Notification, change: DeviceEventChange) {
    let uniqueID = (notification.object as? AVCaptureDevice)?.uniqueID ?? "inventory"
    let envelope = DeviceEventEnvelope(
        kind: .deviceChange,
        version: PROTOCOL_VERSION,
        event: DeviceEvent(
            id: stableDeviceEventID(prefix: "camera", value: uniqueID),
            category: .camera,
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
