import Foundation

let decoder = JSONDecoder()
let encoder = JSONEncoder()
encoder.outputFormatting = [.sortedKeys]

while let line = readLine(strippingNewline: true) {
    let output: AgentOutput

    do {
        let request = try decoder.decode(RequestEnvelope.self, from: Data(line.utf8))
        output = handleRequest(request)
    } catch {
        writeDiagnostic("Rejected malformed protocol request.")
        output = .response(makeErrorResponse(
            id: nil,
            code: .invalidRequest,
            message: AgentErrorMessage.malformedRequestEnvelope
        ))
    }

    do {
        let data = try encoder.encode(output)
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
