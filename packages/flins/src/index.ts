#!/usr/bin/env node

import { program } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { installCommand, type InstallOptions } from "@/cli/commands/install";
import { updateCommand, type UpdateOptions } from "@/cli/commands/update";
import { outdatedCommand, type OutdatedOptions } from "@/cli/commands/outdated";
import { removeCommand, type RemoveOptions } from "@/cli/commands/remove";
import { listCommand } from "@/cli/commands/list";
import { searchCommand } from "@/cli/commands/search";
import { cleanCommand, type CleanOptions } from "@/cli/commands/clean";
import { checkForUpdates } from "@/services/update-notifier";
import { track, flushSync } from "@/services/telemetry";

let isSilent = false;

program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.silent) isSilent = true;
});

program.hook("postAction", (thisCommand) => {
  const name = thisCommand.name();
  if (name && name !== "help") track(name);
});

process.on("exit", flushSync);
process.on("SIGINT", () => {
  flushSync();
  process.exit(0);
});

const version = packageJson.version;

const logo = `
███████╗██╗     ██╗███╗  ██╗ ██████╗
██╔════╝██║     ██║████╗ ██║██╔════╝
█████╗  ██║     ██║██╔██╗██║╚█████╗ 
██╔══╝  ██║     ██║██║╚████║ ╚═══██╗
██║     ███████╗██║██║ ╚███║██████╔╝
╚═╝     ╚══════╝╚═╝╚═╝  ╚══╝╚═════╝ 
`;

program
  .name("flins")
  .description(
    "Universal skill package manager for AI coding agents. Install, manage, and update custom skills across Claude Code, Cursor, Copilot, Gemini, Windsurf, Trae, Factory, Letta, OpenCode, Codex, Qwen, and 8+ more AI development tools from a single unified interface.",
  )
  .version(version)
  .addHelpText("beforeAll", logo)
  .action(() => {
    program.help();
  });

program
  .command("add <source>", { isDefault: false })
  .description("Install skills from git repository")
  .alias("a")
  .alias("install")
  .alias("i")
  .option("-g, --global", "Install skill globally (user-level) instead of project-level")
  .option(
    "-a, --agent <agents...>",
    "Specify target agents (auto-detects if omitted). Supports: claude-code, cursor, copilot, gemini, windsurf, trae, factory, letta, opencode, codex, antigravity, amp, kilo, roo, goose, qoder, qwen",
  )
  .option("-s, --skill <skills...>", "Install specific skills by name (skip interactive selection)")
  .option("-l, --list", "List all available skills in the source repository without installing")
  .option("-y, --yes", "Auto-confirm all prompts (non-interactive mode)")
  .option("-f, --force", "Skip all confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .option("--no-symlink", "Copy files directly instead of using symlinks (default: symlink)")
  .addHelpText("beforeAll", logo)
  .action(async (source: string, options: InstallOptions) => {
    await installCommand(source, options);
  });

program
  .command("update [skills...]")
  .alias("u")
  .description("Update installed skills to their latest versions from git sources")
  .option("-y, --yes", "Auto-confirm all prompts (non-interactive mode)")
  .option("-f, --force", "Skip all confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .addHelpText("beforeAll", logo)
  .action(async (skills: string[], options: UpdateOptions) => {
    await updateCommand(skills, options);
  });

program
  .command("outdated [skills...]")
  .alias("o")
  .alias("status")
  .description("Check installation status, available updates, and orphaned skills")
  .option("-v, --verbose", "Show detailed information including installation paths")
  .addHelpText("beforeAll", logo)
  .action(async (skills: string[], options: OutdatedOptions) => {
    await outdatedCommand(skills, options);
  });

program
  .command("remove [skills...]")
  .alias("r")
  .alias("rm")
  .alias("uninstall")
  .description("Uninstall skills from your AI coding agents")
  .option("-y, --yes", "Auto-confirm all prompts (non-interactive mode)")
  .option("-f, --force", "Skip all confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .addHelpText("beforeAll", logo)
  .action(async (skills: string[], options: RemoveOptions) => {
    await removeCommand(skills, options);
  });

program
  .command("list")
  .alias("l")
  .description("List all installed skills across your AI coding agents")
  .addHelpText("beforeAll", logo)
  .action(async () => {
    await listCommand();
  });

program
  .command("search")
  .alias("s")
  .description("Browse and discover available skills from the flins directory")
  .addHelpText("beforeAll", logo)
  .action(async () => {
    await searchCommand();
  });

program
  .command("clean")
  .alias("c")
  .description("Remove orphaned skill entries from state tracking")
  .addHelpText("beforeAll", logo)
  .option("-y, --yes", "Auto-confirm all prompts (non-interactive mode)")
  .option("-f, --force", "Skip all confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .action(async (options: CleanOptions) => {
    await cleanCommand(options);
  });

program.parse();

checkForUpdates(isSilent);
