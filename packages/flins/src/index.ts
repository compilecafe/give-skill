#!/usr/bin/env node

import { program } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { getSupportedAgentSummary } from "@/agents";
import { handleAddCommand, type AddOptions } from "@/commands/add";
import { handleListCommand } from "@/commands/list";
import { handleRemoveCommand, type RemoveOptions } from "@/commands/remove";
import { handleSearchCommand } from "@/commands/search";
import { handleCleanCommand, handleOutdatedCommand, handleUpdateCommand } from "@/commands/update";
import { flushTelemetry } from "@/telemetry";

const logo = `
███████╗██╗     ██╗███╗  ██╗ ██████╗
██╔════╝██║     ██║████╗ ██║██╔════╝
█████╗  ██║     ██║██╔██╗██║╚█████╗
██╔══╝  ██║     ██║██║╚████║ ╚═══██╗
██║     ███████╗██║██║ ╚███║██████╔╝
╚═╝     ╚══════╝╚═╝╚═╝  ╚══╝╚═════╝
`;

process.on("exit", flushTelemetry);
process.on("SIGINT", () => {
  flushTelemetry();
  process.exit(0);
});

program
  .name("flins")
  .description(
    `Universal skill package manager for AI coding agents. Install, manage, and update custom skills across ${getSupportedAgentSummary()} AI development tools from one CLI.`,
  )
  .version(packageJson.version)
  .addHelpText("beforeAll", logo)
  .showHelpAfterError()
  .showSuggestionAfterError()
  .action(() => {
    program.help();
  });

program
  .command("add <source>")
  .alias("a")
  .alias("install")
  .alias("i")
  .description("Install skills from a source. Local installation is the default.")
  .option("-g, --global", "Install globally into user-level folders")
  .option("-a, --agent <agents...>", "Target specific agents")
  .option("-s, --skill <skills...>", "Install specific skills or commands by name")
  .option("-l, --list", "List available installables in the source without installing")
  .option("-y, --yes", "Auto-confirm prompts")
  .option("-f, --force", "Skip confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .option("--no-symlink", "Copy files directly instead of using symlinks")
  .action(async (source: string, options: AddOptions) => {
    await handleAddCommand(source, options);
  });

program
  .command("update [skills...]")
  .alias("u")
  .description("Update installed skills and commands to their latest versions")
  .option("-y, --yes", "Auto-confirm prompts")
  .option("-f, --force", "Skip confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .action(
    async (skills: string[], options: { yes?: boolean; force?: boolean; silent?: boolean }) => {
      await handleUpdateCommand(skills, options);
    },
  );

program
  .command("outdated [skills...]")
  .alias("o")
  .alias("status")
  .description("Check installation status, updates, and missing files")
  .option("-v, --verbose", "Show detailed installation paths")
  .option("--silent", "Suppress banner and non-error output")
  .action(async (skills: string[], options: { verbose?: boolean; silent?: boolean }) => {
    await handleOutdatedCommand(skills, options);
  });

program
  .command("remove [skills...]")
  .alias("r")
  .alias("rm")
  .alias("uninstall")
  .description("Remove installed skills and commands")
  .option("-y, --yes", "Auto-confirm prompts")
  .option("-f, --force", "Skip confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .action(async (skills: string[], options: RemoveOptions) => {
    await handleRemoveCommand(skills, options);
  });

program
  .command("list")
  .alias("l")
  .description("List installed skills and commands")
  .action(async () => {
    await handleListCommand();
  });

program
  .command("search")
  .alias("s")
  .description("Browse the flins directory and install from it")
  .action(async () => {
    await handleSearchCommand();
  });

program
  .command("clean")
  .alias("c")
  .description("Remove orphaned entries from skills.lock")
  .option("-y, --yes", "Auto-confirm prompts")
  .option("-f, --force", "Skip confirmations")
  .option("--silent", "Suppress banner and non-error output")
  .action(async (options: { yes?: boolean; force?: boolean; silent?: boolean }) => {
    await handleCleanCommand(options);
  });

program.parse();
