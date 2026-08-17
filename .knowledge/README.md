# Harmoni Knowledge Base

> Index the factual architecture and implementation guidance for Harmoni.

`../AGENTS.md` is canonical. These focused pages explain the rules without
repeating the full instruction set:

- [Architecture overview](architecture_overview.md) — product runtime, layers,
  routes, data sources, and staged delivery
- [Frontend patterns](frontend_patterns.md) — components, state, hooks,
  services, fixtures, and forms
- [Native boundaries](native_boundaries.md) — Tauri, Rust, Swift, protocol,
  permissions, capabilities, events, and errors
- [Design system](design_system.md) — Maestro identity, typography, surfaces,
  components, responsiveness, motion, and accessibility
- [Internationalization](internationalization.md) — supported locales,
  dictionaries, persistence, and domain boundaries
- [Naming conventions](naming_conventions.md) — files, folders, symbols,
  enums, constants, and imports

## Current verified state

The repository contains the static Next.js dashboard, typed locale dictionaries,
Tauri commands and capabilities, a Rust orchestration layer, a Swift macOS
sidecar, local profile persistence, device-event subscriptions, native tests,
and GitHub Actions validation and release workflows. Audio, camera, peripheral,
permission, profile, theme, and language flows are implemented within the
documented local-only product boundary.

## Documentation policy

Facts are grounded in the repository, supplied specifications, or canonical
instructions. Future-facing guidance is labelled as a recommendation or open
question and must not be treated as an implemented capability.
