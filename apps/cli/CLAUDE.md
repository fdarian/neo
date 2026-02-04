## Overview
- CLI app exposing the `neo` command
- Entry: `bin.mjs` → `entries/cli.ts` → `src/commands/`

## Tech Stack
- **Effect** ecosystem: `effect`, `@effect/cli`, `@effect/platform`, `@effect/platform-bun`
- **TypeScript** (runs directly via Bun, no build step)
- Version synced from `package.json`

## Conventions
- Import alias: `#src/*` maps to `./src/*`
- CLI commands defined in `src/commands/`
- Type check: `bun run check:tsc`
