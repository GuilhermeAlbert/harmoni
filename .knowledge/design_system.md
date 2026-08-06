# Design System

> Define Harmoni's restrained visual identity and accessible interface contract.

## Identity

The supplied Maestro image is the official Harmoni icon. Preserve the original
source and derive browser and application assets from it. Use meaningful
alternative text when the image conveys identity and empty alternative text
only when it is decorative.

The HTML prototype is a reference for hierarchy, density, screen content, and
interaction intent. It is not production markup and must not be copied
literally. Replace its CDN setup, text glyph icons, embedded image data, and
panel-switching script with the documented stack and route architecture.

## Visual direction

Harmoni is precise, restrained, and operational:

- Warm white and pale zinc surfaces in Light.
- Near-black and graphite surfaces in Dark.
- Subtle zinc borders and restrained shadows for depth.
- Color only for semantic success, warning, danger, permission, and device state.
- No decorative glow, loud gradient, glass effect, or persistent chromatic accent.

Every semantic state also uses text, an icon, shape, or another non-color cue.

## Typography

Load licensed Geist, Inter, and Commit Mono files locally through
`next/font/local`. Production builds must not fetch fonts from the network.

- Geist: headings and display text.
- Inter: body, navigation, labels, and controls.
- Commit Mono: identifiers, versions, technical values, and compact metrics.

Use sentence case and do not use mono as decoration.

## Layout and responsiveness

The dashboard uses compact operational density, a desktop sidebar, sticky
header, continuous panels, and progressively disclosed data. Narrow layouts use
accessible mobile navigation and recompose content instead of shrinking an
unreadable desktop canvas.

Use Tailwind's spacing scale and responsive variants. Do not use JavaScript
viewport checks for purely visual changes.

## Components and states

Application-wide primitives live in `components/`; route compositions stay
with their owner. Interactive primitives expose applicable default, hover,
active, focus-visible, loading, disabled, invalid, selected, and destructive
states. Closed variants use enums and typed class maps.

Use Lucide React for interface icons. Keep each custom icon component in its own
folder if a custom icon is actually necessary.

## Accessibility

- Meet WCAG AA contrast.
- Prefer semantic native elements.
- Preserve visible keyboard focus.
- Associate form labels, hints, and errors.
- Give icon-only actions accessible names.
- Keep touch targets usable at narrow widths.
- Trap and restore focus for modal interactions.
- Announce asynchronous results in the smallest relevant live region.
- Respect reduced-motion preferences.

## Motion

Use short, quiet transitions to clarify state and continuity. Reduced-motion
mode removes nonessential movement without hiding state changes. Avoid long
entrances, parallax, and decorative animation.

## Styling boundary

Write Tailwind utilities in JSX. Do not create CSS Modules, component
stylesheets, CSS-in-JS, semantic global classes, or custom CSS properties.
Global CSS is limited to Tailwind's import and official class-controlled dark
variant.

