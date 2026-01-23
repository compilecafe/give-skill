import * as p from "@clack/prompts";
import pc from "picocolors";
import { parseSource, buildFileUrl, isWellKnownSource } from "@/core/git/source-parser";
import { cloneRepo, cleanupTempDir, getCommitHash } from "@/infrastructure/git-client";
import {
  downloadSkills as downloadWellKnownSkills,
  listSkills as listWellKnownSkills,
  buildSkillUrl,
  cleanupTempDir as cleanupWellKnownTempDir,
} from "@/infrastructure/well-known-client";
import { discoverSkills } from "@/core/skills/discovery";
import { discoverCommands } from "@/core/commands/discovery";
import { getSkillDisplayName } from "@/core/skills/parser";
import { getCommandDisplayName } from "@/core/commands/parser";
import { installSkillForAgent, copySkillsToStorage } from "@/infrastructure/skill-installer";
import {
  installCommandForAgent,
  supportsCommands,
  getCommandSupportAgents,
} from "@/infrastructure/command-installer";
import { detectInstalledAgents } from "@/core/agents/detector";
import { agents } from "@/config";
import { addSkill } from "@/core/state/global";
import { addLocalSkill } from "@/core/state/local";
import type { Skill, ParsedSource } from "@/types/skills";
import type { Command } from "@/types/commands";
import type { AgentType } from "@/types/agents";

interface Options {
  global?: boolean;
  agent?: string[];
  yes?: boolean;
  force?: boolean;
  silent?: boolean;
  skill?: string[];
  list?: boolean;
  symlink?: boolean;
}

interface InstallResult {
  success: boolean;
  installed: number;
  failed: number;
  results: Array<{
    skill: string;
    agent: string;
    success: boolean;
    path: string;
    sourceUrl?: string;
    error?: string;
  }>;
}

interface ServiceContext {
  tempDir: string | null;
  spinner: ReturnType<typeof p.spinner>;
}

interface SourceInfo {
  type: "git" | "well-known";
  displayName: string;
  url: string;
  branch: string;
  commit: string;
  subpath?: string;
  parsed?: ParsedSource;
}

export async function performInstallation(
  source: string,
  options: Options,
): Promise<InstallResult> {
  const context: ServiceContext = {
    tempDir: null,
    spinner: p.spinner(),
  };

  const isWellKnown = isWellKnownSource(source);
  const host = isWellKnown ? source.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

  try {
    if (options.list) {
      return await handleListMode(source, isWellKnown, host, context);
    }

    const sourceInfo = await downloadSource(source, isWellKnown, host, options, context);
    if (!sourceInfo) {
      return { success: false, installed: 0, failed: 0, results: [] };
    }

    context.spinner.start("Finding skills...");
    const skills = await discoverSkills(context.tempDir!, sourceInfo.subpath);
    const commands = isWellKnown
      ? []
      : await discoverCommands(context.tempDir!, sourceInfo.subpath);

    if (skills.length === 0 && commands.length === 0) {
      context.spinner.stop(pc.red("No skills or commands found"));
      p.outro(pc.red("No skills found. Source must have SKILL.md files."));
      return { success: false, installed: 0, failed: 0, results: [] };
    }

    const hasCommands = commands.length > 0;
    context.spinner.stop(
      `Found ${pc.green(skills.length)} skill${skills.length !== 1 ? "s" : ""}` +
        (hasCommands
          ? ` and ${pc.yellow(commands.length)} command${commands.length !== 1 ? "s" : ""}`
          : ""),
    );

    const selectedSkills = await selectSkills(skills, options);
    const skillsAgents = selectedSkills ? await selectAgentsForSkills(options, context) : null;

    const selectedCommands = commands.length > 0 ? await selectCommands(commands, options) : null;
    const commandsAgents = selectedCommands
      ? await selectAgentsForCommands(options, context)
      : null;

    if (!selectedSkills && !selectedCommands) {
      return { success: false, installed: 0, failed: 0, results: [] };
    }

    if (selectedSkills && !skillsAgents) {
      return { success: false, installed: 0, failed: 0, results: [] };
    }

    if (selectedCommands && !commandsAgents) {
      return { success: false, installed: 0, failed: 0, results: [] };
    }

    const installGlobally = await determineScope(options);
    if (installGlobally === null) {
      return { success: false, installed: 0, failed: 0, results: [] };
    }

    const confirmed = await showSummaryAndConfirm(
      options,
      selectedSkills,
      skillsAgents,
      selectedCommands,
      commandsAgents,
      installGlobally,
      sourceInfo.displayName,
    );
    if (!confirmed) {
      return { success: false, installed: 0, failed: 0, results: [] };
    }

    context.spinner.start("Adding skills...");
    const results = await performParallelInstall(
      selectedSkills || [],
      skillsAgents || [],
      selectedCommands || [],
      commandsAgents || [],
      installGlobally,
      sourceInfo,
      options.symlink ?? true,
      context.tempDir!,
    );
    context.spinner.stop("Installation complete");

    return results;
  } finally {
    if (context.tempDir) {
      if (isWellKnown) {
        cleanupWellKnownTempDir(context.tempDir);
      } else {
        await cleanupTempDir(context.tempDir);
      }
    }
  }
}

async function handleListMode(
  source: string,
  isWellKnown: boolean,
  host: string,
  context: ServiceContext,
): Promise<InstallResult> {
  if (isWellKnown) {
    context.spinner.start(`Fetching skills from ${host}...`);
    const indexSkills = await listWellKnownSkills(host);
    context.spinner.stop(
      `Found ${pc.green(indexSkills.length)} skill${indexSkills.length !== 1 ? "s" : ""}`,
    );

    p.log.step(pc.bold(`Available Skills from ${host}`));
    for (const skill of indexSkills) {
      p.log.message(`  ${pc.cyan(skill.name)}`);
      p.log.message(`    ${pc.dim(skill.description)}`);
    }
    p.outro(`Use ${pc.cyan(`flins add ${host} --skill <name>`)} to install`);
  } else {
    context.spinner.start("Reading repository...");
    const parsed = parseSource(source);
    context.spinner.stop(
      `Source: ${pc.cyan(parsed.url)}${parsed.subpath ? ` (${parsed.subpath})` : ""}`,
    );

    context.spinner.start("Downloading...");
    context.tempDir = await cloneRepo(parsed.url, parsed.branch);
    context.spinner.stop("Repository cloned");

    context.spinner.start("Finding skills...");
    const skills = await discoverSkills(context.tempDir, parsed.subpath);
    const commands = await discoverCommands(context.tempDir, parsed.subpath);
    context.spinner.stop(`Found ${pc.green(skills.length)} skill${skills.length !== 1 ? "s" : ""}`);

    if (skills.length > 0) {
      p.log.step(pc.bold("Available Skills"));
      for (const skill of skills) {
        p.log.message(`  ${pc.cyan(getSkillDisplayName(skill))}`);
        p.log.message(`    ${pc.dim(skill.description)}`);
      }
    }
    if (commands.length > 0) {
      p.log.step(pc.bold("Available Commands"));
      for (const command of commands) {
        p.log.message(`  ${pc.cyan(getCommandDisplayName(command))}`);
        p.log.message(`    ${pc.dim(command.description || `Command: ${command.name}`)}`);
      }
    }
    p.outro("Use --skill <name> to install specific skills or commands");
  }

  return { success: true, installed: 0, failed: 0, results: [] };
}

async function downloadSource(
  source: string,
  isWellKnown: boolean,
  host: string,
  options: Options,
  context: ServiceContext,
): Promise<SourceInfo | null> {
  if (isWellKnown) {
    context.spinner.start(`Fetching skills from ${host}...`);
    const { tempDir, skills: indexSkills } = await downloadWellKnownSkills(host, options.skill);
    context.tempDir = tempDir;
    context.spinner.stop(
      `Downloaded ${pc.green(indexSkills.length)} skill${indexSkills.length !== 1 ? "s" : ""}`,
    );

    return {
      type: "well-known",
      displayName: host,
      url: `well-known:${host}`,
      branch: "main",
      commit: "well-known",
    };
  }

  context.spinner.start("Reading repository...");
  const parsed = parseSource(source);
  const branch = parsed.branch ?? "main";
  context.spinner.stop(
    `Source: ${pc.cyan(parsed.url)}${parsed.subpath ? ` (${parsed.subpath})` : ""}${
      parsed.branch ? ` @ ${pc.cyan(parsed.branch)}` : ""
    }`,
  );

  context.spinner.start("Downloading...");
  context.tempDir = await cloneRepo(parsed.url, parsed.branch);
  context.spinner.stop("Repository cloned");

  const commit = await getCommitHash(context.tempDir);

  return {
    type: "git",
    displayName: parsed.url,
    url: parsed.url,
    branch,
    commit,
    subpath: parsed.subpath,
    parsed,
  };
}

async function selectSkills(skills: Skill[], options: Options): Promise<Skill[] | null> {
  if (skills.length === 0) {
    return null;
  }

  let selectedSkills: Skill[] = [];

  if (options.skill && options.skill.length > 0) {
    selectedSkills = skills.filter((s) =>
      options.skill!.some(
        (name) =>
          s.name.toLowerCase() === name.toLowerCase() ||
          getSkillDisplayName(s).toLowerCase() === name.toLowerCase(),
      ),
    );

    if (selectedSkills.length === 0) {
      p.log.error(`No matching skills found for: ${options.skill.join(", ")}`);
      p.log.info("Available skills:");
      for (const s of skills) {
        p.log.message(`  - ${getSkillDisplayName(s)}`);
      }
      return null;
    }

    p.log.info(
      `Selected ${selectedSkills.length} skill${
        selectedSkills.length !== 1 ? "s" : ""
      }: ${selectedSkills.map((s) => pc.cyan(getSkillDisplayName(s))).join(", ")}`,
    );
  } else if (options.yes || options.force) {
    selectedSkills = skills;
    p.log.info(`Installing all ${skills.length} skills`);
  } else {
    const skillChoices = skills.map((s) => ({
      value: s,
      label: getSkillDisplayName(s),
      hint: s.description.length > 60 ? s.description.slice(0, 57) + "..." : s.description,
    }));

    const selected = await p.multiselect({
      message: "Choose skills to add",
      options: skillChoices,
      required: false,
      initialValues: skills.length === 1 ? [skills[0]] : undefined,
    });

    if (p.isCancel(selected)) {
      p.cancel("Installation cancelled");
      return null;
    }

    if (!selected || selected.length === 0) {
      p.log.info("No skills selected");
      return null;
    }

    selectedSkills = selected as Skill[];
  }

  return selectedSkills;
}

async function selectCommands(commands: Command[], options: Options): Promise<Command[] | null> {
  if (commands.length === 0) {
    return null;
  }

  let selectedCommands: Command[] = [];

  if (options.skill && options.skill.length > 0) {
    selectedCommands = commands.filter((c) =>
      options.skill!.some(
        (name) =>
          c.name.toLowerCase() === name.toLowerCase() ||
          getCommandDisplayName(c).toLowerCase() === name.toLowerCase(),
      ),
    );

    if (selectedCommands.length > 0) {
      p.log.info(
        `Selected ${selectedCommands.length} command${
          selectedCommands.length !== 1 ? "s" : ""
        }: ${selectedCommands.map((c) => pc.cyan(getCommandDisplayName(c))).join(", ")}`,
      );
    }
  } else if (options.yes || options.force) {
    selectedCommands = commands;
    p.log.info(`Installing all ${commands.length} commands`);
  } else {
    const commandChoices = commands.map((c) => ({
      value: c,
      label: getCommandDisplayName(c),
      hint: c.description
        ? c.description.length > 60
          ? c.description.slice(0, 57) + "..."
          : c.description
        : `Command: ${c.name}`,
    }));

    const selected = await p.multiselect({
      message: "Choose commands to add",
      options: commandChoices,
      required: false,
      initialValues: commands.length === 1 ? [commands[0]] : undefined,
    });

    if (p.isCancel(selected)) {
      p.cancel("Installation cancelled");
      return null;
    }

    if (!selected || selected.length === 0) {
      p.log.info("No commands selected");
      return null;
    }

    selectedCommands = selected as Command[];
  }

  return selectedCommands.length > 0 ? selectedCommands : null;
}

async function selectAgentsForSkills(
  options: Options,
  context: ServiceContext,
): Promise<AgentType[] | null> {
  if (options.agent && options.agent.length > 0) {
    const validAgents = Object.keys(agents) as AgentType[];
    const invalidAgents = options.agent.filter((a) => !validAgents.includes(a as AgentType));

    if (invalidAgents.length > 0) {
      p.log.error(`Invalid agents: ${invalidAgents.join(", ")}`);
      p.log.info(`Valid agents: ${validAgents.join(", ")}`);
      return null;
    }

    return options.agent as AgentType[];
  }

  context.spinner.start("Finding AI tools...");
  const installedAgents = await detectInstalledAgents();
  context.spinner.stop(
    `Detected ${installedAgents.length} agent${installedAgents.length !== 1 ? "s" : ""}`,
  );

  if (options.yes || options.force) {
    if (installedAgents.length === 0) {
      const allAgentsList = Object.keys(agents) as AgentType[];
      p.log.info("Installing to all agents (none detected)");
      return allAgentsList;
    }
    if (installedAgents.length === 1) {
      const firstAgent = installedAgents[0]!;
      p.log.info(`Installing skills to: ${pc.cyan(agents[firstAgent].displayName)}`);
    } else {
      p.log.info(
        `Installing skills to: ${installedAgents
          .map((a) => pc.cyan(agents[a].displayName))
          .join(", ")}`,
      );
    }
    return installedAgents;
  }

  const allAgentChoices = Object.entries(agents).map(([key, config]) => {
    const isInstalled = installedAgents.includes(key as AgentType);
    return {
      value: key as AgentType,
      label: config.displayName,
      hint: isInstalled ? pc.green("installed") : pc.dim("not installed"),
    };
  });

  const selected = await p.multiselect({
    message: "Choose agents to install to",
    options: allAgentChoices,
    required: true,
    initialValues: installedAgents,
  });

  if (p.isCancel(selected)) {
    p.cancel("Installation cancelled");
    return null;
  }

  return selected as AgentType[];
}

async function selectAgentsForCommands(
  options: Options,
  _context: ServiceContext,
): Promise<AgentType[] | null> {
  const validAgentsForCommands = getCommandSupportAgents();

  if (options.agent && options.agent.length > 0) {
    const validAgents = Object.keys(agents) as AgentType[];
    const invalidAgents = options.agent.filter((a) => !validAgents.includes(a as AgentType));

    if (invalidAgents.length > 0) {
      p.log.error(`Invalid agents: ${invalidAgents.join(", ")}`);
      p.log.info(`Valid agents: ${validAgents.join(", ")}`);
      return null;
    }

    const commandAgents = options.agent.filter((a) =>
      supportsCommands(a as AgentType),
    ) as AgentType[];

    if (commandAgents.length === 0) {
      p.log.error(
        "Commands are only supported by: " +
          validAgentsForCommands.map((a) => agents[a].displayName).join(", "),
      );
      return null;
    }

    const filtered = options.agent.filter((a) => !supportsCommands(a as AgentType));
    if (filtered.length > 0) {
      p.log.warn(`Filtering out agents that don't support commands: ${filtered.join(", ")}`);
    }

    return commandAgents;
  }

  const availableCommandAgents = validAgentsForCommands.filter((a) => agents[a]?.commandsDir);

  if (availableCommandAgents.length === 0) {
    p.log.warn("No agents with command support detected");
    return [];
  }

  const autoConfirm = options.yes || options.force;

  if (autoConfirm) {
    p.log.info(
      `Installing commands to: ${availableCommandAgents
        .map((a) => pc.cyan(agents[a].displayName))
        .join(", ")}`,
    );
    return availableCommandAgents;
  }

  const commandAgentChoices = availableCommandAgents.map((a) => ({
    value: a,
    label: agents[a].displayName,
  }));

  const selected = await p.multiselect({
    message: "Choose agents to install commands to",
    options: commandAgentChoices,
    required: true,
    initialValues: availableCommandAgents,
  });

  if (p.isCancel(selected)) {
    p.cancel("Installation cancelled");
    return null;
  }

  return selected as AgentType[];
}

async function determineScope(options: Options): Promise<boolean | null> {
  if (options.global !== undefined) {
    return options.global;
  }

  if (options.yes || options.force) {
    return false;
  }

  const scope = await p.select({
    message: "Install scope",
    options: [
      {
        value: false,
        label: "Project",
        hint: "for this project only",
      },
      {
        value: true,
        label: "Global",
        hint: "available for all projects",
      },
    ],
  });

  if (p.isCancel(scope)) {
    p.cancel("Installation cancelled");
    return null;
  }

  return scope;
}

async function showSummaryAndConfirm(
  options: Options,
  selectedSkills: Skill[] | null,
  skillsAgents: AgentType[] | null,
  selectedCommands: Command[] | null,
  commandsAgents: AgentType[] | null,
  _installGlobally: boolean,
  sourceName: string,
): Promise<boolean> {
  p.log.step(pc.bold("Installation Summary"));

  p.log.message(pc.bold(pc.cyan("Source:")) + " " + sourceName);

  if (selectedSkills && selectedSkills.length > 0 && skillsAgents) {
    p.log.message(
      pc.bold(pc.cyan("Skills:")) +
        " " +
        selectedSkills.map((s) => getSkillDisplayName(s)).join(", "),
    );
    p.log.message(
      pc.bold(pc.cyan("Agents:")) + " " + skillsAgents.map((a) => agents[a].displayName).join(", "),
    );
  }

  if (
    selectedCommands &&
    selectedCommands.length > 0 &&
    commandsAgents &&
    commandsAgents.length > 0
  ) {
    p.log.message(
      pc.bold(pc.yellow("Commands:")) +
        " " +
        selectedCommands.map((c) => getCommandDisplayName(c)).join(", "),
    );
    p.log.message(
      pc.bold(pc.cyan("Agents:")) +
        " " +
        commandsAgents.map((a) => agents[a].displayName).join(", "),
    );
  }

  const autoConfirm = options.yes || options.force;

  if (!autoConfirm) {
    const confirmed = await p.confirm({
      message: "Ready to install?",
    });

    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Installation cancelled");
      return false;
    }
  }

  return true;
}

async function performParallelInstall(
  selectedSkills: Skill[],
  skillsAgents: AgentType[],
  selectedCommands: Command[],
  commandsAgents: AgentType[],
  installGlobally: boolean,
  sourceInfo: SourceInfo,
  symlink: boolean,
  tempDir: string,
): Promise<InstallResult> {
  const skillCopyResults = symlink
    ? await copySkillsToStorage(selectedSkills, { global: installGlobally })
    : new Map<string, { success: boolean; error?: string }>();

  const installPromises = [
    ...selectedSkills.flatMap((skill) => {
      const copyResult = skillCopyResults.get(skill.name);
      if (symlink && copyResult && !copyResult.success) {
        return skillsAgents.map(() =>
          Promise.resolve({
            success: false,
            path: "",
            originalPath: skill.path,
            error: copyResult.error,
          }),
        );
      }
      return skillsAgents.map((agent) =>
        installSkillForAgent(skill, agent, {
          global: installGlobally,
          symlink,
          skipCopy: symlink,
        }),
      );
    }),
    ...selectedCommands.flatMap((command) =>
      commandsAgents.map((agent) =>
        installCommandForAgent(command, agent, {
          global: installGlobally,
          symlink,
        }),
      ),
    ),
  ];

  const installResults = await Promise.all(installPromises);

  const results = installResults.map((result, i) => {
    const skillIndex = Math.floor(i / Math.max(skillsAgents.length, commandsAgents.length, 1));
    const agentIndex = i % Math.max(skillsAgents.length, commandsAgents.length, 1);
    const isSkill = i < selectedSkills.length * skillsAgents.length;
    const item = isSkill
      ? selectedSkills[skillIndex % selectedSkills.length]!
      : selectedCommands[skillIndex % selectedCommands.length]!;
    const agentList = isSkill ? skillsAgents : commandsAgents;
    const agent = agentList![agentIndex % agentList!.length]!;
    const name = isSkill
      ? getSkillDisplayName(item as Skill)
      : getCommandDisplayName(item as Command);

    let sourceUrl: string;
    if (sourceInfo.type === "well-known") {
      sourceUrl = buildSkillUrl(sourceInfo.displayName, (item as Skill).name);
    } else {
      const filePath = isSkill ? `${item.path}/SKILL.md` : item.path;
      sourceUrl = buildFileUrl(sourceInfo.parsed!, tempDir, filePath);
    }

    return {
      skill: name,
      agent: agents[agent].displayName,
      ...result,
      sourceUrl,
      installableType: isSkill ? "skill" : "command",
    };
  });

  const branchChanges = new Map<string, { previous: string; current: string }>();

  for (const [i, result] of installResults.entries()) {
    if (!result.success) continue;

    const isSkill = i < selectedSkills.length * skillsAgents.length;

    if (installGlobally) {
      if (isSkill) {
        const skillIndex = Math.floor(i / skillsAgents.length);
        const skill = selectedSkills[skillIndex % selectedSkills.length]!;

        const addResult = addSkill(
          skill.name,
          sourceInfo.url,
          sourceInfo.subpath,
          sourceInfo.branch,
          sourceInfo.commit,
          "skill",
        );

        if (addResult.updated && addResult.previousBranch) {
          const existing = branchChanges.get(skill.name);
          branchChanges.set(skill.name, {
            previous: existing?.previous ?? addResult.previousBranch,
            current: existing?.current ?? sourceInfo.branch,
          });
        }
      } else {
        const commandIndex = Math.floor(
          (i - selectedSkills.length * skillsAgents.length) / commandsAgents.length,
        );
        const command = selectedCommands[commandIndex % selectedCommands.length]!;

        addSkill(
          command.name,
          sourceInfo.url,
          sourceInfo.subpath,
          sourceInfo.branch,
          sourceInfo.commit,
          "command",
        );
      }
    } else {
      if (isSkill) {
        const skillIndex = Math.floor(i / skillsAgents.length);
        const skill = selectedSkills[skillIndex % selectedSkills.length]!;
        addLocalSkill(
          skill.name,
          sourceInfo.url,
          sourceInfo.subpath,
          sourceInfo.branch,
          sourceInfo.commit,
          "skill",
        );
      } else {
        const commandIndex = Math.floor(
          (i - selectedSkills.length * skillsAgents.length) / commandsAgents.length,
        );
        const command = selectedCommands[commandIndex % selectedCommands.length]!;
        addLocalSkill(
          command.name,
          sourceInfo.url,
          sourceInfo.subpath,
          sourceInfo.branch,
          sourceInfo.commit,
          "command",
        );
      }
    }
  }

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (branchChanges.size > 0) {
    for (const [skillName, { previous, current }] of branchChanges) {
      p.log.warn(pc.yellow(`  ${pc.cyan(skillName)}: ${pc.dim(previous)} → ${pc.green(current)}`));
    }
  }

  if (successful.length > 0) {
    const skillCount = successful.filter(
      (r) => (r as { installableType?: string }).installableType === "skill",
    ).length;
    const commandCount = successful.filter(
      (r) => (r as { installableType?: string }).installableType === "command",
    ).length;

    const parts: string[] = [];
    if (skillCount > 0) {
      parts.push(`${skillCount} skill${skillCount !== 1 ? "s" : ""}`);
    }
    if (commandCount > 0) {
      parts.push(`${commandCount} command${commandCount !== 1 ? "s" : ""}`);
    }

    p.log.success(pc.green(`Successfully installed ${parts.join(" and ")}`));
  }

  if (failed.length > 0) {
    p.log.error(pc.red(`Failed to install ${failed.length} item${failed.length !== 1 ? "s" : ""}`));
    for (const r of failed) {
      p.log.message(`  ${pc.red("✗")} ${r.skill} → ${r.agent}`);
      p.log.message(`    ${pc.dim(r.error)}`);
    }
  }

  if (successful.length > 0) {
    p.outro(pc.green("Done! Skills ready to use."));
  } else {
    p.outro(pc.yellow("Nothing installed"));
  }

  return {
    success: failed.length === 0,
    installed: successful.length,
    failed: failed.length,
    results,
  };
}
