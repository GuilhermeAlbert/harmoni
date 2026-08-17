# Harmoni Quality Improvements

> Index the approved specifications for the next quality-improvement cycle.

## Objective

Address the concrete documentation, frontend concurrency, native maintainability,
toolchain, and validation gaps identified in the August 17 repository review
without expanding Harmoni's product scope or changing its public native protocol.

## Specifications

1. [Documentation and Toolchain Alignment](2026-08-17-documentation-toolchain-alignment-design.md)
2. [Frontend Device State Reliability](2026-08-17-frontend-device-state-reliability-design.md)
3. [Native Module Decomposition](2026-08-17-native-module-decomposition-design.md)
4. [Validation and Regression Coverage](2026-08-17-validation-regression-coverage-design.md)

## Execution order

Specifications 1, 2, and 3 are independent and may be implemented in parallel
worktrees. Specification 4 depends on the final interfaces produced by the other
three and should be completed last, although individual regression tests should
be added alongside each behavioral change.

## Shared constraints

- Preserve the static Next.js -> Tauri -> Rust -> Swift architecture.
- Do not introduce a remote backend, telemetry, accounts, or unsupported macOS behavior.
- Preserve protocol version 1 and all existing serialized wire values.
- Do not add abstractions based only on line count; every extraction needs one clear owner.
- Keep all source code, identifiers, commits, and technical documentation in English.
- Run the complete validation suite before the improvement cycle is considered complete.

