# neo

CLI toolkit for working with Apple containers as a second dev environment. Wraps the `container` CLI with smart defaults and CWD-aware container detection.

## Installation

From the `apps/cli` directory:

```bash
bun link
```

## Quick Start

```bash
# Open interactive shell in a container (CWD-aware)
neo

# List all containers
neo ls

# Create a new container
neo create [name]

# Remove a container
neo remove [name]

# Check and fix DNS configuration
neo dns doctor
```

## Config

Configuration and container data stored in `~/.config/neo/`

## Documentation

Detailed command documentation:

- [`neo`](./docs/neo.md) — Open interactive shell (default command)
- [`neo ls`](./docs/neo-ls.md) — List containers
- [`neo create`](./docs/neo-create.md) — Create a new container
- [`neo remove`](./docs/neo-remove.md) — Remove a container
- [`neo dns doctor`](./docs/neo-dns-doctor.md) — Check and fix DNS configuration
