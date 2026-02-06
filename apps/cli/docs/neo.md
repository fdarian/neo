# neo

Opens an interactive shell in a container.

## Usage

```bash
neo
```

## Behavior

### CWD-Aware Container Detection

If your current working directory is inside `~/.config/neo/containers/{name}/shared/`, `neo` will:

1. Auto-detect the container name from the path
2. Open a shell in that container
3. Change directory to the matching path inside the container

For example, if you're in `~/.config/neo/containers/dev/shared/projects/myapp`:
- Opens shell in `dev` container
- Changes to `/shared/projects/myapp` inside the container

### Default Container

If you're not in a container directory, `neo` uses the container named `one`.

### Auto-Start

The container is automatically started before opening the shell if it's not already running.

## Volume Mapping

The host directory:
```
~/.config/neo/containers/{name}/shared/
```

Is mounted to:
```
/shared/
```

Inside the container.
