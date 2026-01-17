import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import type { StateFile, SkillState, SkillInstallation } from "@/types/state";
import type { AgentType } from "@/types/agents";
import { isValidSkillInstallation } from "@/utils/validation";

const STATE_DIR = join(homedir(), ".give-skill");
const STATE_FILE = join(STATE_DIR, "state.json");

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
  installation: SkillInstallation,
): { updated: boolean; previousBranch?: string } {
  const state = loadState();
  const key = skillName.toLowerCase();

  let updated = false;
  let previousBranch: string | undefined;

  if (!state.skills[key]) {
    state.skills[key] = {
      url,
      subpath,
      branch,
      commit,
      installations: [],
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

  const existingIndex = state.skills[key].installations.findIndex(
    (i) => i.agent === installation.agent && i.path === installation.path,
  );

  if (existingIndex >= 0) {
    state.skills[key].installations[existingIndex] = installation;
  } else {
    state.skills[key].installations.push(installation);
  }

  saveState(state);
  return { updated, previousBranch };
}

export function removeSkillInstallation(skillName: string, agent: AgentType, path: string): void {
  const state = loadState();
  const key = skillName.toLowerCase();

  if (!state.skills[key]) {
    return;
  }

  state.skills[key].installations = state.skills[key].installations.filter(
    (i) => !(i.agent === agent && i.path === path),
  );

  if (state.skills[key].installations.length === 0) {
    delete state.skills[key];
  }

  saveState(state);
}

export function updateSkillCommit(skillName: string, commit: string): void {
  const state = loadState();
  const key = skillName.toLowerCase();

  if (state.skills[key]) {
    state.skills[key].commit = commit;
    saveState(state);
  }
}

export function getSkillState(skillName: string): SkillState | null {
  const state = loadState();
  return state.skills[skillName.toLowerCase()] || null;
}

export function getAllSkills(): StateFile {
  return loadState();
}

export async function cleanOrphanedEntries(): Promise<void> {
  const state = loadState();
  const orphanedKeys: string[] = [];

  for (const [key, skillState] of Object.entries(state.skills)) {
    const validInstallations: SkillInstallation[] = [];

    for (const installation of skillState.installations) {
      try {
        const path =
          installation.type === "global"
            ? installation.path
            : join(process.cwd(), installation.path);
        if (isValidSkillInstallation(path)) {
          validInstallations.push(installation);
        }
      } catch {}
    }

    if (validInstallations.length === 0) {
      orphanedKeys.push(key);
    } else if (validInstallations.length !== skillState.installations.length) {
      skillState.installations = validInstallations;
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
