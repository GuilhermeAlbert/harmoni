# Validation and Regression Coverage Design

> Make asynchronous frontend behavior and the complete native boundary reproducibly verifiable locally and in CI.

## Problem

Lint and production builds validate frontend syntax, types, and framework
integration but cannot prove ordering and cleanup invariants in asynchronous
providers. Native suites are stronger, but the complete validation contract is
distributed across scripts and CI, and workspace/toolchain assumptions can fail
before tests run.

## Scope

- Introduce the smallest frontend test setup capable of exercising hooks and providers.
- Cover concurrency and lifecycle behavior defined by the frontend reliability spec.
- Preserve the existing Rust and Swift suites and add characterization tests before native moves.
- Make one local validation command match pull-request CI.
- Keep release-only packaging, signing, and notarization outside ordinary validation.

## Frontend test strategy

Use Vitest with jsdom and React Testing Library. Tests interact through provider
context consumers rather than implementation details. Native services are mocked
at the service boundary with controllable promises, and fake timers drive event
debouncing deterministically.

Required cases:

- stale discovery results are ignored;
- overlapping camera mutations are rejected;
- obsolete mutation completions cannot clear a newer pending operation;
- failures roll back only the owning optimistic update;
- event bursts schedule one refresh;
- unmount cancels timers and subscriptions;
- subscription failures produce the documented domain failure state.

## Native characterization strategy

Before moving code, capture behavior with hardware-free tests for protocol
encoding, validation, safe errors, profile application decisions, preference
persistence, CoreAudio value normalization, and event normalization. Tests that
require actual hardware remain smoke tests and must not be the only coverage for
pure behavior.

## Validation contract

`make validate` remains the canonical local command and CI-equivalent source of
truth. It will run version consistency, frontend tests, lint, static production
build, Rust check/tests/Clippy, Swift tests, and the Swift sidecar build. CI should
call the same Make target or maintain a mechanically identical documented list.

Release validation may reuse `make validate` before packaging. Signing and
notarization failures are release-environment failures, not ordinary source-test
failures.

## Acceptance criteria

- Frontend concurrency regressions fail deterministically without real Tauri hardware.
- Test commands do not depend on arbitrary sleeps or network access.
- `make validate` and pull-request CI execute the same source-validation stages.
- A clean checkout with the documented Node and Rust versions can run validation.
- Every suite reports explicit pass/fail status and leaves no background process.
- CI keeps pull-request validation even if the branch `push` trigger is removed later.

## Validation

- Deliberately revert each concurrency guard and confirm its regression test fails.
- Run the frontend suite twice to expose leaked timers or shared mocks.
- Run the full `make validate` command from a clean working tree.
- Compare CI steps with the Make target during review.

## Out of scope

- End-to-end UI automation against every physical device.
- Cloud test infrastructure.
- Code-coverage percentage gates.
- Release credential or notarization setup.

