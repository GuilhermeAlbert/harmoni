<p align="center">
  <a href="https://github.com/GuilhermeAlbert/harmoni">
    <img src="cover.png" alt="Harmoni cover" style="border-radius: 8px;"/>
  </a>
</p>

# Harmoni

Harmoni is a private macOS desktop application for centralized device and
peripheral management. It will progressively list and control audio devices,
cameras, keyboards, mice, and reusable setup profiles through one desktop
interface.

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

## Current stage

The repository currently contains project metadata and toolchain policy only.
The Next.js application, Tauri host, Rust commands, Swift package, workflows,
and production UI belong to later specifications.

## Development principles

- Keep source code, identifiers, technical documentation, and commits in
  English.
- Prefer small, explicit boundaries and avoid abstractions without real use.
- Keep fixture data visibly separate from native data.
- Treat unsupported macOS operations as explicit capabilities rather than
  simulated success.
