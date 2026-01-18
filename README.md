<div align="center">

# sena

**Universal skill package manager for AI coding agents**

Install, manage, and update skills across 15+ AI development tools from a single unified interface.

[![npm version](https://badge.fury.io/js/sena.svg)](https://www.npmjs.org/package/sena)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-standard-blue)](https://agentskills.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

> **Note:** sena is actively evolving alongside the [Agent Skills](https://agentskills.io) format and the AI agent ecosystem. Your feedback helps shape future releases.

## Overview

**sena** is an open-source CLI that provides a unified interface for managing agent skills across all skill-compatible coding assistants. Inspired by package managers like `pnpm`, sena follows a familiar command pattern while working seamlessly with the [Agent Skills](https://agentskills.io) open standard.

## Supported Agents

All agents support the Agent Skills open standard:

| Agent                                                         | Status | Notes                          |
| ------------------------------------------------------------- | ------ | ------------------------------ |
| ![Claude Code](https://img.shields.io/badge/Claude_Code-blue) | ✅     | Full support                   |
| ![Cursor](https://img.shields.io/badge/Cursor-green)          | ✅     | Full support                   |
| ![GitHub Copilot](https://img.shields.io/badge/Copilot-black) | ✅     | Full support                   |
| ![Gemini CLI](https://img.shields.io/badge/Gemini-blue)       | ✅     | Full support                   |
| ![Windsurf](https://img.shields.io/badge/Windsurf-cyan)       | ✅     | Full support                   |
| ![Trae](https://img.shields.io/badge/Trae-purple)             | ✅     | Project-level only (SOLO mode) |
| ![Factory Droid](https://img.shields.io/badge/Factory-orange) | ✅     | Full support                   |
| ![Letta](https://img.shields.io/badge/Letta-teal)             | ✅     | Full support                   |
| ![OpenCode](https://img.shields.io/badge/OpenCode-indigo)     | ✅     | Full support                   |
| ![Codex](https://img.shields.io/badge/Codex-green)            | ✅     | Full support                   |
| ![Antigravity](https://img.shields.io/badge/Antigravity-red)  | ✅     | Full support                   |
| ![Amp](https://img.shields.io/badge/Amp-yellow)               | ✅     | Full support                   |
| ![Kilo Code](https://img.shields.io/badge/Kilo_Code-blue)     | ✅     | Full support                   |
| ![Roo Code](https://img.shields.io/badge/Roo_Code-orange)     | ✅     | Full support                   |
| ![Goose](https://img.shields.io/badge/Goose-gray)             | ✅     | Full support                   |
| ![Qoder](https://img.shields.io/badge/Qoder-pink)             | ✅     | Full support                   |

Missing an agent? [Create an issue](https://github.com/compilecafe/sena/issues)

## Installation

```bash
# Using npx (recommended)
npx sena add <source>

# Using bunx
bunx sena add <source>

# Install globally
npm install -g sena
sena add <source>
```

## Quick Start

### Install from Directory

```bash
# Install a skill by name from the sena directory
sena add better-auth

# Install to specific agent
sena add expo -a claude-code

# Install globally (available across all projects)
sena add expo --global
```

### Search & Browse

```bash
sena search
```

Interactive skill browser with filtering, details view, and one-click install.

### Install from Git

```bash
# GitHub shorthand
sena add expo/skills

# Full URL
sena add https://github.com/expo/skills

# Specific agent
sena add expo/skills -a copilot

# List skills without installing
sena add expo/skills --list
```

## Commands

### `sena add <source>` | `sena a <source>`

Install skills from a git repository.

```bash
sena add <source> [options]

Options:
  -g, --global              Install globally (user-level)
  -a, --agent <agents...>   Target specific agents
  -s, --skill <skills...>   Install specific skills by name
  -l, --list                List available skills without installing
  -y, --yes                 Auto-confirm all prompts
  -f, --force               Skip all confirmations
  --silent                  Suppress banner and non-error output
```

### `sena outdated [skills...]`

Check for available updates.

```bash
sena outdated [skills...] [options]

Options:
  -v, --verbose             Show detailed information
```

**Status indicators:**

| Icon | Status           | Description                          |
| ---- | ---------------- | ------------------------------------ |
| `✓`  | latest           | Up to date                           |
| `↓`  | update-available | New version available                |
| `✗`  | error            | Failed to check (network/repo issue) |
| `○`  | orphaned         | No valid installations               |

### `sena update [skills...]`

Update installed skills.

```bash
sena update [skills...] [options]

Options:
  -y, --yes                 Auto-confirm all prompts
  -f, --force               Skip all confirmations
  --silent                  Suppress banner and output
```

### `sena remove [skills...]`

Uninstall skills.

```bash
sena remove [skills...] [options]

Options:
  -y, --yes                 Auto-confirm all prompts
  -f, --force               Skip all confirmations
  --silent                  Suppress banner and output
```

### `sena list`

List all installed skills.

```bash
sena list
```

### `sena search`

Browse available skills interactively.

```bash
sena search
```

### `sena clean`

Remove orphaned state entries.

```bash
sena clean [options]

Options:
  -y, --yes                 Auto-confirm prompts
  -f, --force               Skip confirmations
  --silent                  Suppress output
```

## Examples

### Install specific skills

```bash
sena add expo/skills -s pr-reviewer -s test-generator
```

### Target multiple agents

```bash
sena add expo/skills -a claude-code -a copilot -a cursor
```

### Install from specific branch

```bash
# Branch is saved for future updates
sena add https://github.com/org/repo/tree/develop
```

### CI/CD automation

```bash
# Non-interactive, global installation
sena add expo/skills -s pr-reviewer -g -a copilot -f
```

## Where Skills Go

| Agent         | Project Level              | Global Level (`--global`)              |
| ------------- | -------------------------- | -------------------------------------- |
| Claude Code   | `.claude/skills/<name>/`   | `~/.claude/skills/<name>/`             |
| Cursor        | `.cursor/skills/<name>/`   | `~/.cursor/skills/<name>/`             |
| Copilot       | `.github/skills/<name>/`   | `~/.copilot/skills/<name>/`            |
| Gemini CLI    | `.gemini/skills/<name>/`   | `~/.gemini/skills/<name>/`             |
| Windsurf      | `.windsurf/skills/<name>/` | `~/.codeium/windsurf/skills/<name>/`   |
| Trae          | `.trae/skills/<name>/`     | Project-level only                     |
| Factory Droid | `.factory/skills/<name>/`  | `~/.factory/skills/<name>/`            |
| Letta         | `.skills/<name>/`          | `~/.letta/skills/<name>/`              |
| OpenCode      | `.opencode/skill/<name>/`  | `~/.config/opencode/skill/<name>/`     |
| Codex         | `.codex/skills/<name>/`    | `~/.codex/skills/<name>/`              |
| Antigravity   | `.agent/skills/<name>/`    | `~/.gemini/antigravity/skills/<name>/` |
| Amp           | `.agents/skills/<name>/`   | `~/.config/agents/skills/<name>/`      |
| Kilo Code     | `.kilocode/skills/<name>/` | `~/.kilocode/skills/<name>/`           |
| Roo Code      | `.roo/skills/<name>/`      | `~/.roo/skills/<name>/`                |
| Goose         | `.goose/skills/<name>/`    | `~/.config/goose/skills/<name>/`       |
| Qoder         | `.qoder/skills/<name>/`    | `~/.qoder/skills/<name>/`              |

## Creating Skills

Skills follow the [Agent Skills](https://agentskills.io) open standard. A skill is a folder with a `SKILL.md` file:

```markdown
---

name: pr-reviewer
description: Reviews pull requests against team guidelines
tags: [code-review, pr, quality]

# PR Reviewer

Reviews pull requests for:

- Code style consistency
- Security vulnerabilities
- Performance issues

## Usage

Activate when reviewing a pull request.
```

### Skill Discovery Locations

The CLI automatically searches:

**Common locations:**

- `SKILL.md` (root)
- `skills/`
- `skills/.curated/`
- `skills/.experimental/`
- `skills/.system/`

**Agent-specific:**

- `.claude/skills/`
- `.cursor/skills/`
- `.github/skills/`
- `.gemini/skills/`
- `.windsurf/skills/`
- `.trae/skills/`
- `.factory/skills/`
- `.skills/` (Letta)
- `.opencode/skill/`
- `.codex/skills/`
- `.agent/skills/`
- `.agents/skills/`
- `.kilocode/skills/`
- `.roo/skills/`
- `.goose/skills/`
- `.qoder/skills/`

For complete guidance, see [agentskills.io](https://agentskills.io).

## State Management

sena tracks installed skills for version control:

| Type       | Location             | Purpose                          |
| ---------- | -------------------- | -------------------------------- |
| **Local**  | `skills.lock`        | Project-specific (commit to git) |
| **Global** | `~/.sena/state.json` | Machine-wide installations       |

```json
{
  "version": "1.0.0",
  "skills": {
    "pr-reviewer": {
      "url": "https://github.com/expo/skills.git",
      "branch": "main",
      "commit": "abc123...",
      "installations": [...]
    }
  }
}
```

Commit `skills.lock` for team consistency. New contributors run `sena update` to sync.

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Source    │────▶│    sena     │────▶│  Agent Folders   │
│  (git repo) │     │   (CLI)     │     │  (installed)     │
└─────────────┘     └─────────────┘     └──────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Auto-detect  │
                   │   agents     │
                   └──────────────┘
```

1. **Clone** source repository (branch/subpath support)
2. **Discover** all `SKILL.md` files
3. **Detect** installed agents automatically
4. **Install** to agent-specific directories
5. **Track** state for updates and management

## Troubleshooting

### No skills found

Ensure `SKILL.md` follows the format:

```markdown
---
name: my-skill
description: What it does
---
```

### Permission denied

Check write permissions for target directory.

### Agent not detected

Agents are detected by checking default directories. Manually specify with `-a` if needed.

## Source Formats

sena supports multiple source formats for installing skills:

```bash
# Directory name (looks up in sena directory)
sena add better-auth

# GitHub shorthand
sena add expo/skills

# Full GitHub URL
sena add https://github.com/expo/skills

# Specific branch
sena add https://github.com/expo/skills/tree/develop

# Branch with subpath
sena add https://github.com/expo/skills/tree/develop/skills/custom

# GitLab or any git host
sena add https://gitlab.com/org/repo
sena add https://example.com/repo.git
```

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT © [sena](https://github.com/senahq)
