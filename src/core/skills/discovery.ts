import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import type { Skill } from "@/types/skills";
import { agents } from "../agents/config";
import { parseSkillMd } from "./parser";

const SKIP_DIRS = ["node_modules", ".git", "dist", "build", "__pycache__"];

const COMMON_SKILL_DIRS = ["skills", "skills/.curated", "skills/.experimental", "skills/.system"];

function getPrioritySearchDirs(searchPath: string): string[] {
  const dirs = [searchPath];

  for (const subdir of COMMON_SKILL_DIRS) {
    dirs.push(join(searchPath, subdir));
  }

  const uniqueAgentDirs = new Set<string>();
  for (const agent of Object.values(agents)) {
    uniqueAgentDirs.add(join(searchPath, agent.skillsDir));
  }
  dirs.push(...uniqueAgentDirs);

  return dirs;
}

async function hasSkillMd(dir: string): Promise<boolean> {
  try {
    const skillPath = join(dir, "SKILL.md");
    const stats = await stat(skillPath);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function findSkillDirs(dir: string, depth = 0, maxDepth = 5): Promise<string[]> {
  const skillDirs: string[] = [];

  if (depth > maxDepth) return skillDirs;

  try {
    if (await hasSkillMd(dir)) {
      skillDirs.push(dir);
    }

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !SKIP_DIRS.includes(entry.name)) {
        const subDirs = await findSkillDirs(join(dir, entry.name), depth + 1, maxDepth);
        skillDirs.push(...subDirs);
      }
    }
  } catch {}

  return skillDirs;
}

export async function discoverSkills(basePath: string, subpath?: string): Promise<Skill[]> {
  const skills: Skill[] = [];
  const seenNames = new Set<string>();
  const searchPath = subpath ? join(basePath, subpath) : basePath;

  if (await hasSkillMd(searchPath)) {
    const skillMdPath = join(searchPath, "SKILL.md");
    const content = await readFile(skillMdPath, "utf-8");
    const skill = parseSkillMd(skillMdPath, content);
    if (skill) {
      skills.push(skill);
      return skills;
    }
  }

  const prioritySearchDirs = getPrioritySearchDirs(searchPath);

  for (const dir of prioritySearchDirs) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillDir = join(dir, entry.name);
          if (await hasSkillMd(skillDir)) {
            const skillMdPath = join(skillDir, "SKILL.md");
            const content = await readFile(skillMdPath, "utf-8");
            const skill = parseSkillMd(skillMdPath, content);
            if (skill && !seenNames.has(skill.name)) {
              skills.push(skill);
              seenNames.add(skill.name);
            }
          }
        }
      }
    } catch {}
  }

  if (skills.length === 0) {
    const allSkillDirs = await findSkillDirs(searchPath);

    for (const skillDir of allSkillDirs) {
      const skillMdPath = join(skillDir, "SKILL.md");
      const content = await readFile(skillMdPath, "utf-8");
      const skill = parseSkillMd(skillMdPath, content);
      if (skill && !seenNames.has(skill.name)) {
        skills.push(skill);
        seenNames.add(skill.name);
      }
    }
  }

  return skills;
}
