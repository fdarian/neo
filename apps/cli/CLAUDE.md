## Overview
- CLI app exposing the `neo` command
- Entry: `bin.mjs` → `entries/cli.ts` → `src/commands/`

## Tech Stack
- **Effect** ecosystem: `effect`, `@effect/cli`, `@effect/platform`, `@effect/platform-bun`
- **TypeScript** (runs directly via Bun, no build step)
- Version synced from `package.json`

## Clipboard Bridge
- HTTP daemon on host proxies clipboard via `pbcopy`/`pbpaste`
- `src/clipboard/` — daemon router, shim scripts, daemon lifecycle
- `neo clipboard daemon` — host-side HTTP server
- `neo child setup` — container-side shim installer (called from `.zshrc`)
- See `docs/clipboard.md` for architecture

## Conventions
- Import alias: `#src/*` maps to `./src/*`
- CLI commands defined in `src/commands/`
- Type check: `bun run check:tsc`
