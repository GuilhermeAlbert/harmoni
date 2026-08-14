# Project Quality Remediation Design

## Goal

Remove the concrete correctness and maintainability defects found in the 2026-08-14 project audit while preserving Harmoni's current product scope and native architecture.

## Scope

The remediation covers six bounded areas:

1. Align the declared Rust MSRV with the source and enforce Clippy in validation.
2. Run Swift tests in local validation and CI.
3. Serialize frontend audio mutations so stale optimistic rollbacks cannot overwrite newer results.
4. Treat requested but unsupported profile operations as partial application.
5. Replace HID magic identifiers and stringly internal states with small value types and named constants.
6. Reformat and decompose the compressed peripherals and profile frontend modules without changing behavior.

The work does not add device capabilities, change native protocol versions, introduce dependencies, or rewrite unrelated modules.

## Architecture

The existing runtime boundary remains unchanged:

```text
Next.js UI -> frontend service -> Tauri command -> Rust -> Swift -> macOS API
```

Rust continues to validate all Swift responses. Swift internal HID modeling gains typed identifiers and closed enums, but serialized values remain identical. Frontend mutation providers keep their existing public context APIs; concurrency safety is implemented inside the provider.

## Behavior

### Toolchain and CI

The Rust source will remain compatible with the declared `rust-version = "1.77.2"`. Clippy and `swift test` become part of `make validate` and pull-request CI so the declared compatibility and Swift regression suite are continuously checked.

### Audio mutations

Only one audio mutation may be active at a time. Calls arriving while a mutation is active are ignored at the provider boundary, matching the UI's busy behavior and preventing stale rollback snapshots. The pending state is cleared only by the mutation that owns it.

### Profile application

`fullyApplied` is true only when every requested operation either succeeds or was not requested. A requested operation skipped because the device lacks support produces a partial result and does not activate the profile.

### HID modeling

Known lighting devices are represented by a `Set` of `HidDeviceIdentifier` values. HID usage pairs, peripheral categories, transport values, event changes, and lighting statuses use named constants or closed enums internally. JSON field names and serialized string values do not change.

### Frontend maintainability

Compressed modules are expanded into conventional formatting. Repeated refresh/subscription mechanics may be extracted only where behavior and types are identical; feature state and domain actions remain in their current providers.

## Testing

- Rust regression tests cover MSRV-compatible validation and partial profile application.
- Swift tests cover known lighting identifiers, rejected identifiers, usage mapping, transport mapping, and unchanged diagnostic serialization semantics.
- TypeScript compilation, ESLint, production build, Rust tests, Clippy, Swift tests, and the sidecar build form the final verification suite.

## Safety

Existing uncommitted HID changes are retained and incorporated. No device writes, new permissions, remote services, or protocol expansion are introduced.
