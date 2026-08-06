# Naming Conventions

> Keep Harmoni names consistent across TypeScript, React, Rust, Swift, and documentation.

## Language

Use English for source code, identifiers, comments, technical documentation,
commit messages, native protocol fields, and configuration. User-facing content
is authored in all supported locale dictionaries.

## Files and folders

- App Router special files keep framework names such as `page.tsx`,
  `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx`.
- Route segments and component folders use lowercase kebab-case.
- Private route implementation folders use an underscore role name,
  particularly `_components`.
- Ordinary React components use `<component-name>/index.tsx`.
- Component support files use focused names such as `types.ts`,
  `constants.ts`, and `enums.ts`.
- Domain types, enums, constants, services, hooks, and helpers use lowercase
  kebab-case filenames.
- Documentation topic files use snake_case; `README.md` remains conventional.
- Rust modules and Swift source names follow their language toolchain
  conventions without leaking those names into frontend contracts.

Do not create aggregate `icons.tsx`, `ui.tsx`, or re-export-only
`index.ts` files.

## TypeScript symbols

- Components and types: PascalCase.
- Functions, handlers, props, and runtime values: camelCase.
- Boolean values: affirmative names such as `enabled`, `available`, or
  `isLoading`.
- Fixed constants and configuration collections: SCREAMING_SNAKE_CASE.
- Enum members: PascalCase.

Use `on<Intent>` for callback props and `handle<Intent>` for named internal
handlers. Name components by responsibility, not visual shape.

## Types, enums, and constants

Use domain nouns for object types and an `Id` suffix for identifiers. Avoid
`I` prefixes, redundant `Type` suffixes, and duplicated string unions.

Use string enums for closed named sets used in assignments, comparisons, or
mappings. Consumers use enum members rather than raw strings. Use typed
module-level `Record` values for complete closed mappings. Use
`Partial<Record<...>>` only when omission is intentional and the consumer has
an explicit fallback.

Standalone fixed values use SCREAMING_SNAKE_CASE. Runtime-derived values remain
camelCase.

## Imports

Use `import type` for symbols erased at runtime. Use a configured alias only
after verifying it in `tsconfig.json`. Prefer relative imports inside one
ownership boundary and the configured alias when crossing features or route
ownership.

Import concrete type, enum, service, helper, and hook files. Do not add barrels
solely to shorten imports.

## Native contracts

Use frontend-domain names for shared protocol concepts. Do not expose Rust or
Swift implementation details in UI type names. Method and error identifiers are
stable, language-neutral, and versioned.

## Recommendation

**Recommendation:** Use `@/*` mapped to the project root once the Next.js
configuration specification introduces and verifies that alias.

