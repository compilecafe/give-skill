import { join, resolve } from "path";
import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync } from "fs";
import type { LocalState, LocalSkillEntry, SkillInstallation, Dirent } from "@/types/state";
import type { AgentType } from "@/types/agents";
import { agents } from "../agents/config";

const STATE_VERSION = "1.0.0";
const LOCAL_STATE_FILE = "skills.lock";

function getLocalStatePath(cwd?: string): string {
  const basePath = cwd || process.cwd();
  return resolve(basePath, LOCAL_STATE_FILE);
}

export function loadLocalState(cwd?: string): LocalState | null {
  const statePath = getLocalStatePath(cwd);

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

export function saveLocalState(state: LocalState, cwd?: string): void {
  const statePath = getLocalStatePath(cwd);
  state.version = STATE_VERSION;
  writeFileSync(statePath, JSON.stringify(state, null, 2));
}

export function addLocalSkill(
  skillName: string,
  url: string,
  subpath: string | undefined,
  branch: string,
  commit: string,
  cwd?: string,
): { updated: boolean; previousBranch?: string } {
  let state = loadLocalState(cwd);

  if (!state) {
    state = {
      version: STATE_VERSION,
      skills: {},
    };
  }

  const key = skillName.toLowerCase();
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
    state.skills[key].commit = commit;
    if (subpath) {
      state.skills[key].subpath = subpath;
    }
  }

  saveLocalState(state, cwd);
  return { updated, previousBranch };
}

export function removeLocalSkill(skillName: string, cwd?: string): void {
  const state = loadLocalState(cwd);

  if (!state) {
    return;
  }

  const key = skillName.toLowerCase();
  delete state.skills[key];

  if (Object.keys(state.skills).length > 0) {
    saveLocalState(state, cwd);
  } else {
    const statePath = getLocalStatePath(cwd);
    if (existsSync(statePath)) {
      try {
        rmSync(statePath, { force: true });
      } catch {}
    }
  }
}

export function getLocalSkill(skillName: string, cwd?: string): LocalSkillEntry | null {
  const state = loadLocalState(cwd);
  if (!state) {
    return null;
  }
  return state.skills[skillName.toLowerCase()] || null;
}

export function updateLocalSkillCommit(skillName: string, commit: string, cwd?: string): void {
  const state = loadLocalState(cwd);

  if (!state || !state.skills[skillName.toLowerCase()]) {
    return;
  }

  const skill = state.skills[skillName.toLowerCase()];
  if (skill) {
    skill.commit = commit;
    saveLocalState(state, cwd);
  }
}

export function getAllLocalSkills(cwd?: string): LocalState | null {
  return loadLocalState(cwd);
}

export function findLocalSkillInstallations(skillName: string, cwd?: string): SkillInstallation[] {
  const installations: SkillInstallation[] = [];
  const basePath = cwd || process.cwd();

  for (const [agentType, agentConfig] of Object.entries(agents)) {
    const skillsDirPath = join(basePath, agentConfig.skillsDir);

    if (existsSync(skillsDirPath)) {
      try {
        const entries = readdirSync(skillsDirPath, { withFileTypes: true }) as Dirent[];
        const matchingEntry = entries.find(
          (e) => e.isDirectory() && e.name.toLowerCase() === skillName.toLowerCase(),
        );

        if (matchingEntry) {
          installations.push({
            agent: agentType as AgentType,
            type: "project",
            path: join(agentConfig.skillsDir, matchingEntry.name),
          });
        }
      } catch {}
    }

    const globalSkillsDirPath = agentConfig.globalSkillsDir;
    if (existsSync(globalSkillsDirPath)) {
      try {
        const entries = readdirSync(globalSkillsDirPath, { withFileTypes: true }) as Dirent[];
        const matchingEntry = entries.find(
          (e) => e.isDirectory() && e.name.toLowerCase() === skillName.toLowerCase(),
        );

        if (matchingEntry) {
          installations.push({
            agent: agentType as AgentType,
            type: "global",
            path: join(globalSkillsDirPath, matchingEntry.name),
          });
        }
      } catch {}
    }
  }

  return installations;
}
