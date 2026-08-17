# Documentation and Toolchain Alignment Design

> Make repository guidance and build configuration accurately describe and reliably build the current Harmoni application.

## Problem

The `.knowledge` index describes Next.js, Tauri, Rust, Swift, routes, and workflows
as unimplemented even though they are present. The Node engine accepts only one
patch release, and Next.js infers the wrong workspace root because the parent and
application directories both contain Yarn lockfiles.

## Scope

- Update `.knowledge` statements that describe implemented capabilities as planned.
- Add a concise verified-state inventory without duplicating `AGENTS.md`.
- Preserve genuine recommendations and unresolved product questions.
- Keep `.nvmrc` as the reproducible local Node version.
- Change the package engine to accept compatible Node 24 releases at or above the baseline.
- Configure the Next.js/Turbopack root explicitly to the `app/` repository.
- Document why the repository has a parent lockfile or remove it only if its owner confirms it is redundant.

## Design

`.knowledge/README.md` remains the index and reports only facts verified from the
current tree. Topic documents distinguish current behavior from future guidance
using explicit `Current implementation`, `Recommendation`, and `Open question`
sections. `AGENTS.md` remains canonical and should not duplicate file-by-file status.

`package.json` will use `>=24.14.1 <25` for Node compatibility while `.nvmrc` and CI
continue selecting the tested baseline. `next.config.ts` will derive an absolute
Turbopack root from the configuration file location, avoiding dependence on the
shell working directory.

## Acceptance criteria

- No knowledge page claims an existing subsystem is unimplemented.
- All documented routes, commands, services, and validation steps exist.
- Node 24.14.1 and a later Node 24 patch both pass the Yarn engine check.
- Node 25 is rejected by the declared engine range.
- `yarn build` no longer emits the multiple-lockfile workspace-root warning.
- Static export remains enabled and no server runtime is introduced.

## Validation

- Search `.knowledge` for stale phrases such as `not yet implemented` and review every match.
- Run `yarn version:check`, `yarn lint`, and `yarn build` with Node 24.14.1.
- Run `yarn install --ignore-scripts --frozen-lockfile` with a later Node 24 patch to verify engine compatibility without changing the lockfile.
- Inspect the build output for workspace-root warnings.

## Out of scope

- Changing dependency versions.
- Consolidating the parent and application repositories.
- Changing GitHub Actions triggers.
- Rewriting `AGENTS.md` rules that remain accurate.

