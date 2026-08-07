import AVFoundation
import CoreMedia
import Foundation

struct CameraDiscoveryResult: Encodable {
    let authorization: String
    let cameras: [DiscoveredCamera]
}

struct DiscoveredCamera: Encodable {
    let id: String
    let name: String
    let transport: String
    let preferred: Bool
    let formats: [DiscoveredCameraFormat]
    let zoom: CameraCapability?
    let exposure: CameraCapability?
}

struct DiscoveredCameraFormat: Encodable {
    let width: Int32
    let height: Int32
    let frameRate: Double
}

struct CameraCapability: Encodable {
    let min: Double
    let max: Double
    let value: Double
    let canControl: Bool
}

struct CameraMutationResult: Encodable {
    let camera: DiscoveredCamera
}

struct CameraMutationFailure: Error {
    let code: String
    let message: String
}

func discoverCameras() -> CameraDiscoveryResult {
    let discovery = AVCaptureDevice.DiscoverySession(
        deviceTypes: cameraDeviceTypes(),
        mediaType: .video,
        position: .unspecified
    )
    let cameras = discovery.devices.map { device in
        DiscoveredCamera(
            id: device.uniqueID,
            name: device.localizedName,
            transport: cameraTransport(device),
            preferred: false,
            formats: cameraFormats(device),
            zoom: nil,
            exposure: nil
        )
    }.sorted {
        ($0.preferred ? 0 : 1, $0.name, $0.id)
            < ($1.preferred ? 0 : 1, $1.name, $1.id)
    }

    return CameraDiscoveryResult(
        authorization: cameraAuthorization(),
        cameras: cameras
    )
}

func setCameraZoom(
    stableID: String,
    value: Double
) -> Result<CameraMutationResult, CameraMutationFailure> {
    unsupportedCameraControl(stableID: stableID, value: value, control: "zoom")
}

func setCameraExposure(
    stableID: String,
    value: Double
) -> Result<CameraMutationResult, CameraMutationFailure> {
    unsupportedCameraControl(stableID: stableID, value: value, control: "exposure")
}

private func unsupportedCameraControl(
    stableID: String,
    value: Double,
    control: String
) -> Result<CameraMutationResult, CameraMutationFailure> {
    guard value.isFinite else {
        return .failure(CameraMutationFailure(
            code: "invalid_argument",
            message: "Camera control value must be finite."
        ))
    }
    guard discoverCameras().cameras.contains(where: { $0.id == stableID }) else {
        return .failure(CameraMutationFailure(
            code: "not_found",
            message: "The requested camera was not found."
        ))
    }
    return .failure(CameraMutationFailure(
        code: "unsupported",
        message: "AVFoundation does not expose \(control) control for cameras on macOS."
    ))
}

func watchCameraDeviceEvents() -> Never {
    let center = NotificationCenter.default
    let connected = center.addObserver(
        forName: .AVCaptureDeviceWasConnected,
        object: nil,
        queue: nil
    ) { notification in
        writeCameraDeviceChangeEvent(notification: notification, change: "connected")
    }
    let disconnected = center.addObserver(
        forName: .AVCaptureDeviceWasDisconnected,
        object: nil,
        queue: nil
    ) { notification in
        writeCameraDeviceChangeEvent(notification: notification, change: "disconnected")
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

private func cameraAuthorization() -> String {
    switch AVCaptureDevice.authorizationStatus(for: .video) {
    case .authorized:
        return "authorized"
    case .denied:
        return "denied"
    case .notDetermined:
        return "not-determined"
    case .restricted:
        return "restricted"
    @unknown default:
        return "unknown"
    }
}

private func cameraTransport(_ device: AVCaptureDevice) -> String {
    switch device.deviceType {
    case .builtInWideAngleCamera:
        return "built-in"
    case .continuityCamera, .deskViewCamera:
        return "continuity"
    case .external:
        return "external"
    default:
        return "unknown"
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

private func writeCameraDeviceChangeEvent(notification: Notification, change: String) {
    let uniqueID = (notification.object as? AVCaptureDevice)?.uniqueID ?? "inventory"
    let envelope = DeviceEventEnvelope(
        kind: "device-change",
        version: PROTOCOL_VERSION,
        event: DeviceEvent(
            id: stableDeviceEventID(prefix: "camera", value: uniqueID),
            category: "camera",
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
