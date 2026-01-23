import { join } from "path";
import { agents } from "@/config";
import { installSkillFiles, copySkillToStorage, createSkillSymlink } from "./file-system";
import { resolveAgentSkillsDir } from "@/utils/paths";
import type { Skill } from "@/types/skills";
import type { AgentType } from "@/types/agents";

export async function copySkillsToStorage(
  skills: Skill[],
  options: { global: boolean },
): Promise<Map<string, { success: boolean; error?: string }>> {
  const results = new Map<string, { success: boolean; error?: string }>();

  for (const skill of skills) {
    const result = await copySkillToStorage(skill.path, skill.name, {
      global: options.global,
    });
    results.set(skill.name, { success: result.success, error: result.error });
  }

  return results;
}

export async function installSkillForAgent(
  skill: Skill,
  agent: AgentType,
  options: { global: boolean; symlink?: boolean; skipCopy?: boolean },
): Promise<{ success: boolean; path: string; originalPath: string; error?: string }> {
  const agentConfig = agents[agent];
  const baseDir = resolveAgentSkillsDir(
    options.global ? agentConfig.globalSkillsDir : agentConfig.skillsDir,
    { global: options.global },
  );
  const targetPath = join(baseDir, skill.name);

  let result: { success: boolean; path: string; error?: string };

  if (options.symlink) {
    if (options.skipCopy) {
      result = await createSkillSymlink(skill.name, targetPath, {
        global: options.global,
      });
    } else {
      const copyResult = await copySkillToStorage(skill.path, skill.name, {
        global: options.global,
      });
      if (!copyResult.success) {
        return { ...copyResult, path: targetPath, originalPath: skill.path };
      }
      result = await createSkillSymlink(skill.name, targetPath, {
        global: options.global,
      });
    }
  } else {
    result = await installSkillFiles(skill.path, targetPath);
  }

  return {
    ...result,
    originalPath: skill.path,
  };
}
