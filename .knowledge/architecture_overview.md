# Architecture Overview

> Define Harmoni's current runtime boundaries and source layout.

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

## Implemented routes

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

Product screens read typed device, permission, profile, and event data through
frontend services backed by allowlisted Tauri commands. Native failures remain
visible and never trigger a fixture fallback. Local profiles use versioned JSON
storage in the Tauri application data directory, including migration and
recovery-copy behavior.

## Implemented delivery stages

1. Repository and knowledge foundation.
2. Static frontend shell and design system.
3. Product routes and typed locale dictionaries.
4. Versioned Tauri, Rust, and Swift communication.
5. Permission and device discovery through public macOS APIs.
6. Capability-gated device mutations, events, and local profiles.
7. GitHub Actions validation and tagged macOS release packaging.

Every stage must remain buildable and manually verifiable.

## Explicit exclusions

The initial roadmap excludes kernel-adjacent extensions, virtual devices, the
Mac App Store, remote services, telemetry, and commercial account features.

## Recommendations and open questions

**Current implementation:** Native protocol envelopes use protocol version 1,
correlated request identifiers, typed methods, and structured errors.

**Open question:** The minimum macOS deployment target must be chosen before
native packaging becomes stable.

**Open question:** Distribution architecture support beyond Apple Silicon needs
runner and sidecar verification.
