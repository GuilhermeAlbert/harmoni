# Harmoni Agent Instructions

`AGENTS.md` is the canonical instruction file for AI assistants working in the
Harmoni project. Topic-specific guidance lives in [`.knowledge/`](.knowledge/README.md).
When this file and supplementary guidance conflict, follow this file.

## Product and scope

Harmoni is a private macOS desktop application for centralized device and
peripheral management. Its current capabilities include audio input and output
selection, volume and mute control, camera discovery and supported controls,
peripheral discovery, local configuration profiles, macOS permission status,
device connection events, and distribution through GitHub Releases.

The initial roadmap explicitly excludes DriverKit, System Extensions, virtual
audio or camera devices, the Mac App Store, cloud synchronization, account
login, a remote backend, telemetry, subscriptions, and payments.

## Current stack

- Next.js 16.2 with the App Router and static export
- React 19 and TypeScript in strict mode
- Tailwind CSS 4 and Lucide React
- React Hook Form and Zod only for real forms that justify them
- Tauri 2 with Rust
- Swift for macOS-specific public APIs
- Yarn 1.22.22, ESLint 9, GitHub Actions, and GitHub Releases

Before changing framework behavior, read the relevant installed Next.js
documentation and follow its current deprecations.

## Runtime architecture

The frontend is statically exported and embedded in Tauri. Do not introduce a
Next.js runtime server, Route Handler, Server Action, backend proxy, remote API,
or network contract without a separate approved specification.

The intended native boundary is:

```text
Next.js UI
  → functional frontend service
    → allowlisted Tauri command
      → Rust validation and orchestration
        → Swift executable
          → supported public macOS API
```

Visual components never import or call Tauri `invoke` directly. Native
responses and events are versioned, typed, validated at boundaries, and explicit
about unsupported capabilities. See [Native boundaries](.knowledge/native_boundaries.md).

## Frontend structure

Use the App Router and make URLs the source of truth for navigation. Do not
duplicate the active route in React state.

```text
app/
└── (dashboard)/
    ├── layout.tsx
    ├── _components/
    ├── page.tsx
    ├── audio/page.tsx
    ├── cameras/page.tsx
    ├── peripherals/page.tsx
    ├── profiles/page.tsx
    └── settings/page.tsx
components/        # Application-wide reusable UI and layouts
contexts/          # Proven cross-cutting client state only
lib/
├── constants/     # Shared constants and explicit fixtures
├── enums/         # Closed named value sets
├── i18n/          # Typed locale dictionaries and resolvers
├── services/      # Functional external/native boundaries
└── types/         # Shared domain and boundary types
```

Keep pages and layouts as Server Components unless browser APIs, event handlers,
or React client hooks require otherwise. Add `"use client"` only at the
smallest practical interactive boundary.

Feature-specific code belongs in its route segment. Route-private components
belong in `_components/`; dashboard-shared UI belongs in the dashboard
group's `_components/`; application-wide primitives belong in `components/`.
Promote components only after reuse proves a broader owner.

Ownership determines placement and promotion. Start with a child colocated in
its owning component, promote it to route-private `_components/` when multiple
route components consume it, then to the route-group or top-level `components/`
only when reuse crosses those boundaries. Extract units for a clear
responsibility or interface, never only to reduce line count.

## Component rules

- Every ordinary React component has a kebab-case folder and `index.tsx`.
- Put component props in its own `types.ts` when props exist. Use
  `PropsWithChildren` directly when children is the only prop.
- Component-owned microcomponents live in their own folders directly inside
  their owner. Do not add another generic `_components` layer there.
- Use Lucide React for interface icons. Do not create aggregate icon files.
- Declare an explicit `React.ReactNode` return type on components.
- Prefer semantic HTML and native controls. Every icon-only button needs an
  accessible name.
- Do not organize with Atomic Design or create `atoms`, `molecules`,
  `features`, `screens`, or a generic `app-shell`.
- Do not extract one-off wrappers or abstractions without a proven responsibility.
- Keep component-owned constants in `constants.ts` and pure transformations in
  `helper.ts`. Keep React state, effects, event wiring, and value composition in
  the owning component, context, or focused hook.

## Styling and design

Use Tailwind utility classes directly in JSX. Do not add CSS Modules,
component stylesheets, CSS-in-JS, authored global semantic selectors, or custom
CSS properties. `app/globals.css` contains only the Tailwind import and the
official class-controlled dark variant.

The Maestro image is Harmoni's official icon. The product uses restrained,
monochrome hierarchy: warm white and pale zinc in Light, near-black and graphite
in Dark, subtle borders, and semantic color only for meaningful states. Load
Geist, Inter, and Commit Mono from local licensed files with `next/font/local`;
production builds must not fetch fonts from the network.

Preserve WCAG AA contrast, semantic structure, visible focus, keyboard
operation, usable touch targets, and `prefers-reduced-motion`. Do not convey
state through color alone.

## State, hooks, and effects

Keep state at the lowest owner. Lift it only to the closest shared ancestor.
Use props for short stable paths and context only for proven distributed
consumers. Do not add Redux, Zustand, another global store, or a query cache
without demonstrated need.

The URL owns navigation state. Feature routes own transient interaction state.
Imported fixtures are immutable and must be copied before local demonstration
mutations. Mark fixtures clearly and replace them as sources when native data
becomes available; never hide a native failure behind fixture fallback.

Use a custom hook only for behavior that depends on React state, context,
effects, subscriptions, or lifecycle. Network/native functions are services,
not hooks. Use effects only to synchronize with external systems and include
all reactive dependencies. Clean up subscriptions and timers. Do not use
memoization without a measured computation or real referential contract.

## Functional architecture and types

Application code is functional. Do not declare custom classes. Export named
functions for services, helpers, hooks, factories, and behavior.

- Shared domain and boundary types belong in `lib/types/`.
- Closed named sets belong in `lib/enums/` as string enums.
- Standalone fixed values use `SCREAMING_SNAKE_CASE`.
- Closed mappings use module-level typed `Record` values.
- Component-specific props remain in the component folder.
- Use `import type` for type-only imports.
- Avoid `any`, unsafe assertions, magic protocol values, and duplicated unions.
- Do not create `index.ts` files that only re-export symbols.
- Enrich native `Error` objects through factory functions rather than classes.

Services represent real boundaries only. Do not wrap fixture arrays in services
or invent remote contracts. Components consume domain services and never
low-level transports directly.

## Native module ownership

Rust Tauri commands are thin boundary functions. Keep request validation,
domain orchestration, protocol parsing, persistence, and process transport in
focused owner-scoped modules when more than one responsibility is present.
Private modules stay with their owning command or event domain; promote only
concepts genuinely shared by multiple domains.

Swift's executable entry point only reads, decodes, dispatches, and writes
protocol envelopes. Dispatch closed request methods exhaustively and delegate
resource behavior to focused handlers. Separate platform discovery, mutation,
normalization, event watching, and serialized models when these responsibilities
otherwise accumulate in one file.

For both Rust and Swift, keep closed protocol values in enums, repeated mappings
in typed tables, and stable identifiers, messages, schema versions, retry
configuration, and request prefixes in named constants at the narrowest shared
scope. Runtime device data, operating-system text, paths, and open platform
values remain runtime values. Preserve serialized wire values when introducing
types.

## Context folder contract

A shared context under `contexts/<name>/` uses only the files it needs:

- `context.ts` declares the typed context.
- `index.tsx` declares the provider.
- `use-<name>.ts` declares the consumer hook.
- `types.ts` contains real context-specific types.
- `constants.ts`, `helper.ts`, or `reducer.ts` exist only when justified.

Never create empty files to make context folders look uniform. Keep providers
focused on React state, lifecycle, actions, and value composition.

## Internationalization

Harmoni supports `en`, `pt-BR`, and `es`; English is the fallback. URLs
remain locale-neutral and browser-language detection is not used. All visible
copy, placeholders, alternative text, and accessible labels belong in typed
dictionaries. Domain identifiers remain language-neutral and map to messages at
the UI boundary. See [Internationalization](.knowledge/internationalization.md).

## Naming

Code, identifiers, comments, technical documentation, and commit messages are
English. Component and type names use PascalCase; functions and runtime values
use camelCase; constants use SCREAMING_SNAKE_CASE. Ordinary source files and
component/route folders use lowercase kebab-case. Documentation topic files use
snake_case. See [Naming conventions](.knowledge/naming_conventions.md).

## Forms and testing

Use React Hook Form and Zod only when a real form needs field lifecycle and
schema validation. Do not add them for switches, sliders, filters, or one-button
actions. Do not mirror form field values in React state.

The frontend intentionally has no unit-test runner in the initial roadmap.
Validate frontend work with lint, production build, and specific manual
interaction checks. Native implementations use their applicable Rust and Swift
validation commands. Never claim a validation passed without running it.

## Security and macOS behavior

Use public macOS APIs and least-privilege Tauri capabilities. Do not request
permissions on page load, capture keystrokes, log secrets or sensitive device
data, or claim an operation is supported when macOS does not expose it. Report
unknown, restricted, unavailable, and unsupported states explicitly.

## Recommendations and open questions

**Recommendation:** Start distribution with Apple Silicon and add other
architectures only after runner, sidecar, signing, and artifact behavior are
verified.

**Recommendation:** Persist local profiles in the Tauri application data
directory with an explicit schema version.

**Open question:** The minimum supported macOS version is not yet decided.

**Open question:** The final bundle identifier, Apple Developer team, signing
identity, notarization credentials, and update strategy are not yet decided.

**Open question:** Device-disable operations must be evaluated per device class
and supported macOS version before being exposed.
