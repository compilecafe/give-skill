import { mkdir, cp } from "fs/promises";
import { join, dirname } from "path";
import { agents } from "@/config";
import { installCommandAsSymlink } from "./file-system";
import { resolveAgentCommandsDir } from "@/utils/paths";
import type { Command } from "@/types/commands";
import { COMMANDS_SUPPORT_AGENTS } from "@/types/commands";
import type { AgentType } from "@/types/agents";

export function supportsCommands(agent: AgentType): boolean {
  return COMMANDS_SUPPORT_AGENTS.includes(agent as (typeof COMMANDS_SUPPORT_AGENTS)[number]);
}

export function getCommandSupportAgents(): AgentType[] {
  return [...COMMANDS_SUPPORT_AGENTS].filter((agent) => agents[agent]?.commandsDir);
}

async function ensureCommandsDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function copyCommandFile(
  src: string,
  dest: string,
): Promise<{ success: boolean; path: string; error?: string }> {
  try {
    await ensureCommandsDir(dirname(dest));
    await cp(src, dest);
    return { success: true, path: dest };
  } catch (error) {
    return {
      success: false,
      path: dest,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function installMarkdownCommand(
  command: Command,
  agent: AgentType,
  options: { global: boolean; symlink?: boolean },
): Promise<{ success: boolean; path: string; error?: string }> {
  const agentConfig = agents[agent];
  const baseDir = resolveAgentCommandsDir(
    options.global ? agentConfig.globalCommandsDir! : agentConfig.commandsDir!,
    { global: options.global },
  );
  const targetPath = join(baseDir, `${command.name}.md`);

  if (options.symlink) {
    return installCommandAsSymlink(command.path, command.name, targetPath, {
      global: options.global,
    });
  }
  return copyCommandFile(command.path, targetPath);
}

export async function installCommandForAgent(
  command: Command,
  agent: AgentType,
  options: { global: boolean; symlink?: boolean },
): Promise<{ success: boolean; path: string; originalPath: string; error?: string }> {
  if (!supportsCommands(agent)) {
    return {
      success: false,
      path: "",
      originalPath: command.path,
      error: `Agent ${agent} does not support commands`,
    };
  }

  const agentConfig = agents[agent];
  if (!agentConfig.commandsDir) {
    return {
      success: false,
      path: "",
      originalPath: command.path,
      error: `Agent ${agent} has no commands directory configured`,
    };
  }

  const result = await installMarkdownCommand(command, agent, options);

  return {
    ...result,
    originalPath: command.path,
  };
}
