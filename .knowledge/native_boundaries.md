# Native Boundaries

> Define a narrow, typed, capability-aware boundary between the frontend, Rust, Swift, and macOS.

## Responsibility split

### Frontend

- Calls domain functions in `lib/services/`.
- Displays loading, unsupported, permission, success, and error states.
- Subscribes to typed events and always unregisters listeners.
- Never imports low-level Tauri invocation inside visual components.

### Rust

- Exposes an allowlist of narrow Tauri commands and capabilities.
- Validates identifiers, ranges, request versions, and Swift responses.
- Starts or communicates with the bundled Swift executable.
- Applies timeouts and maps process/protocol failures into stable errors.
- Owns local application-data persistence and multi-command orchestration.

### Swift

- Calls supported public macOS frameworks.
- Reports real permissions and capability information.
- Performs only the requested device operation.
- Writes protocol responses to standard output and diagnostics to standard error.
- Does not claim a system-wide behavior that the operating system does not expose.

## Protocol

**Recommendation:** Use newline-delimited JSON with a versioned envelope and one
request/response correlation identifier.

A request contains an identifier, protocol version, method, and typed
parameters. A response contains the same identifier and either a typed result or
a structured error. Event envelopes have their own kind, version, stable device
identifier, change type, and timestamp.

Rust treats stdout as protocol-only, rejects malformed or mismatched data, and
does not expose raw process diagnostics to end users.

## Capabilities

Discovery and mutation are separate responsibilities. A discovered property
does not imply it can be changed. Responses report capability flags and, when
useful, supported ranges or an explicit unsupported reason.

The UI disables unavailable controls and explains why. It never simulates
success for an unsupported native operation.

## Permissions

Query permission status without triggering a prompt during render. Model at
least unknown, not determined, restricted, denied, and authorized when the
underlying framework distinguishes them. Opening the appropriate System Settings
pane is an explicit user action behind a narrow allowlisted command.

Input monitoring must not become keystroke capture. Logs must not contain
sensitive device payloads, secrets, signing material, or user input.

## Errors

Normalize invalid request, unsupported capability, permission, unavailable
device, timeout, process failure, protocol mismatch, and unexpected native
failure. Preserve actionable context without leaking raw internals. Frontend
error factories enrich native JavaScript `Error` objects rather than declaring
custom classes.

Partial profile application reports an outcome for each operation. Do not claim
atomic rollback unless it is implemented and verified.

## Events

Prefer native connection events over polling. Validate events in Rust before
emitting a namespaced Tauri event. Frontend services return an unsubscribe
function, and React effects call it during cleanup.

## Open questions

**Open question:** The sidecar lifecycle may begin as one process per request or
as a persistent process; choose only after measuring command and event needs.

**Open question:** Safe device-disable behavior varies by device class and
macOS version and must be verified before exposure.

**Open question:** Signing, hardened runtime, entitlements, and notarization
requirements depend on the final bundle identity and Apple Developer account.

