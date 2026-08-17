# Frontend Device State Reliability Design

> Prevent stale asynchronous device operations while reducing duplicated refresh and subscription mechanics.

## Problem

`CamerasProvider` permits overlapping optimistic mutations. A late failure can
restore an older camera snapshot, and an earlier completion can clear the pending
state for a newer operation. Device providers also repeat request sequencing,
event subscription, debounce, cleanup, and refresh bookkeeping with small
behavioral differences that make fixes easy to apply inconsistently.

## Scope

- Serialize camera mutations at the provider boundary.
- Ensure only the owning operation may publish success, rollback, or clear pending state.
- Preserve the existing context API and visible busy behavior.
- Extract only the refresh/subscription lifecycle shared without domain-specific branching.
- Keep discovery-state mapping, optimistic projections, and mutation semantics in each domain provider.
- Add deterministic regression coverage for stale reads, overlapping mutations, unmount cleanup, and debounced events.

## Design

Camera mutation ownership uses an opaque monotonically increasing token held in a
ref. A mutation starts only when no other mutation is active. Every completion
checks ownership before changing state; `finally` clears pending state only when
the same token is still active. Audio adopts the same token model if the shared
contract makes its current boolean guard insufficient.

A focused client hook may own the mechanical discovery lifecycle: triggering a
refresh generation, rejecting stale responses, scheduling debounced refreshes,
and disposing event subscriptions and timers. It accepts typed callbacks for
discovery and failure but does not own devices, domain states, optimistic data,
or native service selection.

The hook is justified only if audio, cameras, and peripherals can use one
identical lifecycle contract. Otherwise, keep the providers separate and share
only a small request-generation helper.

## State invariants

- At most one mutation per provider is active.
- A stale discovery response never replaces newer device data.
- A failed mutation never restores state older than its own optimistic snapshot.
- Pending state identifies the active mutation or is `null`.
- Every native subscription is disposed exactly once.
- Unmounted providers do not publish state.
- Native failures remain visible and never fall back to fixtures.

## Acceptance criteria

- Rapid camera preference, zoom, or exposure actions cannot overlap.
- A late success or failure from an obsolete operation cannot modify current state.
- Audio, camera, and peripheral event bursts cause one debounced refresh per domain.
- Existing context consumers require no API changes.
- Loading, ready-with-refresh, empty, and error states retain current UI behavior.
- The implementation does not introduce a global store or query-cache dependency.

## Validation

- Add focused tests with controllable promises for response ordering and rollback behavior.
- Verify subscription cleanup and timer cancellation with fake timers.
- Run `yarn lint` and `yarn build`.
- Manually exercise rapid camera sliders, preference changes, device connection events, and retry controls in the Tauri app.

## Out of scope

- Changing the native device protocol.
- Adding device capabilities.
- Moving domain state into a generic provider.
- Introducing Redux, Zustand, TanStack Query, or a remote transport.

