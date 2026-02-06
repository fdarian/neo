# neo dns doctor

Checks and fixes DNS configuration for containers.

## Usage

```bash
neo dns doctor
```

## What It Checks

1. **DNS Resolver "neo"** — Verifies the resolver exists; creates it if missing
2. **dns.domain Property** — Ensures it's set to "neo"; sets it if not configured

## Behavior

If any changes are made, the command will print instructions to restart containers for the changes to take effect.

## Example Output

```bash
# When changes are made
✓ Created DNS resolver "neo"
✓ Set dns.domain to "neo"

⚠️  Restart your containers for DNS changes to take effect
```

```bash
# When everything is configured
✓ DNS resolver "neo" exists
✓ dns.domain is set to "neo"

Everything looks good!
```
