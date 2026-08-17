import AVFoundation
import CoreImage
import Foundation

struct CameraPreviewStartResult: Encodable {
    let cameraId: String
    let width: Int
    let height: Int
    let frameRate: Int
}

final class CameraPreviewManager: @unchecked Sendable {
    static let shared = CameraPreviewManager()

    private var session: AVCaptureSession?
    private var writer: CameraPreviewWriter?

    func start(
        cameraID: String,
        outputPath: String
    ) -> Result<CameraPreviewStartResult, CameraMutationFailure> {
        stop()
        guard authorizeCameraCapture() else {
            return .failure(CameraMutationFailure(
                code: .permissionDenied,
                message: CameraErrorMessage.previewPermissionRequired
            ))
        }
        guard let device = cameraDevice(stableID: cameraID) else {
            return .failure(CameraMutationFailure(
                code: .notFound,
                message: CameraErrorMessage.cameraDisconnected
            ))
        }
        do {
            let input = try AVCaptureDeviceInput(device: device)
            let session = AVCaptureSession()
            session.beginConfiguration()
            if session.canSetSessionPreset(.vga640x480) {
                session.sessionPreset = .vga640x480
            } else {
                session.sessionPreset = .medium
            }
            guard session.canAddInput(input) else {
                session.commitConfiguration()
                return .failure(previewUnavailable())
            }
            session.addInput(input)
            let output = AVCaptureVideoDataOutput()
            output.alwaysDiscardsLateVideoFrames = true
            output.videoSettings = [
                kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
            ]
            let writer = CameraPreviewWriter(outputURL: URL(fileURLWithPath: outputPath))
            output.setSampleBufferDelegate(
                writer,
                queue: DispatchQueue(label: "com.harmoni.camera-preview.frames")
            )
            guard session.canAddOutput(output) else {
                session.commitConfiguration()
                return .failure(previewUnavailable())
            }
            session.addOutput(output)
            session.commitConfiguration()
            self.writer = writer
            self.session = session
            session.startRunning()
            return .success(CameraPreviewStartResult(
                cameraId: cameraID,
                width: 640,
                height: 480,
                frameRate: 10
            ))
        } catch {
            stop()
            return .failure(CameraMutationFailure(
                code: .cameraInUse,
                message: CameraErrorMessage.cameraInUse
            ))
        }
    }

    private func stop() {
        session?.stopRunning()
        session = nil
        writer = nil
    }
}

final class CameraPreviewWriter: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    private let context = CIContext(options: [.cacheIntermediates: false])
    private let outputURL: URL
    private var lastFrameTime = CMTime.invalid

    init(outputURL: URL) {
        self.outputURL = outputURL
    }

    func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        let timestamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        if lastFrameTime.isValid,
           CMTimeGetSeconds(timestamp - lastFrameTime) < 0.1 {
            return
        }
        lastFrameTime = timestamp
        guard let buffer = CMSampleBufferGetImageBuffer(sampleBuffer),
              let data = context.jpegRepresentation(
                  of: CIImage(cvPixelBuffer: buffer),
                  colorSpace: CGColorSpaceCreateDeviceRGB(),
                  options: [kCGImageDestinationLossyCompressionQuality as CIImageRepresentationOption: 0.72]
              )
        else { return }
        try? data.write(to: outputURL, options: .atomic)
    }
}

private func authorizeCameraCapture() -> Bool {
    switch AVCaptureDevice.authorizationStatus(for: .video) {
    case .authorized:
        return true
    case .notDetermined:
        let semaphore = DispatchSemaphore(value: 0)
        let result = CameraAuthorizationResult()
        AVCaptureDevice.requestAccess(for: .video) { value in
            result.set(value)
            semaphore.signal()
        }
        _ = semaphore.wait(timeout: .now() + 30)
        return result.get()
    default:
        return false
    }
}

private final class CameraAuthorizationResult: @unchecked Sendable {
    private let lock = NSLock()
    private var value = false

    func set(_ newValue: Bool) {
        lock.lock()
        value = newValue
        lock.unlock()
    }

    func get() -> Bool {
        lock.lock()
        defer { lock.unlock() }
        return value
    }
}

private func previewUnavailable() -> CameraMutationFailure {
    CameraMutationFailure(
        code: .cameraInUse,
        message: CameraErrorMessage.previewUnavailable
    )
}
