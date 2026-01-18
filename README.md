<div align="center">

# sena

**Open-source universal skill installer for coding AI agents**

One CLI to install skills from any git repository across all your coding assistants.

[![npm version](https://badge.fury.io/js/sena.svg)](https://www.npmjs.org/package/sena)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-standard-blue)](https://agentskills.io)

</div>

## Why sena?

The [Agent Skills](https://agentskills.io) format is an open standard for extending AI agents with new capabilities. **sena** is an open-source CLI that lets you install skills from any git repository to all your skill-compatible coding agents in one command.

### Supported Agents

All agents support the [Agent Skills](https://agentskills.io) open standard:

| Agent                                                 | Status |
| ----------------------------------------------------- | ------ |
| [Claude Code](https://claude.com/product/claude-code) | ✅     |
| [Cursor](https://cursor.sh)                           | ✅     |
| [GitHub Copilot](https://github.com/features/copilot) | ✅     |
| [Gemini CLI](https://geminicli.com)                   | ✅     |
| [Windsurf](https://windsurf.com)                      | ✅     |
| [Trae](https://trae.ai)                               | ✅¹    |
| [Factory Droid](https://factory.ai)                   | ✅     |
| [Letta](https://www.letta.com)                        | ✅     |
| [OpenCode](https://opencode.ai)                       | ✅     |
| [Codex](https://openai.com/codex)                     | ✅     |
| [Antigravity](https://antigravity.google)             | ✅     |
| [Amp](http://ampcode.com)                             | ✅     |
| [Kilo Code](https://kilocode.ai)                      | ✅     |
| [Roo Code](https://roocode.com)                       | ✅     |
| [Goose](https://block.github.io/goose)                | ✅     |
| [Qoder](https://qoder.com)                            | ✅     |

¹ Trae only supports project-level installation (SOLO mode). Global installation is not available.

Missing an agent? [Create an issue](https://github.com/compilecafe/sena/issues)

## Installation

```bash
# Using npx
npx sena <name>

# Using bunx
bunx sena <name>

# Or install globally
npm install -g sena
sena <name>
```

## Quick Start

### Install from Directory

Install skills by name from the sena directory:

```bash
# Install a skill by directory name
npx sena better-auth

# Install with specific agent
npx sena expo -a claude-code

# Install globally
npx sena expo --global
```

### Search & Browse

Discover and search available skills interactively:

```bash
npx sena search
```

Type to filter skills, select to view details, and install directly.

### Install from Git

```bash
# Install from GitHub (shorthand)
npx sena expo/skills

# Install from full URL
npx sena https://github.com/expo/skills

# Install to specific agent
npx sena expo/skills -a copilot

# Install globally (available across all projects)
npx sena expo/skills --global

# List available skills first
npx sena expo/skills --list
```

## Managing Skills

`sena` tracks installed skills and makes it easy to manage them.

```bash
# List all installed skills
npx sena list

# Check status of all installed skills (compact view)
npx sena status

# Check status with detailed information
npx sena status --verbose

# Check status of specific skills (automatically shows details)
npx sena status pr-reviewer test-generator

# Update all skills with available updates (interactive selection)
npx sena update

# Update specific skills
npx sena update pr-reviewer test-generator

# Update without confirmation (auto-selects all with updates)
npx sena update -y

# Remove specific skills
npx sena remove pr-reviewer

# Remove without confirmation (auto-selects all)
npx sena remove -y

# Interactive removal (shows multiselect of all installed skills)
npx sena remove

# Clean up orphaned entries
npx sena clean
```

### Status Indicators

The `status` command shows one of the following states for each skill:

| Icon | Status             | Description                                                      |
| ---- | ------------------ | ---------------------------------------------------------------- |
| ✓    | `latest`           | Skill is up to date with the remote repository                   |
| ↓    | `update-available` | A newer version is available                                     |
| ✗    | `error`            | Failed to check for updates (network issues, repo deleted, etc.) |
| ○    | `orphaned`         | No valid installations found (folders were manually deleted)     |

## Command Reference

```
sena <source> [options]

Arguments:
  source                  Directory name, git repo URL, GitHub shorthand (owner/repo), or direct path to skill

Options:
  -g, --global            Install skill globally (user-level) instead of project-level
  -a, --agent <...>       Specify agents to install to (windsurf, gemini, claude-code, cursor, copilot, etc.)
  -s, --skill <...>       Specify skill names to install (skip selection prompt)
  -l, --list              List available skills in the repository without installing
  -y, --yes               Skip all prompts (CI-friendly)
  -V, --version           Show version
  -h, --help              Show help

Commands:
  search                  Search sena directory for available skills
  update [skills...]      Update installed skills to their latest versions
  status [skills...]      Check status of installed skills (compact view, use -v for details)
  remove [skills...]      Remove installed skills (use -y to skip confirmation)
  list                    List all installed skills
  clean                   Remove orphaned skill entries from state
```

### Directory Lookup

When you use a simple name as the source (e.g., `better-auth`), `sena` automatically looks it up in the sena directory and fetches the actual repository URL.

```bash
# These are equivalent:
npx sena better-auth
npx sena https://github.com/better-auth/skills
```

## Examples

### Install from specific branch

By default, `sena` uses the repository's default branch. To install from a specific branch, use the full GitHub URL with the branch:

```bash
# Install from develop branch
npx sena https://github.com/org/repo/tree/develop

# Install from develop branch with subpath
npx sena https://github.com/org/repo/tree/develop/skills/custom

# Install from a feature branch
npx sena https://github.com/org/repo/tree/feature/new-skill
```

The branch is saved in the state file, so future updates will continue using the same branch.

### Install specific skills

```bash
npx sena expo/skills -s pr-reviewer -s test-generator
```

### Target multiple agents

```bash
npx sena expo/skills -a claude-code -a copilot -a cursor
```

### CI/CD automation

```bash
npx sena expo/skills -s pr-reviewer -g -a copilot -y
```

## Where Skills Go

| Agent         | Project Level              | Global Level (`--global`)              |
| ------------- | -------------------------- | -------------------------------------- |
| Claude Code   | `.claude/skills/<name>/`   | `~/.claude/skills/<name>/`             |
| Cursor        | `.cursor/skills/<name>/`   | `~/.cursor/skills/<name>/`             |
| Copilot       | `.github/skills/<name>/`   | `~/.copilot/skills/<name>/`            |
| Gemini CLI    | `.gemini/skills/<name>/`   | `~/.gemini/skills/<name>/`             |
| Windsurf      | `.windsurf/skills/<name>/` | `~/.codeium/windsurf/skills/<name>/`   |
| Trae          | `.trae/skills/<name>/`     | Project-level only (SOLO mode)         |
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
---

# PR Reviewer

Reviews pull requests for:

- Code style consistency
- Security vulnerabilities
- Performance issues

## Usage

Activate when reviewing a pull request.
```

For complete skill authoring guidance, see [agentskills.io](https://agentskills.io).

### Skill Locations

The CLI automatically searches these paths in a repository:

**Common locations:**

- `SKILL.md` (root)
- `skills/`
- `skills/.curated/`
- `skills/.experimental/`
- `skills/.system/`

**Agent-specific locations** (auto-detected from agent configs):

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

If a folder matches an agent's skill directory, the CLI will find it.

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Source    │────▶│    sena     │────▶│  Agent Folders   │
│  (git repo) │     │  (open CLI) │     │  (installed)     │
└─────────────┘     └─────────────┘     └──────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Auto-detect  │
                   │   agents     │
                   └──────────────┘
```

1. **Clone** the source repository (supports specific branches and subpaths)
2. **Discover** all `SKILL.md` files in common and agent-specific directories
3. **Detect** installed agents on your system automatically
4. **Install** skills to agent-specific directories
5. **Track** installation state for future updates and management

## State Management

`sena` tracks installed skills for version control and updates:

- **Local**: `skills.lock` in project directory (commit to git for team consistency)
- **Global**: `~/.sena/state.json` for machine-wide installations

```json
{
  "version": "1.0.0",
  "skills": {
    "pr-reviewer": {
      "url": "https://github.com/expo/skills.git",
      "branch": "main",
      "commit": "abc123..."
    }
  }
}
```

Commit `skills.lock` to ensure consistent skill versions across your team. New contributors can run `sena update` to synchronize.

## Troubleshooting

### No skills found

Make sure your `SKILL.md` follows the [Agent Skills](https://agentskills.io) format:

```markdown
---
name: my-skill
description: This describes what the skill does
---
```

### Permission denied

Check you have write permissions for the target directory.

### Agent not detected

The CLI automatically detects installed agents by checking their default directories. To see which agents are detected, run a command and review the agent selection prompt. Manually specify with `-a` if needed.

### Source URL formats

`sena` supports multiple source formats:

```bash
# GitHub shorthand
npx sena expo/skills

# Full GitHub URL
npx sena https://github.com/expo/skills

# Specific branch
npx sena https://github.com/expo/skills/tree/develop

# Specific branch with subpath
npx sena https://github.com/expo/skills/tree/develop/skills/custom

# GitLab
npx sena https://gitlab.com/org/repo

# Any git repository
npx sena https://example.com/repo.git
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Compile Café](https://github.com/compilecafe)
