# Project Quality Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the audited toolchain, CI, mutation-concurrency, profile-result, HID-modeling, test-coverage, and frontend-legibility defects without changing Harmoni's product scope.

**Architecture:** Preserve the Next.js -> Tauri -> Rust -> Swift boundary. Make small internal changes at the owning layer, retain existing public contracts, and add regression coverage before each behavioral change.

**Tech Stack:** Next.js 16, React 19, strict TypeScript, Tauri 2, Rust 2021/MSRV 1.77.2, Swift 6, Swift Testing, GitHub Actions.

---

### Task 1: Enforce the declared toolchain contract

**Files:**
- Modify: `src-tauri/src/commands/profiles.rs`
- Modify: `Makefile`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/release.yml`

- [ ] Replace the three `Option::is_none_or` calls with MSRV-compatible `map_or(true, ...)` expressions.
- [ ] Run `cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` and verify it exits successfully.
- [ ] Add `rust-clippy` and `swift-test` Make targets and include both in `validate`.
- [ ] Add matching Clippy and Swift test steps to CI and release validation.
- [ ] Run `swift test` and the Rust suite.

### Task 2: Correct profile application semantics

**Files:**
- Modify: `src-tauri/src/commands/profiles.rs`

- [ ] Add a failing unit test proving that a requested `skipped-unsupported` operation makes an application incomplete.
- [ ] Run the focused Rust test and confirm the assertion fails under the current status predicate.
- [ ] Extract a typed `ProfileOperationStatus` enum and make `fully_applied` accept only `Success` and `SkippedNotRequested`.
- [ ] Run the focused test and full Rust suite.

### Task 3: Prevent stale optimistic audio rollbacks

**Files:**
- Modify: `contexts/audio-devices/index.tsx`

- [ ] Introduce an in-flight mutation ref owned by `AudioDevicesProvider`.
- [ ] Reject overlapping provider mutation calls before capturing optimistic state.
- [ ] Clear the guard in `finally` only for the owning mutation token.
- [ ] Keep the existing context API and UI behavior unchanged.
- [ ] Run TypeScript and ESLint validation.

### Task 4: Model HID values declaratively

**Files:**
- Modify: `native/macos-agent/Sources/HarmoniAgent/hid-devices.swift`
- Modify: `native/macos-agent/Tests/HarmoniAgentTests/hid-device-normalization-tests.swift`

- [ ] Add failing Swift tests for accepting all known lighting identifiers and rejecting an unknown pair.
- [ ] Run the focused Swift suite and confirm the new identifier API is missing.
- [ ] Add hashable `HidDeviceIdentifier`, `HidUsage`, and closed internal enums for category, transport, lighting status, and device-event change.
- [ ] Replace the boolean comparison chain with `KNOWN_LIGHTING_DEVICE_IDENTIFIERS.contains(...)`.
- [ ] Replace HID usage numbers and duplicated string switches with named values while preserving encoded output.
- [ ] Run the full Swift suite.

### Task 5: Expand Swift regression coverage

**Files:**
- Modify: `native/macos-agent/Tests/HarmoniAgentTests/hid-device-normalization-tests.swift`
- Create focused test files under `native/macos-agent/Tests/HarmoniAgentTests/` when production functions are testable without hardware.

- [ ] Add coverage for HID category selection, transport normalization, stable grouping, invalid battery data, and lighting status derivation.
- [ ] Add protocol-envelope tests for pure encoding and validation helpers that do not require macOS device hardware.
- [ ] Run `swift test` and verify all cases pass.

### Task 6: Restore frontend source readability

**Files:**
- Modify: `contexts/peripherals/index.tsx`
- Modify: `contexts/peripherals/use-peripherals.ts`
- Modify: `contexts/peripherals/types.ts`
- Modify: `lib/services/peripherals.ts`
- Modify: `app/(dashboard)/peripherals/_components/peripheral-screen/index.tsx`
- Modify: `app/(dashboard)/profiles/_components/profile-screen/index.tsx`
- Modify: `lib/types/peripheral.ts`
- Modify: `lib/types/profile.ts`

- [ ] Expand compressed imports, statements, promise chains, handlers, and JSX into the repository's conventional multiline format.
- [ ] Introduce a closed TypeScript enum for input-monitoring status and typed enums for profile operation/status values.
- [ ] Preserve messages, rendering branches, service commands, and context APIs.
- [ ] Run TypeScript, ESLint, and the production frontend build.

### Task 7: Full verification and review

**Files:**
- Review all modified files.

- [ ] Run `yarn version:check` with Node 24.14.1.
- [ ] Run `yarn lint` and `yarn build`.
- [ ] Run `cargo check`, `cargo test`, and Clippy with warnings denied.
- [ ] Run `swift test` and `yarn native:build`.
- [ ] Inspect `git diff --check`, the complete diff, and confirm pre-existing HID additions remain present.
- [ ] Request a focused code review and resolve all critical or important findings.
