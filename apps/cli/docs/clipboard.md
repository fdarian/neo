# Clipboard Integration

Bridges the host macOS clipboard into containers so standard Linux clipboard tools (`xclip`, `xsel`) work transparently.

## Architecture

```
Container                              Host (macOS)
─────────                              ────────────
neovim / lazygit / any app             neo clipboard daemon
  ↓                                    @effect/platform HttpServer
/shared/.neo/bin/xclip (shim)  ──HTTP──→ 0.0.0.0:<port>
  ↓                                    GET  /clipboard → pbpaste
curl <host-gateway-ip>                 POST /clipboard → pbcopy
```

The daemon runs on the host, listens on a random port, and proxies clipboard read/write to `pbcopy`/`pbpaste`. Shim scripts inside the container call the daemon via `curl`.

## Setup

### Host

1. The daemon auto-starts when you run `neo` (before container exec)

### Container

Add to `.zshrc`:

```bash
eval "$(neo child setup)"
```

This writes shim scripts to `/shared/.neo/bin/` and prepends the directory to `PATH`.

## How It Works

1. `neo` on host calls `ensureDaemonRunning` → spawns `neo clipboard daemon` if not running
2. Daemon picks a free port, writes `{pid, port}` to `~/.config/neo/daemon.json`
3. Port number is written to the container's shared volume at `.neo/daemon-port`
4. Inside the container, `neo child setup` writes `xclip`/`xsel` shims that read the port file, resolve the host gateway IP from `/etc/resolv.conf`, and `curl` the daemon

## Commands

- `neo clipboard daemon` — Run the HTTP clipboard bridge (foreground, prints port to stdout)
- `neo child setup` — Write shims and print `export PATH=...` for eval

## Prerequisites

- `curl` must be installed in the container
- Container must have a nameserver entry in `/etc/resolv.conf` pointing to the host gateway
- Container `.zshrc` must include `eval "$(neo child setup)"`
