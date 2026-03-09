import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import {
  agents,
  getAgentNames,
  resolveAgentCommandsDir,
  resolveAgentSkillsDir,
  type AgentName,
  type AgentScope,
} from "@/agents";
import type { Installable, InstallableType } from "@/discovery";
import type { TrackedItem } from "@/state";

export interface InstallationRecord {
  agent: AgentName;
  scope: AgentScope;
  path: string;
}

export interface InstallationGroup {
  agent: AgentName;
  scope: AgentScope;
  path: string;
  agents: AgentName[];
}

const flinsHome = join(homedir(), ".flins");
const excludedSkillFiles = new Set(["README.md", "metadata.json"]);

function toError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function getStorageRoot(scope: AgentScope, type: InstallableType, cwd: string) {
  const base = scope === "global" ? join(flinsHome, ".agents") : join(cwd, ".agents");
  return join(base, type === "skill" ? "skills" : "commands");
}

function findMatchingEntry(directory: string, name: string, type: InstallableType) {
  try {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryName = type === "command" ? entry.name.replace(/\.md$/i, "") : entry.name;
      if (entryName.toLowerCase() !== name.toLowerCase()) {
        continue;
      }

      const path = join(directory, entry.name);
      const stats = lstatSync(path);

      if (type === "skill" && (stats.isDirectory() || stats.isSymbolicLink())) {
        return path;
      }

      if (type === "command" && (stats.isFile() || stats.isSymbolicLink())) {
        return path;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isValidInstallation(path: string, type: InstallableType) {
  if (!existsSync(path)) {
    return false;
  }

  try {
    const stats = lstatSync(path);
    if (type === "skill") {
      return (stats.isDirectory() || stats.isSymbolicLink()) && existsSync(join(path, "SKILL.md"));
    }

    return (stats.isFile() || stats.isSymbolicLink()) && path.toLowerCase().endsWith(".md");
  } catch {
    return false;
  }
}

function copySkillDirectory(sourcePath: string, targetPath: string) {
  rmSync(targetPath, { recursive: true, force: true });
  mkdirSync(targetPath, { recursive: true });

  for (const entry of readdirSync(sourcePath, { withFileTypes: true })) {
    if (excludedSkillFiles.has(entry.name) || entry.name.startsWith("_")) {
      continue;
    }

    const sourceEntry = join(sourcePath, entry.name);
    const targetEntry = join(targetPath, entry.name);

    if (entry.isDirectory()) {
      copySkillDirectory(sourceEntry, targetEntry);
      continue;
    }

    mkdirSync(dirname(targetEntry), { recursive: true });
    cpSync(sourceEntry, targetEntry, { recursive: true });
  }
}

function getStoredInstallablePath(installable: Installable, scope: AgentScope, cwd: string) {
  const root = getStorageRoot(scope, installable.type, cwd);
  mkdirSync(root, { recursive: true });
  return installable.type === "skill"
    ? join(root, installable.name)
    : join(root, `${installable.name}.md`);
}

function getSymlinkKind(type: InstallableType) {
  if (platform() !== "win32") {
    return undefined;
  }

  return type === "skill" ? "junction" : "file";
}

export function findInstallations(
  name: string,
  type: InstallableType,
  scope: AgentScope,
  cwd: string = process.cwd(),
) {
  const installations: InstallationRecord[] = [];

  for (const agent of getAgentNames()) {
    const directory =
      type === "skill"
        ? resolveAgentSkillsDir(agent, scope, cwd)
        : resolveAgentCommandsDir(agent, scope, cwd);

    if (!directory || !existsSync(directory)) {
      continue;
    }

    const path = findMatchingEntry(directory, name, type);
    if (!path) {
      continue;
    }

    installations.push({
      agent,
      scope,
      path,
    });
  }

  return installations;
}

export function getValidInstallations(item: TrackedItem, cwd: string = process.cwd()) {
  return findInstallations(item.name, item.type, item.scope, cwd).filter((installation) =>
    isValidInstallation(installation.path, item.type),
  );
}

export function groupInstallations(installations: InstallationRecord[]) {
  const grouped = new Map<string, InstallationGroup>();

  for (const installation of installations) {
    const existing = grouped.get(installation.path);
    if (existing) {
      existing.agents.push(installation.agent);
      continue;
    }

    grouped.set(installation.path, {
      agent: installation.agent,
      scope: installation.scope,
      path: installation.path,
      agents: [installation.agent],
    });
  }

  return Array.from(grouped.values());
}

export function installInstallable(
  installable: Installable,
  agent: AgentName,
  scope: AgentScope,
  options: { symlink: boolean; cwd?: string },
) {
  const cwd = options.cwd ?? process.cwd();

  if (installable.type === "command") {
    const directory = resolveAgentCommandsDir(agent, scope, cwd);
    if (!directory) {
      return {
        success: false,
        path: "",
        error: `Agent ${agents[agent].label} does not support commands`,
      };
    }

    const targetPath = join(directory, `${installable.name}.md`);

    try {
      if (!options.symlink) {
        mkdirSync(dirname(targetPath), { recursive: true });
        rmSync(targetPath, { force: true });
        cpSync(installable.path, targetPath);
        return { success: true, path: targetPath };
      }

      const sourcePath = getStoredInstallablePath(installable, scope, cwd);
      rmSync(sourcePath, { force: true });
      cpSync(installable.path, sourcePath);

      if (resolve(sourcePath) === resolve(targetPath)) {
        return { success: true, path: targetPath };
      }

      mkdirSync(dirname(targetPath), { recursive: true });
      rmSync(targetPath, { recursive: true, force: true });
      symlinkSync(
        relative(dirname(targetPath), sourcePath),
        targetPath,
        getSymlinkKind(installable.type),
      );
      return { success: true, path: targetPath };
    } catch (error) {
      return { success: false, path: targetPath, error: toError(error) };
    }
  }

  const targetPath = join(resolveAgentSkillsDir(agent, scope, cwd), installable.name);

  try {
    if (!options.symlink) {
      copySkillDirectory(installable.path, targetPath);
      return { success: true, path: targetPath };
    }

    const sourcePath = getStoredInstallablePath(installable, scope, cwd);
    copySkillDirectory(installable.path, sourcePath);

    if (resolve(sourcePath) === resolve(targetPath)) {
      return { success: true, path: targetPath };
    }

    mkdirSync(dirname(targetPath), { recursive: true });
    rmSync(targetPath, { recursive: true, force: true });
    symlinkSync(
      relative(dirname(targetPath), sourcePath),
      targetPath,
      getSymlinkKind(installable.type),
    );
    return { success: true, path: targetPath };
  } catch (error) {
    return { success: false, path: targetPath, error: toError(error) };
  }
}

export function removeInstalledPath(path: string) {
  try {
    if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
      const target = resolve(dirname(path), readlinkSync(path));
      rmSync(target, { recursive: true, force: true });
    }

    rmSync(path, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: toError(error) };
  }
}
