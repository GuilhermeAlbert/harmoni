import Foundation
import Testing
@testable import HarmoniAgent

@Test func agentMethodsPreserveWireProtocolValues() {
    #expect(AgentMethod.developmentEmitDeviceEvent.rawValue == "development.emitDeviceEvent")
    #expect(AgentMethod.audioSetDefaultInput.rawValue == "audio.setDefaultInput")
    #expect(AgentMethod.cameraStartPreview.rawValue == "camera.startPreview")
    #expect(AgentMethod.hidLightingDiagnostics.rawValue == "hid.lightingDiagnostics")
    #expect(AgentMethod(rawValue: "unknown.method") == nil)
}

@Test func agentErrorCodesPreserveWireProtocolValues() {
    #expect(AgentErrorCode.protocolMismatch.rawValue == "protocol_mismatch")
    #expect(AgentErrorCode.invalidArgument.rawValue == "invalid_argument")
    #expect(AgentErrorCode.cameraInUse.rawValue == "camera_in_use")
}

@Test func agentErrorMessagesRemainStable() {
    #expect(AgentErrorMessage.unsupportedMethod == "Unsupported method.")
    #expect(AgentErrorMessage.unsupportedProtocolVersion == "Unsupported protocol version.")
    #expect(AgentErrorMessage.emptyRequestID == "Request id must not be empty.")
}

@Test func errorEnvelopePreservesCorrelationAndProtocolVersion() throws {
    let response = makeErrorResponse(
        id: "request-42",
        code: .invalidArgument,
        message: "Invalid request."
    )

    let data = try JSONEncoder().encode(response)
    let object = try #require(JSONSerialization.jsonObject(with: data) as? [String: Any])
    let error = try #require(object["error"] as? [String: String])

    #expect(object["id"] as? String == "request-42")
    #expect(object["version"] as? Int == PROTOCOL_VERSION)
    #expect(error["code"] == "invalid_argument")
    #expect(error["message"] == "Invalid request.")
}

@Test func stableDeviceEventIdentifiersAreDeterministicAndNamespaced() {
    let first = stableDeviceEventID(prefix: "audio", value: "device-42")
    let repeated = stableDeviceEventID(prefix: "audio", value: "device-42")
    let different = stableDeviceEventID(prefix: "audio", value: "device-43")

    #expect(first == repeated)
    #expect(first != different)
    #expect(first.hasPrefix("audio."))
}
