import { join } from "path";
import { agents } from "@/core/agents/config";
import { installSkillFiles, checkSkillInstalled } from "./file-system";
import type { Skill } from "@/types/skills";
import type { AgentType } from "@/types/agents";

export async function installSkillForAgent(
  skill: Skill,
  agent: AgentType,
  options: { global: boolean },
): Promise<{ success: boolean; path: string; originalPath: string; error?: string }> {
  const agentConfig = agents[agent];
  const baseDir = options.global ? agentConfig.globalSkillsDir : agentConfig.skillsDir;
  const targetPath = join(baseDir, skill.name);

  const result = await installSkillFiles(skill.path, targetPath);

  return {
    ...result,
    originalPath: skill.path,
  };
}

export async function isSkillInstalled(
  skillName: string,
  agent: AgentType,
  options: { global: boolean },
): Promise<boolean> {
  const path = getInstallPath(skillName, agent, options);
  return checkSkillInstalled(path);
}

export function getInstallPath(
  skillName: string,
  agent: AgentType,
  options: { global: boolean },
): string {
  const agentConfig = agents[agent];
  const baseDir = options.global ? agentConfig.globalSkillsDir : agentConfig.skillsDir;
  return join(baseDir, skillName);
}
