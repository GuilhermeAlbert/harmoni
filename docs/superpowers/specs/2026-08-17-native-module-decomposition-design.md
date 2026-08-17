# Native Module Decomposition Design

> Split oversized Rust and Swift modules along existing responsibility boundaries without changing native behavior or wire contracts.

## Problem

The largest native files combine models, validation, platform discovery,
mutation, persistence, process transport, protocol parsing, and tests. This
makes ownership unclear and increases the risk that a local change affects an
unrelated behavior.

## Scope

Decompose these modules while preserving their external interfaces:

- `native/macos-agent/Sources/HarmoniAgent/audio-devices.swift`
- `src-tauri/src/commands/profiles.rs`
- `src-tauri/src/commands/camera.rs`
- `src-tauri/src/sidecar/native_agent.rs`

## Target ownership

### Swift audio

- `audio-devices.swift`: discovery orchestration and public feature entry points.
- `audio-device-properties.swift`: typed CoreAudio property reads and capability checks.
- `audio-device-mutations.swift`: default-device, volume, and mute mutations.
- `audio-device-events.swift`: CoreAudio listener registration and event normalization.

### Rust profiles

- `commands/profiles/mod.rs`: thin Tauri commands and module exports.
- `commands/profiles/model.rs`: profile, preference, result, and status types.
- `commands/profiles/validation.rs`: profile and store invariants.
- `commands/profiles/application.rs`: capability-aware operation orchestration.
- Existing `storage/profiles.rs`: persistence, migration, backup, and seeding.

### Rust cameras

- `commands/camera/mod.rs`: thin Tauri commands and module exports.
- `commands/camera/model.rs`: discovery, capability, preference, and preview DTOs.
- `commands/camera/validation.rs`: identifiers, formats, capabilities, and responses.
- `commands/camera/preferences.rs`: local preferred-camera persistence.
- `commands/camera/preview.rs`: preview process ownership, timeout, and file lifecycle.

### Rust sidecar

- `sidecar/native_agent/mod.rs`: public transport entry points and re-exports.
- `sidecar/native_agent/transport.rs`: spawn, write, timeout, termination, and stdout collection.
- `sidecar/native_agent/envelope.rs`: request encoding and correlated response parsing.
- `sidecar/native_agent/error.rs`: stable error codes, safe message normalization, and factories.
- `sidecar/native_agent/health.rs`: version and architecture validation.

## Boundary rules

- Tauri commands remain thin and retain their command names and argument shapes.
- Swift executable dispatch remains exhaustive.
- Serialized enum values, JSON field names, error codes, protocol version, and request methods do not change.
- Hardware-free helpers become internal or package-visible only where tests require it.
- No generic `utils`, `common`, or re-export-only frontend-style barrels are introduced.
- Extraction commits move one responsibility at a time and must remain buildable.

## Acceptance criteria

- Each target file has one describable responsibility.
- No public Tauri command, Swift request method, or serialized value changes.
- Existing 37 Rust tests and the complete Swift suite continue to pass.
- Hardware-backed smoke tests still discover the same normalized devices.
- Clippy passes with warnings denied and Swift builds without new warnings.
- The decomposition does not add new runtime dependencies.

## Validation

- Run focused tests after each extraction.
- Run `cargo test`, `cargo clippy --all-targets -- -D warnings`, and `swift test`.
- Run `yarn native:build` and compare representative protocol fixtures before and after extraction.
- Review `git diff --stat` and module visibility to ensure the work is a move, not a behavior rewrite.

## Out of scope

- Protocol version 2.
- A persistent Swift sidecar.
- New permissions or device controls.
- Performance rewrites not required by module separation.

