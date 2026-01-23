import { join, resolve } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { getFlinsHomeDir } from "@/utils/paths";
import type { StateFile, LocalState, SkillEntry, SkillInstallation } from "@/types/state";
import type { InstallableType } from "@/types/skills";
import { skillKey, commandKey, findInstallations } from "@/utils/state";

const STATE_VERSION = "1.0.0";

interface AddSkillParams {
  name: string;
  url: string;
  subpath: string | undefined;
  branch: string;
  commit: string;
  installableType: InstallableType;
}

interface AddSkillResult {
  updated: boolean;
  previousBranch?: string;
}

interface StateStore {
  load(): StateFile | LocalState | null;
  save(state: StateFile | LocalState): void;
  addSkill(params: AddSkillParams): AddSkillResult;
  removeSkill(name: string, installableType: InstallableType): void;
  updateCommit(name: string, installableType: InstallableType, commit: string): void;
  getEntry(name: string, installableType: InstallableType): SkillEntry | null;
  getAll(): StateFile | LocalState | null;
  findInstallations(name: string, installableType: InstallableType): SkillInstallation[];
  cleanOrphanedEntries(): Promise<void>;
}

function getKey(name: string, installableType: InstallableType): string {
  return installableType === "skill" ? skillKey(name) : commandKey(name);
}

function createGlobalStore(): StateStore {
  const stateDir = getFlinsHomeDir();
  const statePath = join(stateDir, "skills.lock");

  function ensureStateDir(): void {
    if (!existsSync(stateDir)) {
      mkdirSync(stateDir, { recursive: true });
    }
  }

  function load(): StateFile {
    ensureStateDir();

    if (!existsSync(statePath)) {
      const emptyState: StateFile = {
        lastUpdate: new Date().toISOString(),
        skills: {},
      };
      writeFileSync(statePath, JSON.stringify(emptyState, null, 2));
      return emptyState;
    }

    try {
      const content = readFileSync(statePath, "utf-8");
      return JSON.parse(content) as StateFile;
    } catch {
      return {
        lastUpdate: new Date().toISOString(),
        skills: {},
      };
    }
  }

  function save(state: StateFile): void {
    ensureStateDir();
    state.lastUpdate = new Date().toISOString();
    writeFileSync(statePath, JSON.stringify(state, null, 2));
  }

  function addSkill(params: AddSkillParams): AddSkillResult {
    const state = load();
    const key = getKey(params.name, params.installableType);
    const existing = state.skills[key];

    let updated = false;
    let previousBranch: string | undefined;

    if (existing && existing.branch !== params.branch) {
      previousBranch = existing.branch;
      updated = true;
    }

    const entry: SkillEntry = {
      url: params.url,
      subpath: params.subpath,
      branch: params.branch,
      commit: params.commit,
    };

    state.skills[key] = entry;
    save(state);
    return { updated, previousBranch };
  }

  function removeSkill(name: string, installableType: InstallableType): void {
    const state = load();
    const key = getKey(name, installableType);
    delete state.skills[key];
    save(state);
  }

  function updateCommit(name: string, installableType: InstallableType, commit: string): void {
    const state = load();
    const key = getKey(name, installableType);

    if (state.skills[key]) {
      state.skills[key].commit = commit;
      save(state);
    }
  }

  function getEntry(name: string, installableType: InstallableType): SkillEntry | null {
    const state = load();
    const key = getKey(name, installableType);
    return state.skills[key] || null;
  }

  function getAll(): StateFile {
    return load();
  }

  function findSkillInstallations(
    name: string,
    installableType: InstallableType,
  ): SkillInstallation[] {
    return findInstallations(name, installableType, { type: "global" });
  }

  async function cleanOrphanedEntries(): Promise<void> {
    const state = load();
    const orphanedKeys: string[] = [];

    for (const [key] of Object.entries(state.skills)) {
      const parsed = key.split(":");
      if (parsed.length !== 2) continue;

      const installableType = parsed[0] === "skill" ? "skill" : "command";
      const name = parsed[1]!;
      const installations = findSkillInstallations(name, installableType);

      if (installations.length === 0) {
        orphanedKeys.push(key);
      }
    }

    for (const key of orphanedKeys) {
      delete state.skills[key];
    }

    if (orphanedKeys.length > 0) {
      save(state);
    }
  }

  return {
    load,
    save,
    addSkill,
    removeSkill,
    updateCommit,
    getEntry,
    getAll,
    findInstallations: findSkillInstallations,
    cleanOrphanedEntries,
  };
}

function createLocalStoreInternal(cwd?: string): StateStore {
  const basePath = cwd || process.cwd();
  const statePath = resolve(basePath, "skills.lock");

  function load(): LocalState | null {
    if (!existsSync(statePath)) {
      return null;
    }

    try {
      const content = readFileSync(statePath, "utf-8");
      const state = JSON.parse(content) as LocalState;

      if (!state.version || !state.skills) {
        return null;
      }

      return state;
    } catch {
      return null;
    }
  }

  function save(state: LocalState): void {
    state.version = STATE_VERSION;
    writeFileSync(statePath, JSON.stringify(state, null, 2));
  }

  function deleteStateFile(): void {
    if (existsSync(statePath)) {
      try {
        rmSync(statePath, { force: true });
      } catch {}
    }
  }

  function addSkill(params: AddSkillParams): AddSkillResult {
    let state = load();

    if (!state) {
      state = {
        version: STATE_VERSION,
        skills: {},
      };
    }

    const key = getKey(params.name, params.installableType);
    const existing = state.skills[key];

    let updated = false;
    let previousBranch: string | undefined;

    if (existing && existing.branch !== params.branch) {
      previousBranch = existing.branch;
      updated = true;
    }

    const entry: SkillEntry = {
      url: params.url,
      subpath: params.subpath,
      branch: params.branch,
      commit: params.commit,
    };

    state.skills[key] = entry;
    save(state);
    return { updated, previousBranch };
  }

  function removeSkill(name: string, installableType: InstallableType): void {
    const state = load();

    if (!state) {
      return;
    }

    const key = getKey(name, installableType);
    delete state.skills[key];

    if (Object.keys(state.skills).length > 0) {
      save(state);
    } else {
      deleteStateFile();
    }
  }

  function updateCommit(name: string, installableType: InstallableType, commit: string): void {
    const state = load();

    if (!state) {
      return;
    }

    const key = getKey(name, installableType);

    if (state.skills[key]) {
      state.skills[key].commit = commit;
      save(state);
    }
  }

  function getEntry(name: string, installableType: InstallableType): SkillEntry | null {
    const state = load();
    if (!state) {
      return null;
    }

    const key = getKey(name, installableType);
    return state.skills[key] || null;
  }

  function getAll(): LocalState | null {
    return load();
  }

  function findSkillInstallations(
    name: string,
    installableType: InstallableType,
  ): SkillInstallation[] {
    return findInstallations(name, installableType, { type: "project", cwd: basePath });
  }

  async function cleanOrphanedEntries(): Promise<void> {
    const state = load();
    if (!state) return;

    const orphanedKeys: string[] = [];

    for (const [key] of Object.entries(state.skills)) {
      const parsed = key.split(":");
      if (parsed.length !== 2) continue;

      const installableType = parsed[0] === "skill" ? "skill" : "command";
      const name = parsed[1]!;
      const installations = findSkillInstallations(name, installableType);

      if (installations.length === 0) {
        orphanedKeys.push(key);
      }
    }

    for (const key of orphanedKeys) {
      delete state.skills[key];
    }

    if (orphanedKeys.length > 0) {
      if (Object.keys(state.skills).length > 0) {
        save(state);
      } else {
        deleteStateFile();
      }
    }
  }

  return {
    load,
    save,
    addSkill,
    removeSkill,
    updateCommit,
    getEntry,
    getAll,
    findInstallations: findSkillInstallations,
    cleanOrphanedEntries,
  };
}

export const globalStore = createGlobalStore();

export function createLocalStore(cwd?: string): StateStore {
  return createLocalStoreInternal(cwd);
}
