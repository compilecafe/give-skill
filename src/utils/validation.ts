import { existsSync, readdirSync } from "fs";

export function isValidSkillInstallation(path: string): boolean {
  if (!existsSync(path)) return false;

  try {
    const files = readdirSync(path);
    if (files.length === 0) return false;
    return files.includes("SKILL.md");
  } catch {
    return false;
  }
}
