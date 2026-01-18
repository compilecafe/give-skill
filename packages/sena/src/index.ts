#!/usr/bin/env node

import { program } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { installCommand, type InstallOptions } from "@/cli/commands/install";
import { updateCommand, type UpdateOptions } from "@/cli/commands/update";
import { statusCommand, type StatusOptions } from "@/cli/commands/status";
import { removeCommand, type RemoveOptions } from "@/cli/commands/remove";
import { listCommand } from "@/cli/commands/list";
import { cleanCommand } from "@/cli/commands/clean";

const version = packageJson.version;

program
  .name("sena")
  .description(
    "Install skills onto coding agents (Claude Code, Cursor, Copilot, Gemini, Windsurf, Trae, Factory, Letta, OpenCode, Codex, Antigravity, Amp, Kilo, Roo, Goose)",
  )
  .version(version)
  .argument("<source>", "Git repo URL, GitHub shorthand (owner/repo), or direct path to skill")
  .option("-g, --global", "Install skill globally (user-level) instead of project-level")
  .option(
    "-a, --agent <agents...>",
    "Specify agents to install to (windsurf, gemini, claude-code, cursor, copilot, etc.)",
  )
  .option("-s, --skill <skills...>", "Specify skill names to install (skip selection prompt)")
  .option("-l, --list", "List available skills in the repository without installing")
  .option("-y, --yes", "Skip confirmation prompts")
  .action(async (source: string, options: InstallOptions) => {
    await installCommand(source, options);
  });

program
  .command("update [skills...]")
  .description("Update installed skills to their latest versions")
  .option("-y, --yes", "Skip confirmation prompts")
  .action(async (skills: string[], options: UpdateOptions) => {
    await updateCommand(skills, options);
  });

program
  .command("status [skills...]")
  .description("Check status of installed skills (updates available, orphaned, etc.)")
  .option("-v, --verbose", "Show detailed information including installation paths")
  .action(async (skills: string[], options: StatusOptions) => {
    await statusCommand(skills, options);
  });

program
  .command("remove [skills...]")
  .description("Remove installed skills")
  .option("-y, --yes", "Skip confirmation prompts")
  .action(async (skills: string[], options: RemoveOptions) => {
    await removeCommand(skills, options);
  });

program
  .command("list")
  .description("List all installed skills")
  .action(async () => {
    await listCommand();
  });

program
  .command("clean")
  .description("Remove orphaned skill entries from state")
  .action(async () => {
    await cleanCommand();
  });

program.parse();
