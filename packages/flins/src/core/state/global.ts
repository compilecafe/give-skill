import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync } from "fs";
import { expandHomeDir, getFlinsHomeDir } from "@/utils/paths";
import type { StateFile, SkillEntry, SkillInstallation, Dirent } from "@/types/state";
import type { AgentType } from "@/types/agents";
import type { InstallableType } from "@/types/skills";
import { agents } from "@/core/agents/config";

const STATE_DIR = getFlinsHomeDir();
const STATE_FILE = join(STATE_DIR, "skills.lock");

function ensureStateDir(): void {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
}

export function loadState(): StateFile {
  ensureStateDir();

  if (!existsSync(STATE_FILE)) {
    const emptyState: StateFile = {
      lastUpdate: new Date().toISOString(),
      skills: {},
    };
    writeFileSync(STATE_FILE, JSON.stringify(emptyState, null, 2));
    return emptyState;
  }

  try {
    const content = readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(content) as StateFile;
  } catch {
    return {
      lastUpdate: new Date().toISOString(),
      skills: {},
    };
  }
}

export function saveState(state: StateFile): void {
  ensureStateDir();
  state.lastUpdate = new Date().toISOString();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function addSkill(
  skillName: string,
  url: string,
  subpath: string | undefined,
  branch: string,
  commit: string,
  installableType: InstallableType = "skill",
): { updated: boolean; previousBranch?: string } {
  const state = loadState();
  const key =
    installableType === "skill"
      ? `skill:${skillName.toLowerCase()}`
      : `command:${skillName.toLowerCase()}`;

  let updated = false;
  let previousBranch: string | undefined;

  if (!state.skills[key]) {
    state.skills[key] = {
      url,
      subpath,
      branch,
      commit,
    };
  } else {
    if (state.skills[key].branch !== branch) {
      previousBranch = state.skills[key].branch;
      state.skills[key].branch = branch;
      state.skills[key].commit = commit;
      updated = true;
    }
    state.skills[key].url = url;
    if (subpath) {
      state.skills[key].subpath = subpath;
    }
  }

  saveState(state);
  return { updated, previousBranch };
}

export function removeSkill(skillName: string, installableType: InstallableType): void {
  const state = loadState();
  const key =
    installableType === "skill"
      ? `skill:${skillName.toLowerCase()}`
      : `command:${skillName.toLowerCase()}`;

  delete state.skills[key];
  saveState(state);
}

export function updateSkillCommit(
  skillName: string,
  installableType: InstallableType,
  commit: string,
): void {
  const state = loadState();
  const key =
    installableType === "skill"
      ? `skill:${skillName.toLowerCase()}`
      : `command:${skillName.toLowerCase()}`;

  if (state.skills[key]) {
    state.skills[key].commit = commit;
    saveState(state);
  }
}

export function getSkillEntry(
  skillName: string,
  installableType: InstallableType,
): SkillEntry | null {
  const state = loadState();
  const key =
    installableType === "skill"
      ? `skill:${skillName.toLowerCase()}`
      : `command:${skillName.toLowerCase()}`;

  return state.skills[key] || null;
}

export function getAllSkills(): StateFile {
  return loadState();
}

export function findGlobalSkillInstallations(
  skillName: string,
  installableType: InstallableType,
): SkillInstallation[] {
  const installations: SkillInstallation[] = [];

  for (const [agentType, agentConfig] of Object.entries(agents)) {
    if (installableType === "skill") {
      const globalSkillsDirPath = expandHomeDir(agentConfig.globalSkillsDir);

      if (existsSync(globalSkillsDirPath)) {
        try {
          const entries = readdirSync(globalSkillsDirPath, { withFileTypes: true }) as Dirent[];
          const matchingEntry = entries.find((e) => {
            if (e.name.toLowerCase() !== skillName.toLowerCase()) {
              return false;
            }
            if (e.isDirectory()) {
              return true;
            }
            const fullPath = join(globalSkillsDirPath, e.name);
            try {
              return lstatSync(fullPath).isSymbolicLink();
            } catch {
              return false;
            }
          });

          if (matchingEntry) {
            installations.push({
              agent: agentType as AgentType,
              installableType: "skill",
              type: "global",
              path: join(agentConfig.globalSkillsDir, matchingEntry.name),
            });
          }
        } catch {}
      }
    } else {
      const globalCommandsDir = agentConfig.globalCommandsDir;
      if (globalCommandsDir) {
        const globalCommandsDirPath = expandHomeDir(globalCommandsDir);

        if (existsSync(globalCommandsDirPath)) {
          try {
            const entries = readdirSync(globalCommandsDirPath, { withFileTypes: true }) as Dirent[];
            const matchingEntry = entries.find((e) => {
              const baseName = e.name.replace(/\.md$/, "");
              return baseName.toLowerCase() === skillName.toLowerCase();
            });

            if (matchingEntry) {
              installations.push({
                agent: agentType as AgentType,
                installableType: "command",
                type: "global",
                path: join(globalCommandsDir!, matchingEntry.name),
              });
            }
          } catch {}
        }
      }
    }
  }

  return installations;
}

export async function cleanOrphanedEntries(): Promise<void> {
  const state = loadState();
  const orphanedKeys: string[] = [];

  for (const [key, _entry] of Object.entries(state.skills)) {
    const parsed = key.split(":");
    if (parsed.length !== 2) continue;

    const installableType = parsed[0] === "skill" ? "skill" : "command";
    const name = parsed[1]!;
    const installations = findGlobalSkillInstallations(name, installableType);

    if (installations.length === 0) {
      orphanedKeys.push(key);
    }
  }

  for (const key of orphanedKeys) {
    delete state.skills[key];
  }

  if (orphanedKeys.length > 0) {
    saveState(state);
  }
}

export function getStateDir(): string {
  ensureStateDir();
  return STATE_DIR;
}

export function getCacheDir(): string {
  const cacheDir = join(STATE_DIR, "cache");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  return cacheDir;
}
