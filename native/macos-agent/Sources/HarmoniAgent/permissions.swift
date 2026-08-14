import AppKit
import ApplicationServices
import AVFoundation
import Foundation

enum PermissionCategory: String, Codable, CaseIterable {
    case accessibility
    case camera
    case inputMonitoring = "input-monitoring"
    case microphone
}

enum PermissionStatus: String, Encodable {
    case authorized
    case denied
    case notDetermined = "not-determined"
    case notGranted = "not-granted"
    case restricted
    case unknown
    case unsupported
}

struct PermissionStatusResult: Encodable {
    let permissions: [PermissionStatusItem]
}

struct PermissionStatusItem: Encodable {
    let id: String
    let category: PermissionCategory
    let status: PermissionStatus
}

struct OpenSettingsResult: Encodable {
    let category: PermissionCategory
    let opened: Bool
}

func readPermissionStatus() -> PermissionStatusResult {
    PermissionStatusResult(permissions: [
        PermissionStatusItem(
            id: "camera-permission",
            category: .camera,
            status: mediaAuthorizationStatus(for: .video)
        ),
        PermissionStatusItem(
            id: "microphone-permission",
            category: .microphone,
            status: mediaAuthorizationStatus(for: .audio)
        ),
        PermissionStatusItem(
            id: "accessibility-permission",
            category: .accessibility,
            status: AXIsProcessTrusted() ? .authorized : .notGranted
        ),
        PermissionStatusItem(
            id: "input-monitoring-permission",
            category: .inputMonitoring,
            status: inputMonitoringStatus()
        ),
    ])
}

func openPermissionSettings(category rawCategory: String) -> OpenSettingsResult? {
    guard let category = PermissionCategory(rawValue: rawCategory) else { return nil }
    let paneByCategory = [
        PermissionCategory.accessibility: "Privacy_Accessibility",
        .camera: "Privacy_Camera",
        .inputMonitoring: "Privacy_ListenEvent",
        .microphone: "Privacy_Microphone",
    ]

    guard let pane = paneByCategory[category],
          let url = URL(
              string: "x-apple.systempreferences:com.apple.preference.security?\(pane)"
          )
    else {
        return nil
    }

    return OpenSettingsResult(
        category: category,
        opened: NSWorkspace.shared.open(url)
    )
}

private func mediaAuthorizationStatus(for mediaType: AVMediaType) -> PermissionStatus {
    if #available(macOS 10.14, *) {
        switch AVCaptureDevice.authorizationStatus(for: mediaType) {
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

    return .unsupported
}

private func inputMonitoringStatus() -> PermissionStatus {
    if #available(macOS 10.15, *) {
        return CGPreflightListenEventAccess() ? .authorized : .notGranted
    }

    return .unsupported
}
