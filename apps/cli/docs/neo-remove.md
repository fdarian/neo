# neo remove

Removes a container.

## Usage

```bash
neo remove [name]
```

## Arguments

- `name` (optional) — Container name. If omitted, resolves from current working directory (same logic as the default `neo` command).

## Behavior

1. Stops the container (errors ignored if already stopped)
2. Removes the container

### Config Directory Preserved

The config directory (`~/.config/neo/containers/{name}/`) is **NOT** deleted. Your data in the `shared/` directory is preserved.

## Examples

```bash
# Remove container by name
neo remove dev

# Remove container from within its shared directory
cd ~/.config/neo/containers/dev/shared/
neo remove
```
