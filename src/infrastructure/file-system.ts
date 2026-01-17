import { mkdir, cp, access, readdir } from "fs/promises";
import { join } from "path";

const EXCLUDE_FILES = new Set(["README.md", "metadata.json"]);

const isExcluded = (name: string): boolean => {
  if (EXCLUDE_FILES.has(name)) return true;
  if (name.startsWith("_")) return true;
  return false;
};

async function copyDirectory(src: string, dest: string): Promise<void> {
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

export async function checkSkillInstalled(skillDir: string): Promise<boolean> {
  try {
    await access(skillDir);
    return true;
  } catch {
    return false;
  }
}
