# neo create

Creates a new container.

## Usage

```bash
neo create [name]
```

## Arguments

- `name` (optional) — Container name. If omitted, generates a random adjective-noun slug.

## What Gets Created

### Directory Structure

```
~/.config/neo/containers/{name}/shared/
```

This directory is created and serves as the shared volume mount point.

### Container Specs

- **Image**: `debian:stable-slim`
- **CPUs**: 8
- **Memory**: 8GB
- **Volume Mount**: `{configDir}/containers/{name}/shared` → `/shared/`

## Examples

```bash
# Create container with auto-generated name
neo create

# Create container with specific name
neo create dev
```
