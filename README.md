<div align="center">

# flins

**Universal skill and command manager for AI coding agents**

Install, manage, and update skills and commands across 42 supported agent integrations from one CLI.

[![npm version](https://badge.fury.io/js/flins.svg)](https://www.npmjs.org/package/flins)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-standard-blue)](https://agentskills.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## Overview

**flins** is an open-source CLI that provides a unified interface for managing agent skills and commands across all skill-compatible coding assistants. It follows a familiar command pattern while working seamlessly with the [Agent Skills](https://agentskills.io) open standard.

## Supported Agents

flins supports these canonical `--agent` values:

Local installs default to `universal`, which writes to `.agents/skills` and is picked up by Amp, Cline, Codex, Cursor, Gemini CLI, GitHub Copilot, Kimi Code CLI, OpenCode, Replit, and Universal. In the interactive local installer, that shared folder appears once as `universal` instead of repeating those agents as separate checkboxes.

| Project folder | Agents | `--agent` values |
| --- | --- | --- |
| `.agents/skills` | Amp, Cline, Codex, Cursor, Gemini CLI, GitHub Copilot, Kimi Code CLI, OpenCode, Replit, Universal | `amp`, `cline`, `codex`, `cursor`, `gemini-cli`, `github-copilot`, `kimi-cli`, `opencode`, `replit`, `universal` |
| `.agent/skills` | Antigravity | `antigravity` |
| `.augment/skills` | Augment | `augment` |
| `.claude/skills` | Claude Code | `claude-code` |
| `skills/` | OpenClaw | `openclaw` |
| `.codebuddy/skills` | CodeBuddy | `codebuddy` |
| `.commandcode/skills` | Command Code | `command-code` |
| `.continue/skills` | Continue | `continue` |
| `.cortex/skills` | Cortex Code | `cortex` |
| `.crush/skills` | Crush | `crush` |
| `.factory/skills` | Droid | `droid` |
| `.goose/skills` | Goose | `goose` |
| `.junie/skills` | Junie | `junie` |
| `.iflow/skills` | iFlow CLI | `iflow-cli` |
| `.kilocode/skills` | Kilo Code | `kilo` |
| `.kiro/skills` | Kiro CLI | `kiro-cli` |
| `.kode/skills` | Kode | `kode` |
| `.skills` | Letta | `letta` |
| `.mcpjam/skills` | MCPJam | `mcpjam` |
| `.vibe/skills` | Mistral Vibe | `mistral-vibe` |
| `.mux/skills` | Mux | `mux` |
| `.openhands/skills` | OpenHands | `openhands` |
| `.pi/skills` | Pi | `pi` |
| `.qoder/skills` | Qoder | `qoder` |
| `.qwen/skills` | Qwen Code | `qwen-code` |
| `.roo/skills` | Roo Code | `roo` |
| `.trae/skills` | Trae, Trae CN | `trae`, `trae-cn` |
| `.windsurf/skills` | Windsurf | `windsurf` |
| `.zencoder/skills` | Zencoder | `zencoder` |
| `.neovate/skills` | Neovate | `neovate` |
| `.pochi/skills` | Pochi | `pochi` |
| `.adal/skills` | AdaL | `adal` |

## Installation

```bash
# Local install with bunx (default)
bunx --bun flins@latest add <source>

# Local install with npx (default)
npx flins@latest add <source>

# Explicit global install
bunx --bun flins@latest add <source> --global

# Install globally with Bun
bun add -g flins
flins add <source>
```

## Quick Start

```bash
# Install from flins directory (Browse via `flins search` or https://flins.tech/)
flins add better-auth

# Install from GitHub
flins add expo/skills

# Install to specific agent
flins add expo -a claude-code

# Install globally
flins add expo --global

# Browse available skills
flins search
```

**flins directory** = a curated catalog of popular skills. Browse via `flins search` or https://flins.tech/

> See [Source Formats](#source-formats) below for all supported sources (GitHub, GitLab, Codeberg, etc.)

## CLI Commands

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `flins add <src>` | Install skills/commands from source |
| `flins update`    | Update installed skills/commands    |
| `flins outdated`  | Check for available updates         |
| `flins remove`    | Uninstall skills/commands           |
| `flins list`      | List all installed skills/commands  |
| `flins search`    | Interactive skill browser           |
| `flins clean`     | Remove orphaned state entries       |

**Common options:**

- `-g, --global` - Install globally (user-level). Local is the default.
- `-a, --agent <name>` - Target specific canonical agents. For local installs, `universal` covers the shared `.agents/skills` folder.
- `-s, --skill <name>` - Install specific skill by name
- `-y, --yes` - Auto-confirm all prompts
- `-f, --force` - Skip all confirmations
- `--silent` - Suppress non-error output
- `--no-symlink` - Copy files directly instead of symlinks

See the Supported Agents table above when you need canonical ids and project folders.

Command installation exists, but it is still experimental and currently limited to `claude-code`, `opencode`, and `droid`.

### Source Formats

```bash
# Directory name (Browse via `flins search` or https://flins.tech/)
flins add better-auth

# GitHub shorthand
flins add expo/skills

# GitHub full URL
flins add https://github.com/expo/skills

# GitLab
flins add https://gitlab.com/org/repo

# Codeberg
flins add https://codeberg.org/user/repo

# Any git repository
flins add https://example.com/repo.git

# Specific branch
flins add https://github.com/expo/skills/tree/develop

# Well-known skills endpoint (RFC)
flins add developer.cloudflare.com
```

### Well-Known Skills Discovery (RFC)

flins supports [Cloudflare's Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc). Install skills directly from any domain hosting a `/.well-known/skills/index.json` endpoint:

```bash
# Install from Cloudflare docs
flins add developer.cloudflare.com

# List available skills
flins add developer.cloudflare.com --list

# Install specific skill
flins add developer.cloudflare.com --skill cloudflare
```

Works with any RFC-compatible domain — just run `flins add <domain>` to fetch from `/.well-known/skills/`.

## Symlink-First Architecture

By default, flins uses symlinks for efficient skill management:

```
.agents/                    # Source files (single copy)
├── skills/
│   └── better-auth/
└── commands/
    └── deploy.md

# Agents that use .agents/skills directly read from it:
.agents/skills/better-auth     # amp, cline, codex, cursor, gemini-cli, github-copilot, kimi-cli, opencode, replit, universal

# Agent-specific folders receive symlinks:
.claude/skills/better-auth   → .agents/skills/better-auth
.windsurf/skills/better-auth → .agents/skills/better-auth
.roo/skills/better-auth      → .agents/skills/better-auth
```

**Benefits:**
- Single source of truth — update once, reflected everywhere
- Smaller disk footprint — no duplicate files across agents
- Easier maintenance — manage all skills from `.agents/`

Use `--no-symlink` to copy files directly instead.

## Where Files Go

Project and global folders vary by agent, and some agents intentionally share the same canonical folder.

See the Supported Agents table above for canonical project folders and `--agent` values.

For global installations, source files are stored in `~/.flins/.agents/skills/` and `~/.flins/.agents/commands/`.

## Creating Skills

Skills follow the [Agent Skills](https://agentskills.io) open standard. A skill is a folder with a `SKILL.md` file:

```markdown
---
name: pr-reviewer
description: Reviews pull requests against team guidelines
---

# PR Reviewer

Reviews pull requests for code style, security, and performance.

## Usage

Activate when reviewing a pull request.
```

flins automatically discovers skills in `SKILL.md`, `skills/`, and agent-specific directories.

## State Management

flins tracks installations via lock files for team consistency:

| Type   | Location               | Purpose                          |
| ------ | ---------------------- | -------------------------------- |
| Local  | `./skills.lock`        | Project-specific (commit to git) |
| Global | `~/.flins/skills.lock` | Machine-wide installations       |

New contributors run `flins update` to sync.

## Contributing

- **Code contributions**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Add skills to flins directory**: See [CONTRIBUTING_SKILLS.md](CONTRIBUTING_SKILLS.md)

## License

MIT © [flins](https://github.com/powroom/flins)
