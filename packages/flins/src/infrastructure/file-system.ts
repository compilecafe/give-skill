import { mkdir, cp, access, readdir, symlink, rm } from "fs/promises";
import { lstatSync, readlinkSync, rmSync } from "fs";
import { join, relative, dirname, resolve } from "path";
import { getSkillsSourceDir, getCommandsSourceDir } from "@/utils/paths";

export const EXCLUDE_FILES = new Set(["README.md", "metadata.json"]);

const isExcluded = (name: string): boolean => {
  if (EXCLUDE_FILES.has(name)) return true;
  if (name.startsWith("_")) return true;
  return false;
};

export async function copyDirectory(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (isExcluded(entry.name)) {
      continue;
    }

    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await cp(srcPath, destPath);
    }
  }
}

export async function installSkillFiles(
  sourceDir: string,
  targetDir: string,
): Promise<{ success: boolean; path: string; error?: string }> {
  try {
    await mkdir(targetDir, { recursive: true });
    await copyDirectory(sourceDir, targetDir);

    return {
      success: true,
      path: targetDir,
    };
  } catch (error) {
    return {
      success: false,
      path: targetDir,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function installSkillAsSymlink(
  sourceDir: string,
  skillName: string,
  targetDir: string,
  options: { global?: boolean } = {},
): Promise<{ success: boolean; path: string; error?: string }> {
  try {
    const agentsSkillsDir = getSkillsSourceDir(options);
    const sourceStorePath = join(agentsSkillsDir, skillName);

    await mkdir(agentsSkillsDir, { recursive: true });
    await rm(sourceStorePath, { recursive: true, force: true });
    await copyDirectory(sourceDir, sourceStorePath);

    const targetParent = join(targetDir, "..");
    await mkdir(targetParent, { recursive: true });
    await rm(targetDir, { recursive: true, force: true });
    await symlink(relative(targetParent, sourceStorePath), targetDir);

    return {
      success: true,
      path: targetDir,
    };
  } catch (error) {
    return {
      success: false,
      path: targetDir,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function installCommandAsSymlink(
  sourcePath: string,
  commandName: string,
  targetPath: string,
  options: { global?: boolean } = {},
): Promise<{ success: boolean; path: string; error?: string }> {
  try {
    const agentsCommandsDir = getCommandsSourceDir(options);
    const sourceStorePath = join(agentsCommandsDir, `${commandName}.md`);

    await mkdir(agentsCommandsDir, { recursive: true });
    await rm(sourceStorePath, { force: true });
    await cp(sourcePath, sourceStorePath);

    const targetParent = dirname(targetPath);
    await mkdir(targetParent, { recursive: true });
    await rm(targetPath, { force: true });
    await symlink(relative(targetParent, sourceStorePath), targetPath);

    return {
      success: true,
      path: targetPath,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkSkillInstalled(skillDir: string): Promise<boolean> {
  try {
    await access(skillDir);
    return true;
  } catch {
    return false;
  }
}

export async function removeSymlinkSource(
  installPath: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const stat = lstatSync(installPath);
    if (!stat.isSymbolicLink()) {
      return { success: true };
    }

    const linkTarget = readlinkSync(installPath);
    const resolvedTarget = resolve(dirname(installPath), linkTarget);

    rmSync(resolvedTarget, { recursive: true, force: true });

    return { success: true };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "ENOENT" || code === "ENOTDIR") {
      return { success: true };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
