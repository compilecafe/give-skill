<div align="center">

# give-skill

**Universal skill installer for AI coding agents**

One CLI to install agent skills across all your coding assistants.

[![npm version](https://badge.fury.io/js/give-skill.svg)](https://www.npmjs.org/package/give-skill)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-standard-blue)](https://agentskills.io)

</div>

## Why give-skill?

The [Agent Skills](https://agentskills.io) format is an open standard for extending AI agents with new capabilities. `give-skill` lets you install skills from any git repository to all your skill-compatible agents in one command.

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

> [!NOTE]
> ¹ Trae only supports project-level installation (SOLO mode). Global installation is not available.

Missing an agent? [Create an issue](https://github.com/compilecafe/give-skill/issues)

## Installation

```bash
# Using npx
npx give-skill <repo>

# Using bunx
bunx give-skill <repo>

# Or install globally
npm install -g give-skill
give-skill <repo>
```

## Quick Start

Install skills from any git repository:

```bash
# Install from GitHub (shorthand)
npx give-skill expo/skills

# Install from full URL
npx give-skill https://github.com/expo/skills

# Install to specific agent
npx give-skill expo/skills -a copilot

# Install globally (available across all projects)
npx give-skill expo/skills --global

# List available skills first
npx give-skill expo/skills --list
```

## Managing Skills

`give-skill` tracks installed skills and makes it easy to manage them.

```bash
# List all installed skills
npx give-skill list

# Check status of all installed skills (compact view)
npx give-skill status

# Check status with detailed information
npx give-skill status --verbose

# Check status of specific skills (automatically shows details)
npx give-skill status pr-reviewer test-generator

# Update all skills with available updates (interactive selection)
npx give-skill update

# Update specific skills
npx give-skill update pr-reviewer test-generator

# Update without confirmation (auto-selects all with updates)
npx give-skill update -y

# Remove specific skills
npx give-skill remove pr-reviewer

# Remove without confirmation (auto-selects all)
npx give-skill remove -y

# Interactive removal (shows multiselect of all installed skills)
npx give-skill remove

# Clean up orphaned entries
npx give-skill clean
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
give-skill <source> [options]

Arguments:
  source                  Git repo URL, GitHub shorthand (owner/repo), or direct path to skill

Options:
  -g, --global            Install skill globally (user-level) instead of project-level
  -a, --agent <...>       Specify agents to install to (windsurf, gemini, claude-code, cursor, copilot, etc.)
  -s, --skill <...>       Specify skill names to install (skip selection prompt)
  -l, --list              List available skills in the repository without installing
  -y, --yes               Skip all prompts (CI-friendly)
  -V, --version           Show version
  -h, --help              Show help

Commands:
  update [skills...]      Update installed skills to their latest versions
  status [skills...]      Check status of installed skills (compact view, use -v for details)
  remove [skills...]      Remove installed skills (use -y to skip confirmation)
  list                    List all installed skills
  clean                   Remove orphaned skill entries from state
```

## Examples

### Install from specific branch

By default, `give-skill` uses the repository's default branch. To install from a specific branch, use the full GitHub URL with the branch:

```bash
# Install from develop branch
npx give-skill https://github.com/org/repo/tree/develop

# Install from develop branch with subpath
npx give-skill https://github.com/org/repo/tree/develop/skills/custom

# Install from a feature branch
npx give-skill https://github.com/org/repo/tree/feature/new-skill
```

The branch is saved in the state file, so future updates will continue using the same branch.

### Install specific skills

```bash
npx give-skill expo/skills -s pr-reviewer -s test-generator
```

### Target multiple agents

```bash
npx give-skill expo/skills -a claude-code -a copilot -a cursor
```

### CI/CD automation

```bash
npx give-skill expo/skills -s pr-reviewer -g -a copilot -y
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
│   Source    │────▶│  give-skill │────▶│  Agent Folders   │
│  (git repo) │     │    (CLI)    │     │  (installed)     │
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

`give-skill` tracks installed skills for version control and updates:

- **Local**: `skills.lock` in project directory (commit to git for team consistency)
- **Global**: `~/.give-skill/state.json` for machine-wide installations

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

Commit `skills.lock` to ensure consistent skill versions across your team. New contributors can run `give-skill update` to synchronize.

## Troubleshooting

<details>
  <summary>
    <h4>
      No skills found
    </h4>
  </summary>
  
  Make sure your `SKILL.md` follows the [Agent Skills](https://agentskills.io) format:
  
  ```markdown
  ---
  name: my-skill
  description: This describes what the skill does
  ---
  ```
</details>

<details>
  <summary>
    <h4>
      Permission denied
    </h4>
  </summary>
  
  Check you have write permissions for the target directory.
</details>

<details>
  <summary>
    <h4>
      Agent not detected
    </h4>
  </summary>
  
  The CLI automatically detects installed agents by checking their default directories. To see which agents are detected, run a command and review the agent selection prompt. Manually specify with `-a` if needed.
</details>

<details>
  <summary>
    <h4>
      Source URL formats
    </h4>
  </summary>
  
  `give-skill` supports multiple source formats:
  
  ```bash
  # GitHub shorthand
  npx give-skill expo/skills
  
  # Full GitHub URL
  npx give-skill https://github.com/expo/skills
  
  # Specific branch
  npx give-skill https://github.com/expo/skills/tree/develop
  
  # Specific branch with subpath
  npx give-skill https://github.com/expo/skills/tree/develop/skills/custom
  
  # GitLab
  npx give-skill https://gitlab.com/org/repo
  
  # Any git repository
  npx give-skill https://example.com/repo.git
  ```
</details>

## License

MIT © [Compile Café](https://github.com/compilecafe)
