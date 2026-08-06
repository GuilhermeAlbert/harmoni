import Foundation

let decoder = JSONDecoder()
let encoder = JSONEncoder()
encoder.outputFormatting = [.sortedKeys]

while let line = readLine(strippingNewline: true) {
    let response: ResponseEnvelope

    do {
        let request = try decoder.decode(RequestEnvelope.self, from: Data(line.utf8))
        response = handleRequest(request)
    } catch {
        writeDiagnostic("Rejected malformed protocol request.")
        response = makeErrorResponse(
            id: nil,
            code: "invalid_request",
            message: "Malformed request envelope."
        )
    }

    do {
        let data = try encoder.encode(response)
        FileHandle.standardOutput.write(data)
        FileHandle.standardOutput.write(Data([0x0A]))
    } catch {
        writeDiagnostic("Failed to encode protocol response.")
    }
}

private func writeDiagnostic(_ message: String) {
    guard let data = "\(message)\n".data(using: .utf8) else {
        return
    }

    FileHandle.standardError.write(data)
}
