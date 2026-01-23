<div align="center">

# flins

**Universal skill and command manager for AI coding agents**

Install, manage, and update skills and commands across 19+ AI development tools from a single unified interface.

[![npm version](https://badge.fury.io/js/flins.svg)](https://www.npmjs.org/package/flins)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-standard-blue)](https://agentskills.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## Overview

**flins** is an open-source CLI that provides a unified interface for managing agent skills and commands across all skill-compatible coding assistants. It follows a familiar command pattern while working seamlessly with the [Agent Skills](https://agentskills.io) open standard.

## Supported Agents

[Antigravity](https://antigravity.google/), [Amp](http://ampcode.com/), [Claude Code](https://claude.com/product/claude-code), [Clawdbot](https://clawdbot.com/), [CodeBuddy](https://www.codebuddy.ai/), [Codex](https://openai.com/codex/), [CommandCode](https://commandcode.ai/), [Copilot](https://github.com/features/copilot), [Cursor](http://cursor.com/), [Factory Droid](https://factory.ai/), [Gemini CLI](https://geminicli.com/), [Goose](https://goose.ai/), [Kilo Code](https://kilo.ai/), [Kiro](https://kiro.dev/), [Letta](https://www.letta.com/), [Neovate](https://neovateai.dev/), [OpenCode](https://opencode.ai/), [OpenHands](https://openhands.ai/), [Pi](https://shittycodingagent.ai/), [Qoder](https://qoder.com/), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), [Roo Code](https://roocode.com/), [Trae](http://trae.ai/), [Windsurf](http://windsurf.com/), [Zencoder](https://zencoder.ai/)

## Installation

```bash
# Using npx (recommended)
npx flins@latest add <source>

# Using bunx
bunx --bun flins@latest add <source>

# Install globally
npm install -g flins
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

## Commands (Experimental)

> **Note:** Command support is experimental and varies by agent. No standard exists yet. Commands may work in one agent but fail in another due to incompatible syntax or features.

### Command Types

| Type       | Status            | Agents                       |
| ---------- | ----------------- | ---------------------------- |
| Markdown   | Supported         | Claude Code, OpenCode, Droid |
| JSON       | Not supported yet | OpenCode only                |
| Executable | Not supported yet | Factory Droid only           |

### Markdown Compatibility

| Feature         | Claude Code | OpenCode | Factory Droid |
| --------------- | ----------- | -------- | ------------- |
| `$ARGUMENTS`    | ✅          | ✅       | ✅            |
| `$1`, `$2`...   | ✅          | ✅       | ❌            |
| Bash `!command` | ✅          | ✅       | ❌            |
| File refs `@`   | ✅          | ✅       | ❌            |
| `allowed-tools` | ✅          | ❌       | ❌            |
| `hooks`         | ✅          | ❌       | ❌            |

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

- `-g, --global` - Install globally (user-level)
- `-a, --agent <name>` - Target specific agent
- `-s, --skill <name>` - Install specific skill by name
- `-y, --yes` - Auto-confirm all prompts
- `-f, --force` - Skip all confirmations
- `--silent` - Suppress non-error output
- `--no-symlink` - Copy files directly instead of symlinks

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
```

## Symlink-First Architecture

By default, flins uses symlinks for efficient skill management:

```
.agents/                    # Source files (single copy)
├── skills/
│   └── better-auth/
└── commands/
    └── deploy.md

# Symlinks created for each agent:
.claude/skills/better-auth   → .agents/skills/better-auth
.cursor/skills/better-auth   → .agents/skills/better-auth
.windsurf/skills/better-auth → .agents/skills/better-auth
.gemini/skills/better-auth   → .agents/skills/better-auth
.codex/skills/better-auth    → .agents/skills/better-auth
```

**Benefits:**
- Single source of truth — update once, reflected everywhere
- Smaller disk footprint — no duplicate files across agents
- Easier maintenance — manage all skills from `.agents/`

Use `--no-symlink` to copy files directly instead.

## Where Files Go

| Agent         | Skills (project)           | Skills (global)                        | Commands (project)             | Commands (global)                       |
| ------------- | -------------------------- | -------------------------------------- | ------------------------------ | --------------------------------------- |
| Claude Code   | `.claude/skills/<name>/`   | `~/.claude/skills/<name>/`             | `.claude/commands/<name>.md`   | `~/.claude/commands/<name>.md`          |
| Cursor        | `.cursor/skills/<name>/`   | `~/.cursor/skills/<name>/`             | —                              | —                                       |
| Copilot       | `.github/skills/<name>/`   | `~/.copilot/skills/<name>/`            | —                              | —                                       |
| Gemini CLI    | `.gemini/skills/<name>/`   | `~/.gemini/skills/<name>/`             | —                              | —                                       |
| Windsurf      | `.windsurf/skills/<name>/` | `~/.codeium/windsurf/skills/<name>/`   | —                              | —                                       |
| Trae          | `.trae/skills/<name>/`     | Project-level only                     | —                              | —                                       |
| Factory Droid | `.factory/skills/<name>/`  | `~/.factory/skills/<name>/`            | `.factory/commands/<name>.md`  | `~/.factory/commands/<name>.md`         |
| Letta         | `.skills/<name>/`          | `~/.letta/skills/<name>/`              | —                              | —                                       |
| OpenCode      | `.opencode/skills/<name>/` | `~/.config/opencode/skills/<name>/`    | `.opencode/commands/<name>.md` | `~/.config/opencode/commands/<name>.md` |
| Codex         | `.codex/skills/<name>/`    | `~/.codex/skills/<name>/`              | —                              | —                                       |
| Antigravity   | `.agent/skills/<name>/`    | `~/.gemini/antigravity/skills/<name>/` | —                              | —                                       |
| Amp           | `.agents/skills/<name>/`   | `~/.config/agents/skills/<name>/`      | —                              | —                                       |
| Kilo Code     | `.kilocode/skills/<name>/` | `~/.kilocode/skills/<name>/`           | —                              | —                                       |
| Roo Code      | `.roo/skills/<name>/`      | `~/.roo/skills/<name>/`                | —                              | —                                       |
| Goose         | `.goose/skills/<name>/`    | `~/.config/goose/skills/<name>/`       | —                              | —                                       |
| Qoder         | `.qoder/skills/<name>/`    | `~/.qoder/skills/<name>/`              | —                              | —                                       |
| Qwen Code     | `.qwen/skills/<name>/`     | `~/.qwen/skills/<name>/`                | —                              | —                                       |
| Clawdbot      | `.clawdbot/skills/<name>/` | `~/.clawdbot/skills/<name>/`            | —                              | —                                       |
| Kiro          | `.kiro/skills/<name>/`     | `~/.kiro/skills/<name>/`                | —                              | —                                       |
| OpenHands     | `.openhands/skills/<name>/`| `~/.openhands/skills/<name>/`           | —                              | —                                       |
| Zencoder      | `.zencoder/skills/<name>/` | `~/.zencoder/skills/<name>/`            | —                              | —                                       |
| Neovate       | `.neovate/skills/<name>/`  | `~/.neovate/skills/<name>/`             | —                              | —                                       |
| CommandCode   | `.commandcode/skills/<name>/` | `~/.commandcode/skills/<name>/`       | —                              | —                                       |
| Pi            | `.pi/skills/<name>/`       | `~/.pi/agent/skills/<name>/`            | —                              | —                                       |
| CodeBuddy     | `.codebuddy/skills/<name>/` | `~/.codebuddy/skills/<name>/`          | —                              | —                                       |

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

MIT © [flins](https://github.com/flinstech)
