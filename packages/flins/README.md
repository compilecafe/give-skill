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

# Install globally
npx flins@latest add expo --global

# Browse available skills
npx flins@latest search
```

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

## Documentation

For complete documentation, see the [main README](../../README.md).
