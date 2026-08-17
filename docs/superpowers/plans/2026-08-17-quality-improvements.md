# Harmoni Quality Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved documentation, toolchain, frontend reliability, native decomposition, and validation specifications without changing product scope or wire contracts.

**Architecture:** Preserve the static Next.js -> Tauri -> Rust -> Swift boundary. Make behavior changes test-first, split native modules by owner, and keep `make validate` as the CI-equivalent verification entry point.

**Tech Stack:** Next.js 16.2, React 19, TypeScript 5.9, Vitest, React Testing Library, Tauri 2, Rust 1.88, Swift 6, Yarn 1.

---

### Task 1: Align documentation and toolchain

**Files:** `.knowledge/*.md`, `package.json`, `next.config.ts`

- [ ] Update verified implementation status in `.knowledge`.
- [ ] Relax the Node engine to `>=24.14.1 <25` while retaining `.nvmrc`.
- [ ] Configure the explicit Turbopack root from `next.config.ts`.
- [ ] Run the engine, lint, and production-build checks.

### Task 2: Add frontend test infrastructure

**Files:** `package.json`, `yarn.lock`, `vitest.config.ts`, `test/setup.ts`, `Makefile`, `.github/workflows/*.yml`

- [ ] Add Vitest, jsdom, and React Testing Library as development dependencies.
- [ ] Add deterministic `test` and `test:run` scripts.
- [ ] Include frontend tests in local and CI validation.
- [ ] Run an empty baseline suite successfully.

### Task 3: Make camera mutations race-safe

**Files:** `contexts/cameras/index.tsx`, `contexts/cameras/*.test.tsx`

- [ ] Write controllable-promise tests for overlapping mutations and stale completion.
- [ ] Run them and confirm failure under the current provider.
- [ ] Add token-based mutation ownership without changing the context API.
- [ ] Run focused and frontend suites.

### Task 4: Characterize and decompose Rust native modules

**Files:** `src-tauri/src/commands/{profiles,camera}/**`, `src-tauri/src/sidecar/native_agent/**`

- [ ] Preserve existing behavior with focused Rust tests.
- [ ] Move models, validation, application, preferences, preview, transport, envelope, errors, and health into owner-scoped modules.
- [ ] Keep command names, visibility, and serialized values unchanged.
- [ ] Run Rust tests and Clippy after each domain move.

### Task 5: Characterize and decompose Swift audio

**Files:** `native/macos-agent/Sources/HarmoniAgent/audio-*.swift`, `native/macos-agent/Tests/HarmoniAgentTests/*`

- [ ] Add hardware-free characterization tests for pure normalization where missing.
- [ ] Split discovery, property access, mutations, and event watching by responsibility.
- [ ] Preserve Swift entry points and JSON output.
- [ ] Run Swift tests and sidecar build.

### Task 6: Complete validation integration

**Files:** `Makefile`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, documentation

- [ ] Ensure `make validate` includes frontend tests and remains CI-equivalent.
- [ ] Ensure pull-request validation remains enabled.
- [ ] Run version check, frontend tests, lint, build, Rust check/tests/Clippy, Swift tests, and sidecar build.
- [ ] Run `git diff --check` and inspect the complete diff.
