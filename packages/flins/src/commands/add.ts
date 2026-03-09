import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  agents,
  detectInstalledAgents,
  formatAgentPath,
  getAgentNames,
  getCommandAgents,
  getNonUniversalAgents,
  getSharedDirectoryNotes,
  getUniversalAgents,
  normalizeAgentNames,
  supportsCommands,
  type AgentConfig,
  type AgentName,
  type AgentScope,
} from "@/agents";
import { discoverInstallables, type Installable } from "@/discovery";
import { installInstallable } from "@/installations";
import { showIntro, showOutro, plural, getError } from "@/output";
import {
  cleanupSource,
  downloadSource,
  isDirectoryName,
  listDirectory,
  listWellKnownSource,
  resolveDirectorySource,
} from "@/sources";
import { trackInstall } from "@/state";
import { trackTelemetry } from "@/telemetry";

export interface AddOptions {
  global?: boolean;
  agent?: string[];
  skill?: string[];
  list?: boolean;
  yes?: boolean;
  force?: boolean;
  silent?: boolean;
  symlink?: boolean;
}

interface InstallResult {
  name: string;
  type: Installable["type"];
  label: string;
  agent: string;
  success: boolean;
  error?: string;
}

function isAutoConfirm(options: AddOptions) {
  return Boolean(options.yes || options.force);
}

async function resolveSourceInput(sourceInput: string, silent: boolean) {
  if (!isDirectoryName(sourceInput)) {
    return sourceInput;
  }

  if (!silent) {
    p.log.info(`Looking up ${pc.cyan(sourceInput)} in the flins directory...`);
  }

  const source = await resolveDirectorySource(sourceInput);
  if (source) {
    return source;
  }

  p.log.error(`Skill ${pc.cyan(sourceInput)} was not found in the flins directory.`);
  const entries = await listDirectory();
  if (entries.length > 0) {
    p.log.info("Available skills:");
    for (const entry of entries) {
      p.log.message(`  ${pc.cyan(entry.name)} ${pc.dim(`- ${entry.description}`)}`);
    }
  }

  process.exit(1);
}

function printInstallables(title: string, installables: Installable[]) {
  p.log.step(pc.bold(title));
  for (const installable of installables) {
    p.log.message(`  ${pc.cyan(`${installable.type}:${installable.name}`)}`);
    p.log.message(`    ${pc.dim(installable.description)}`);
  }
}

async function selectInstallables(installables: Installable[], options: AddOptions) {
  if (options.skill && options.skill.length > 0) {
    const selected = installables.filter((installable) =>
      options.skill!.some((name) => installable.name.toLowerCase() === name.toLowerCase()),
    );

    if (selected.length === 0) {
      p.log.error(`No matching installables found for: ${options.skill.join(", ")}`);
      printInstallables("Available Installables", installables);
      return null;
    }

    return selected;
  }

  if (isAutoConfirm(options)) {
    return installables;
  }

  const lookup = new Map(
    installables.map((installable) => [
      `${installable.type}:${installable.name.toLowerCase()}`,
      installable,
    ]),
  );
  const selected = await p.multiselect<string>({
    message: "Choose items to add",
    required: false,
    initialValues:
      installables.length === 1
        ? [`${installables[0]!.type}:${installables[0]!.name.toLowerCase()}`]
        : undefined,
    options: installables.map((installable) => ({
      value: `${installable.type}:${installable.name.toLowerCase()}`,
      label: `${installable.type === "skill" ? "Skill" : "Command"}: ${installable.name}`,
      hint:
        installable.description.length > 70
          ? `${installable.description.slice(0, 67)}...`
          : installable.description,
    })),
  });

  if (p.isCancel(selected)) {
    p.cancel("Installation cancelled");
    return null;
  }

  return (selected as string[]).map((value) => lookup.get(value)).filter(Boolean) as Installable[];
}

async function selectSkillTargets(
  scope: AgentScope,
  options: AddOptions,
): Promise<AgentName[] | null> {
  if (options.agent && options.agent.length > 0) {
    const parsed = normalizeAgentNames(options.agent);
    if (parsed.invalid.length > 0) {
      p.log.error(`Invalid agents: ${parsed.invalid.join(", ")}`);
      p.log.info(`Supported agents: ${getAgentNames().join(", ")}`);
      return null;
    }

    if (scope === "project") {
      const universal = parsed.agents.some(
        (agent) => agent === "universal" || getUniversalAgents().includes(agent),
      );
      const targets = universal
        ? ([
            "universal",
            ...getNonUniversalAgents().filter((agent) => parsed.agents.includes(agent)),
          ] as AgentName[])
        : getNonUniversalAgents().filter((agent) => parsed.agents.includes(agent));
      const explicitUniversal = parsed.agents.filter(
        (agent) => agent !== "universal" && getUniversalAgents().includes(agent),
      );

      if (explicitUniversal.length > 0) {
        p.log.info(
          `Local installs for ${explicitUniversal.map((agent) => pc.cyan(agents[agent].label)).join(", ")} use ${pc.cyan("universal")} (${pc.cyan(".agents/skills")}).`,
        );
      }

      return targets;
    }

    return parsed.agents;
  }

  const installedAgents = detectInstalledAgents();

  if (scope === "project") {
    p.note(
      `${pc.cyan(".agents/skills")} is always included locally.\nUsed by: ${getUniversalAgents()
        .map((agent) => agents[agent].label)
        .join(", ")}`,
      "Universal Folder",
    );

    if (isAutoConfirm(options)) {
      return ["universal"];
    }

    const selected = await p.multiselect<string>({
      message: "Add skills to extra local agent folders?",
      required: false,
      options: getNonUniversalAgents().map((agent) => ({
        value: agent,
        label: agents[agent].label,
        hint: installedAgents.includes(agent)
          ? `installed • ${formatAgentPath(agents[agent].skillsDir)}`
          : formatAgentPath(agents[agent].skillsDir),
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel("Installation cancelled");
      return null;
    }

    return ["universal", ...(selected as string[] as AgentName[])];
  }

  if (isAutoConfirm(options)) {
    if (installedAgents.length === 0) {
      p.log.info("No installed agents detected. Use --agent to target a global folder.");
      return null;
    }

    return installedAgents;
  }

  p.note(
    "Global installs write to user-level folders. The shared local .agents/skills folder does not apply with --global.",
    "Global Install",
  );

  const selected = await p.multiselect<string>({
    message: "Choose global skill targets",
    required: true,
    initialValues: installedAgents,
    options: Object.keys(agents).map((name) => {
      const agent = name as AgentName;
      return {
        value: agent,
        label: agents[agent].label,
        hint: installedAgents.includes(agent)
          ? `installed • ${formatAgentPath(agents[agent].globalSkillsDir)}`
          : formatAgentPath(agents[agent].globalSkillsDir),
      };
    }),
  });

  if (p.isCancel(selected)) {
    p.cancel("Installation cancelled");
    return null;
  }

  return selected as string[] as AgentName[];
}

async function selectCommandTargets(options: AddOptions): Promise<AgentName[] | null> {
  const commandAgents = getCommandAgents();

  if (options.agent && options.agent.length > 0) {
    const parsed = normalizeAgentNames(options.agent);
    if (parsed.invalid.length > 0) {
      p.log.error(`Invalid agents: ${parsed.invalid.join(", ")}`);
      p.log.info(`Supported agents: ${getAgentNames().join(", ")}`);
      return null;
    }

    const supported = parsed.agents.filter((agent) => supportsCommands(agent));
    const ignored = parsed.agents.filter((agent) => !supportsCommands(agent));

    if (ignored.length > 0) {
      p.log.warn(
        `Ignoring agents without command folders: ${ignored.map((agent) => agents[agent].label).join(", ")}`,
      );
    }

    if (supported.length === 0) {
      p.log.error(
        `Commands are supported by ${commandAgents.map((agent) => agents[agent].label).join(", ")}.`,
      );
      return null;
    }

    return supported;
  }

  const installedAgents = detectInstalledAgents().filter((agent) => supportsCommands(agent));

  if (isAutoConfirm(options)) {
    if (installedAgents.length === 0) {
      p.log.warn(
        `No command-capable agents detected. Commands will be skipped. Use --agent with ${commandAgents.join(", ")} to install them.`,
      );
    }

    return installedAgents;
  }

  const selected = await p.multiselect<string>({
    message: "Choose command targets",
    required: true,
    initialValues: installedAgents,
    options: commandAgents.map((agent) => {
      const config: AgentConfig = agents[agent];
      return {
        value: agent,
        label: agents[agent].label,
        hint:
          formatAgentPath(config.commandsDir || "") +
          (installedAgents.includes(agent) ? " • installed" : ""),
      };
    }),
  });

  if (p.isCancel(selected)) {
    p.cancel("Installation cancelled");
    return null;
  }

  return selected as string[] as AgentName[];
}

async function confirmInstall(
  sourceLabel: string,
  scope: AgentScope,
  installables: Installable[],
  skillTargets: AgentName[] | null,
  commandTargets: AgentName[] | null,
  options: AddOptions,
) {
  p.log.step(pc.bold("Install Summary"));
  p.log.message(`${pc.bold("Source:")} ${sourceLabel}`);
  p.log.message(`${pc.bold("Scope:")} ${scope === "global" ? "Global" : "Local"}`);
  p.log.message(
    `${pc.bold("Items:")} ${installables.map((item) => `${item.type}:${item.name}`).join(", ")}`,
  );

  const hasSkills = installables.some((item) => item.type === "skill");
  const hasCommands = installables.some((item) => item.type === "command");

  if (hasSkills && skillTargets) {
    if (scope === "project" && skillTargets.includes("universal")) {
      p.log.message(`${pc.bold("Included local folder:")} ${pc.cyan(".agents/skills")}`);
      p.log.message(
        `${pc.bold("Universal agents:")} ${getUniversalAgents()
          .map((agent) => agents[agent].label)
          .join(", ")}`,
      );

      const extraAgents = skillTargets.filter((agent) => agent !== "universal");
      if (extraAgents.length > 0) {
        p.log.message(
          `${pc.bold("Extra local folders:")} ${extraAgents.map((agent) => agents[agent].label).join(", ")}`,
        );
      }
    } else {
      p.log.message(
        `${pc.bold("Skill targets:")} ${skillTargets.map((agent) => agents[agent].label).join(", ")}`,
      );
    }

    const sharedNotes = getSharedDirectoryNotes(skillTargets, scope);
    if (sharedNotes.length > 0) {
      p.log.message(pc.bold("Shared folders:"));
      for (const note of sharedNotes) {
        p.log.message(`  ${pc.dim("•")} ${note}`);
      }
    }
  }

  if (hasCommands) {
    p.log.message(
      `${pc.bold("Command targets:")} ${commandTargets && commandTargets.length > 0 ? commandTargets.map((agent) => agents[agent].label).join(", ") : pc.yellow("none")}`,
    );
  }

  if (isAutoConfirm(options)) {
    return true;
  }

  const confirmed = await p.confirm({ message: "Ready to install?" });
  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Installation cancelled");
    return false;
  }

  return true;
}

export async function handleAddCommand(sourceInput: string, options: AddOptions) {
  showIntro(Boolean(options.silent));

  try {
    const scope = options.global ? "global" : "project";
    const sourceValue = await resolveSourceInput(sourceInput, Boolean(options.silent));

    if (options.list) {
      const wellKnown = await listWellKnownSource(sourceValue);
      if (wellKnown) {
        printInstallables(
          `Available Installables from ${wellKnown.host}`,
          wellKnown.skills.map((skill) => ({
            type: "skill",
            name: skill.name,
            description: skill.description,
            path: skill.name,
          })),
        );
        showOutro(
          `Use ${pc.cyan(`flins add ${wellKnown.host} --skill <name>`)} to install`,
          Boolean(options.silent),
        );
        return;
      }

      const source = await downloadSource(sourceValue);

      try {
        const installables = discoverInstallables(source.root, source.subpath);
        if (installables.length === 0) {
          p.log.warn("No installables found in this source.");
          showOutro(pc.yellow("Nothing to list"), Boolean(options.silent));
          return;
        }

        printInstallables(`Available Installables from ${source.label}`, installables);
        showOutro(`Use ${pc.cyan("--skill <name>")} to skip the picker`, Boolean(options.silent));
      } finally {
        await cleanupSource(source);
      }

      return;
    }

    const source = await downloadSource(sourceValue);
    const results: InstallResult[] = [];

    try {
      const installables = discoverInstallables(source.root, source.subpath);
      if (installables.length === 0) {
        p.log.error(
          "No skills or commands found. The source must contain SKILL.md files or command markdown files.",
        );
        showOutro(pc.red("Installation failed"), Boolean(options.silent));
        process.exit(1);
      }

      if (!options.silent) {
        const skills = installables.filter((item) => item.type === "skill").length;
        const commands = installables.filter((item) => item.type === "command").length;
        p.log.info(
          `Found ${pc.green(skills.toString())} ${plural(skills, "skill")}${commands > 0 ? ` and ${pc.yellow(commands.toString())} ${plural(commands, "command")}` : ""}`,
        );
      }

      const selected = await selectInstallables(installables, options);
      if (!selected || selected.length === 0) {
        p.log.info("Nothing selected.");
        showOutro(pc.yellow("Nothing installed"), Boolean(options.silent));
        return;
      }

      const skillTargets = selected.some((item) => item.type === "skill")
        ? await selectSkillTargets(scope, options)
        : [];
      const commandTargets = selected.some((item) => item.type === "command")
        ? await selectCommandTargets(options)
        : [];

      if (
        (selected.some((item) => item.type === "skill") && !skillTargets) ||
        (selected.some((item) => item.type === "command") && commandTargets === null)
      ) {
        process.exit(1);
      }

      if (
        !(await confirmInstall(
          source.label,
          scope,
          selected,
          skillTargets,
          commandTargets,
          options,
        ))
      ) {
        return;
      }

      const spinner = p.spinner();
      spinner.start("Installing...");

      const symlink = options.symlink ?? true;

      for (const installable of selected) {
        const targets = installable.type === "skill" ? skillTargets || [] : commandTargets || [];
        let installedCount = 0;

        for (const agent of targets) {
          const outcome = installInstallable(installable, agent, scope, { symlink });
          results.push({
            name: installable.name,
            type: installable.type,
            label: `${installable.type}:${installable.name}`,
            agent: agents[agent].label,
            success: outcome.success,
            error: outcome.error,
          });

          if (outcome.success) {
            installedCount += 1;
          }
        }

        if (installedCount > 0) {
          trackInstall({
            name: installable.name,
            type: installable.type,
            scope,
            url: source.url,
            subpath: source.subpath,
            branch: source.branch,
            commit: source.commit,
          });
        }
      }

      spinner.stop("Install complete");

      const installed = results.filter((result) => result.success).length;
      const failed = results.filter((result) => !result.success).length;

      if (installed > 0) {
        p.log.success(pc.green(`Installed ${installed} ${plural(installed, "item")}.`));
      }

      if (failed > 0) {
        p.log.error(pc.red(`Failed to install ${failed} ${plural(failed, "item")}.`));
        for (const result of results.filter((result) => !result.success)) {
          p.log.message(`  ${pc.red("✗")} ${result.label} ${pc.dim(`→ ${result.agent}`)}`);
          if (result.error) {
            p.log.message(`    ${pc.dim(result.error)}`);
          }
        }
      }

      if (selected.some((item) => item.type === "command") && (commandTargets || []).length === 0) {
        p.log.warn("Commands were selected but no command-capable agents were targeted.");
      }

      for (const result of results) {
        trackTelemetry({
          command: "add",
          type: result.type,
          repo: sourceValue,
          sourceUrl: source.url,
          name: result.name,
          agent: result.agent,
          scope,
          success: result.success,
        });
      }

      if (failed > 0) {
        showOutro(pc.red("Installation finished with errors"), Boolean(options.silent));
        process.exit(1);
      }

      showOutro(
        installed > 0 ? pc.green("Done! Skills ready to use.") : pc.yellow("Nothing installed"),
        Boolean(options.silent),
      );
    } finally {
      await cleanupSource(source);
    }
  } catch (error) {
    p.log.error(getError(error, "Something went wrong. Try again or check your connection."));
    showOutro(pc.red("Installation failed"), Boolean(options.silent));
    process.exit(1);
  }
}
