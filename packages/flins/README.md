# flins

Universal skill and command manager for AI coding agents.

Install, manage, and update skills and commands across 16+ AI development tools from a single unified interface.

## Installation

```bash
# Using npx (recommended)
npx flins@latest add <source>

# Install globally
npm install -g flins
flins add <source>
```

## Quick Start

```bash
# Install from flins directory
npx flins@latest add better-auth

# Install from GitHub
npx flins@latest add expo/skills

# Install from any git repo
npx flins@latest add https://gitlab.com/org/repo

# Install from well-known endpoint (RFC)
npx flins@latest add developer.cloudflare.com

# Install globally
npx flins@latest add expo --global

# Browse available skills
npx flins@latest search
```

## Well-Known Skills Discovery (RFC)

flins supports [Cloudflare's Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc). Install skills from any domain hosting a `/.well-known/skills/index.json` endpoint:

```bash
# Install from Cloudflare docs
flins add developer.cloudflare.com

# List available skills
flins add developer.cloudflare.com --list

# Install specific skill
flins add developer.cloudflare.com --skill cloudflare
```

Works with any RFC-compatible domain.

## Available Commands

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `flins add`      | Install skills/commands from source |
| `flins update`   | Update installed skills/commands    |
| `flins outdated` | Check for available updates         |
| `flins remove`   | Uninstall skills/commands           |
| `flins list`     | List all installed skills/commands  |
| `flins search`   | Interactive skill browser           |
| `flins clean`    | Remove orphaned state entries       |

## Symlink-First Architecture

By default, flins stores source files in `.agents/` and creates symlinks to each agent's directory. This means one source, multiple agents — no duplicate files.

Use `--no-symlink` to copy files directly instead.

## Documentation

For complete documentation, see the [main README](https://github.com/flinstech/flins/?tab=readme-ov-file#flins).
