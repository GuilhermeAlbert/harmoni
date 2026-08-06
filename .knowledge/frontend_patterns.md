# Frontend Patterns

> Define ownership, rendering, state, and service patterns for Harmoni's static Next.js frontend.

## Rendering boundaries

Pages and layouts are Server Components by default. Add `"use client"` only
when a focused component requires React client hooks, event handlers, browser
storage, a native bridge, or another client-only API. Pass serializable values
into that boundary.

## Component ownership

Place each component at its narrowest proven owner:

1. Component-owned child: its own folder directly inside the parent folder.
2. Route-private component: the route's `_components/`.
3. Dashboard-shared component: `app/(dashboard)/_components/`.
4. Application-wide primitive or layout: top-level `components/`.

Every ordinary component uses a kebab-case folder and `index.tsx`.
Component-specific props use `types.ts`. Do not use Atomic Design, aggregate
component files, or re-export barrels.

## State ownership

Keep local interaction state in the smallest subtree that consumes it. Lift to
the nearest common owner only when several descendants need it. Use context for
stable cross-cutting concerns with genuinely distant consumers, such as locale
or theme, not as a default global store.

The current route is URL state. Derive active navigation from `usePathname()`
and a typed route configuration. Never maintain a second active-screen value.

Derive values during render. Do not mirror props or derived values in state.
Copy imported fixture collections before local demonstration mutations.

## Hooks and effects

Use a custom hook only for reusable behavior tied to React state, context,
effects, subscriptions, or lifecycle. A service call or pure transformation is
not a hook.

Effects synchronize external systems. Include every reactive dependency and
clean up listeners, native event subscriptions, and timers. Do not move event
logic into effects. Use memoization only for measured work or a real
referential-stability contract.

## Services and helpers

A service is a functional external boundary. Native services belong in
`lib/services/` and shield components from Tauri details. Do not introduce a
service around fixtures or a remote transport without a real contract.

A helper is a focused pure transformation. Keep one-use expressions near their
consumer and avoid generic utility collections. Functions, not classes, own
services and helpers.

## Fixtures

Fixtures are immutable, typed, and visibly identified in their modules and UI
behavior. A route may copy them into state for a local demonstration. When a
native specification replaces a fixture, remove that fixture as the production
source. Native errors remain visible and never trigger a hidden fixture fallback.

## Forms

Use React Hook Form and Zod only when a real create or edit form benefits from
field lifecycle, dirty state, submission state, and schema validation. Switches,
sliders, selectors, and command buttons do not justify a form library.

Keep a form schema beside its owning form. Do not mirror field values in
separate React state. Associate labels, hints, and errors semantically.

## Performance

Keep client boundaries narrow, dependencies lean, and state close to consumers.
Use stable domain identifiers as list keys. Prefer responsive Tailwind
composition to JavaScript viewport state. Measure before memoization,
virtualization, or dynamic imports.

## Recommendation

**Recommendation:** Introduce a shared component only when its complete visual
and accessibility contract repeats, not merely because two elements look alike.

