# Tauri host

This crate starts the Harmoni desktop window, embeds the static Next.js export
from `../out`, and exposes narrow commands for native-agent health and the
development device-event contract.

`com.harmoni.desktop` is a provisional bundle identifier recommendation. It is
not a final distribution decision and must be reviewed before signing or
shipping the application.

## Device event lifecycle

The current device event contract uses a one-shot Swift process for the
deterministic development trigger. Rust validates the versioned event before
emitting `harmoni://device-change`; malformed output is rejected and never
forwarded to the frontend.

Frontend consumers subscribe through `lib/services/device-events.ts` and must
call the returned unsubscribe function during cleanup. There is no persistent
native stream, automatic reconnect, retry, polling, or real device discovery in
this increment. A remounted consumer creates a new Tauri subscription. Process
or protocol errors end only the triggering operation and require another
explicit development trigger.
