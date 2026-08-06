import AppKit
import ApplicationServices
import AVFoundation
import Foundation

struct PermissionStatusResult: Encodable {
    let permissions: [PermissionStatusItem]
}

struct PermissionStatusItem: Encodable {
    let id: String
    let category: String
    let status: String
}

struct OpenSettingsResult: Encodable {
    let category: String
    let opened: Bool
}

func readPermissionStatus() -> PermissionStatusResult {
    PermissionStatusResult(permissions: [
        PermissionStatusItem(
            id: "camera-permission",
            category: "camera",
            status: mediaAuthorizationStatus(for: .video)
        ),
        PermissionStatusItem(
            id: "microphone-permission",
            category: "microphone",
            status: mediaAuthorizationStatus(for: .audio)
        ),
        PermissionStatusItem(
            id: "accessibility-permission",
            category: "accessibility",
            status: AXIsProcessTrusted() ? "authorized" : "unknown"
        ),
        PermissionStatusItem(
            id: "input-monitoring-permission",
            category: "input-monitoring",
            status: inputMonitoringStatus()
        ),
    ])
}

func openPermissionSettings(category: String) -> OpenSettingsResult? {
    let paneByCategory = [
        "accessibility": "Privacy_Accessibility",
        "camera": "Privacy_Camera",
        "input-monitoring": "Privacy_ListenEvent",
        "microphone": "Privacy_Microphone",
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

private func mediaAuthorizationStatus(for mediaType: AVMediaType) -> String {
    if #available(macOS 10.14, *) {
        switch AVCaptureDevice.authorizationStatus(for: mediaType) {
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

    return "unsupported"
}

private func inputMonitoringStatus() -> String {
    if #available(macOS 10.15, *) {
        return CGPreflightListenEventAccess() ? "authorized" : "unknown"
    }

    return "unsupported"
}
