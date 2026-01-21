import { existsSync, readdirSync, lstatSync } from "fs";

export function isValidSkillInstallation(path: string): boolean {
  if (!existsSync(path)) return false;

  try {
    const stat = lstatSync(path);
    const isSymlinkToDir = stat.isSymbolicLink();
    const isDir = stat.isDirectory();
    if (!isSymlinkToDir && !isDir) return false;

    const files = readdirSync(path);
    if (files.length === 0) return false;
    return files.includes("SKILL.md");
  } catch {
    return false;
  }
}

export function isValidCommandInstallation(path: string): boolean {
  if (!existsSync(path)) return false;

  try {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      return path.endsWith(".md");
    }
    if (!stat.isFile()) return false;
    return path.endsWith(".md");
  } catch {
    return false;
  }
}

export function isValidInstallation(path: string, installableType: "skill" | "command"): boolean {
  return installableType === "skill"
    ? isValidSkillInstallation(path)
    : isValidCommandInstallation(path);
}
