# Internationalization

> Keep Harmoni copy typed, complete, and independent from routes and domain values.

## Supported locales

Harmoni supports English (`en`), Brazilian Portuguese (`pt-BR`), and
Spanish (`es`). English is the fallback when no valid preference exists.
Do not infer the locale from the browser.

URLs never contain locale segments or locale query parameters. The selected
locale is a local interface preference suitable for static desktop output.

## Message contract

The English dictionary defines the canonical `Messages` shape. Portuguese and
Spanish dictionaries must satisfy that complete type. Organize semantic keys by
responsibility.

All visible copy, placeholders, alternative text, hints, errors, status text,
and accessible labels belong in the dictionaries. Product names and technical
identifiers remain neutral.

Use message functions only for small interpolations. Do not add an ICU parser
until plural or grammar requirements justify it.

## Runtime ownership

A focused language provider owns the selected locale, active messages, and
selection action for distant client consumers. Components consume the language
hook and do not read persistence directly.

Persist selection in the user event that changes it. Do not add an effect merely
to mirror locale state to storage. Invalid persisted values fall back to
English deterministically.

## Domain boundary

Enums, identifiers, native protocol values, fixture identifiers, and persisted
profile data remain language-neutral. Map them to dictionary keys at the UI
boundary. Never compare, transmit, or persist translated strings as domain
values.

Fixture prose should resolve from stable identifiers so changing language can
rerender the current screen.

## Language selector

Use a labelled native select unless a stronger interaction requirement is
demonstrated. Display language names as English, Português, and Español so the
control remains usable in every active locale.

## Recommendation

**Recommendation:** Use local storage for the initial locale preference because
the static Tauri frontend has no server cookie boundary. Revisit only if a real
server-rendered persistence requirement is introduced.

