<p align="center">
  <a href="https://github.com/GuilhermeAlbert/harmoni">
    <img src="cover.png" alt="Harmoni cover" style="border-radius: 8px;"/>
  </a>
</p>

# Harmoni

Harmoni is a macOS desktop application for centralized audio, camera,
peripheral, permission, and local profile management.

## Planned architecture

Harmoni will be delivered in small, independently validated stages:

1. A Next.js App Router frontend built with React, strict TypeScript, and
   Tailwind CSS.
2. A static Next.js export embedded directly in the Tauri application, with no
   Next.js runtime server.
3. A Tauri 2 host written in Rust that owns the desktop boundary and exposes
   narrow, typed commands to the frontend.
4. A Swift executable that integrates with supported public macOS APIs for
   platform-specific device operations.

The intended native request path is:

```text
Next.js → frontend service → Tauri command → Rust → Swift → typed response
```

## Toolchain policy

- Node.js 24.14.1, selected through `.nvmrc`
- Yarn 1.22.22, declared by `packageManager` and `engines`
- Stable Rust with the minimal profile, rustfmt, and Clippy
- Swift from the active Xcode command-line toolchain

Framework and application scripts will be added only by the specifications that
introduce their corresponding toolchains. This foundation intentionally has no
dependencies, application source directories, or placeholder build commands.

## Local development

```bash
yarn install --frozen-lockfile
yarn tauri dev
```

The static frontend can be validated with `yarn lint` and `yarn build`. The
native layers can be validated with `cargo test --manifest-path
src-tauri/Cargo.toml` and `yarn native:build`.

## Versions and macOS packages

The version must match in `package.json`, `src-tauri/Cargo.toml`,
`src-tauri/tauri.conf.json`, and the Swift agent. Run `yarn version:check`
before creating a tag.

Pull requests run frontend, Rust, and Swift validation on macOS. A GitHub
Release is created only when an explicit `v<version>` tag is pushed, for
example `v0.1.0`. A tag whose version differs from the application files fails
before packaging.

Tagged builds attach an architecture-native DMG, a zipped `.app`, and a
`SHA256SUMS.txt` file. Apple Silicon is the recommended initial distribution
target; the workflow does not promise a separate x86_64 artifact.

Signing and notarization are conditional. Configure `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`,
`APPLE_PASSWORD`, and `APPLE_TEAM_ID` as GitHub Actions secrets to enable the
Tauri signing flow. Without the complete secret set, artifacts are unsigned
and macOS Gatekeeper may require users to approve them manually.

## Development principles

- Keep source code, identifiers, technical documentation, and commits in
  English.
- Prefer small, explicit boundaries and avoid abstractions without real use.
- Keep fixture data visibly separate from native data.
- Treat unsupported macOS operations as explicit capabilities rather than
  simulated success.
