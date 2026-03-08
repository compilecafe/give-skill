# flins

Universal skill and command manager for AI coding agents.

Install, manage, and update skills and commands across 42 supported agent integrations from one CLI.

## Installation

```bash
# Using bunx
bunx --bun flins@latest add <source>

# Using npx
npx flins@latest add <source>

# Install globally with Bun
bun add -g flins
flins add <source>
```

## Quick Start

```bash
# Install from flins directory
bunx --bun flins@latest add better-auth

# Install from flins directory with npx
npx flins@latest add better-auth

# Install from GitHub
bunx --bun flins@latest add expo/skills

# Install from GitHub with npx
npx flins@latest add expo/skills

# Install from any git repo
bunx --bun flins@latest add https://gitlab.com/org/repo

# Install from any git repo with npx
npx flins@latest add https://gitlab.com/org/repo

# Install from well-known endpoint (RFC)
bunx --bun flins@latest add developer.cloudflare.com

# Install from well-known endpoint (RFC) with npx
npx flins@latest add developer.cloudflare.com

# Inspect supported agents and folders
bunx --bun flins@latest agents

# Inspect supported agents and folders with npx
npx flins@latest agents

# Install globally
bunx --bun flins@latest add expo --global

# Install globally with npx
npx flins@latest add expo --global

# Browse available skills
bunx --bun flins@latest search

# Browse available skills with npx
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
| `flins agents`   | Show supported agents and folders   |
| `flins update`   | Update installed skills/commands    |
| `flins outdated` | Check for available updates         |
| `flins remove`   | Uninstall skills/commands           |
| `flins list`     | List all installed skills/commands  |
| `flins search`   | Interactive skill browser           |
| `flins clean`    | Remove orphaned state entries       |

## Supported Agents

flins supports these canonical `--agent` values:

| Project folder        | Agents                                                                                            | `--agent` values                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `.agents/skills`      | Amp, Cline, Codex, Cursor, Gemini CLI, GitHub Copilot, Kimi Code CLI, OpenCode, Replit, Universal | `amp`, `cline`, `codex`, `cursor`, `gemini-cli`, `github-copilot`, `kimi-cli`, `opencode`, `replit`, `universal` |
| `.agent/skills`       | Antigravity                                                                                       | `antigravity`                                                                                                    |
| `.augment/skills`     | Augment                                                                                           | `augment`                                                                                                        |
| `.claude/skills`      | Claude Code                                                                                       | `claude-code`                                                                                                    |
| `skills/`             | OpenClaw                                                                                          | `openclaw`                                                                                                       |
| `.codebuddy/skills`   | CodeBuddy                                                                                         | `codebuddy`                                                                                                      |
| `.commandcode/skills` | Command Code                                                                                      | `command-code`                                                                                                   |
| `.continue/skills`    | Continue                                                                                          | `continue`                                                                                                       |
| `.cortex/skills`      | Cortex Code                                                                                       | `cortex`                                                                                                         |
| `.crush/skills`       | Crush                                                                                             | `crush`                                                                                                          |
| `.factory/skills`     | Droid                                                                                             | `droid`                                                                                                          |
| `.goose/skills`       | Goose                                                                                             | `goose`                                                                                                          |
| `.junie/skills`       | Junie                                                                                             | `junie`                                                                                                          |
| `.iflow/skills`       | iFlow CLI                                                                                         | `iflow-cli`                                                                                                      |
| `.kilocode/skills`    | Kilo Code                                                                                         | `kilo`                                                                                                           |
| `.kiro/skills`        | Kiro CLI                                                                                          | `kiro-cli`                                                                                                       |
| `.kode/skills`        | Kode                                                                                              | `kode`                                                                                                           |
| `.skills`             | Letta                                                                                             | `letta`                                                                                                          |
| `.mcpjam/skills`      | MCPJam                                                                                            | `mcpjam`                                                                                                         |
| `.vibe/skills`        | Mistral Vibe                                                                                      | `mistral-vibe`                                                                                                   |
| `.mux/skills`         | Mux                                                                                               | `mux`                                                                                                            |
| `.openhands/skills`   | OpenHands                                                                                         | `openhands`                                                                                                      |
| `.pi/skills`          | Pi                                                                                                | `pi`                                                                                                             |
| `.qoder/skills`       | Qoder                                                                                             | `qoder`                                                                                                          |
| `.qwen/skills`        | Qwen Code                                                                                         | `qwen-code`                                                                                                      |
| `.roo/skills`         | Roo Code                                                                                          | `roo`                                                                                                            |
| `.trae/skills`        | Trae, Trae CN                                                                                     | `trae`, `trae-cn`                                                                                                |
| `.windsurf/skills`    | Windsurf                                                                                          | `windsurf`                                                                                                       |
| `.zencoder/skills`    | Zencoder                                                                                          | `zencoder`                                                                                                       |
| `.neovate/skills`     | Neovate                                                                                           | `neovate`                                                                                                        |
| `.pochi/skills`       | Pochi                                                                                             | `pochi`                                                                                                          |
| `.adal/skills`        | AdaL                                                                                              | `adal`                                                                                                           |

Run `flins agents` when you want the live project and global folder matrix.

## Symlink-First Architecture

By default, flins stores source files in `.agents/` and creates symlinks to each agent's directory. This means one source, multiple agents — no duplicate files.

Use `--no-symlink` to copy files directly instead.

Command installation exists, but it is still experimental and currently limited to `claude-code`, `opencode`, and `droid`.

## Documentation

For complete documentation, see the [main README](https://github.com/powroom/flins/?tab=readme-ov-file#flins).
