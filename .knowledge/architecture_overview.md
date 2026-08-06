# Architecture Overview

> Define Harmoni's planned runtime boundaries and incremental source layout.

## Product boundary

Harmoni is a local macOS desktop application. It manages supported devices and
profiles on the current Mac. The initial architecture has no remote backend,
account system, cloud synchronization, or runtime web server.

## Runtime flow

The Next.js application is exported as static files and embedded in Tauri.
Interactive frontend code calls functional services. Those services call
allowlisted Tauri commands. Rust validates and orchestrates requests. Swift owns
macOS-specific public API access.

```text
Static Next.js UI
  → frontend domain service
    → Tauri invoke or event subscription
      → Rust command and validation
        → Swift request
          → public macOS framework
```

Responses travel back through the same boundaries as versioned, typed data.
Each boundary rejects malformed or unsupported values rather than guessing.

## Planned routes

```text
app/(dashboard)/
├── layout.tsx
├── _components/
├── page.tsx
├── audio/page.tsx
├── cameras/page.tsx
├── peripherals/page.tsx
├── profiles/page.tsx
└── settings/page.tsx
```

The route group shares layout without adding a URL segment. The URL is the
source of truth for the active destination.

## Data sources

Product screens begin with typed immutable fixtures. Fixtures support explicit
loading, empty, error, and success demonstrations. A fixture must never be
presented as native data.

Native integration replaces the relevant fixture as the source of truth in a
later specification. The UI must not silently fall back to fixtures when native
discovery fails. Local profiles are planned to use versioned storage in the
Tauri application data directory.

## Delivery stages

1. Repository and knowledge foundation.
2. Static frontend shell and design system.
3. Product routes backed by typed fixtures.
4. Tauri, Rust, and Swift communication foundation.
5. Read-only permission and device discovery.
6. Capability-gated device mutations and local profiles.
7. Reproducible GitHub Release artifacts.

Every stage must remain buildable and manually verifiable.

## Explicit exclusions

The initial roadmap excludes kernel-adjacent extensions, virtual devices, the
Mac App Store, remote services, telemetry, and commercial account features.

## Recommendations and open questions

**Recommendation:** Keep native protocol envelopes versioned from their first
implementation even while they contain only a health command.

**Open question:** The minimum macOS deployment target must be chosen before
native packaging becomes stable.

**Open question:** Distribution architecture support beyond Apple Silicon needs
runner and sidecar verification.

