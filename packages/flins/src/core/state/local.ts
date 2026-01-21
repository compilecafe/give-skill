import { join, resolve } from "path";
import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync, lstatSync } from "fs";
import type { LocalState, LocalSkillEntry, SkillInstallation, Dirent } from "@/types/state";
import type { AgentType } from "@/types/agents";
import type { InstallableType } from "@/types/skills";
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
  installableType: InstallableType,
  cwd?: string,
): { updated: boolean; previousBranch?: string } {
  let state = loadLocalState(cwd);

  if (!state) {
    state = {
      version: STATE_VERSION,
      skills: {},
    };
  }

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
    state.skills[key].commit = commit;
    if (subpath) {
      state.skills[key].subpath = subpath;
    }
  }

  saveLocalState(state, cwd);
  return { updated, previousBranch };
}

export function removeLocalSkill(
  skillName: string,
  installableType: InstallableType,
  cwd?: string,
): void {
  const state = loadLocalState(cwd);

  if (!state) {
    return;
  }

  const key =
    installableType === "skill"
      ? `skill:${skillName.toLowerCase()}`
      : `command:${skillName.toLowerCase()}`;
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

export function getLocalSkill(
  skillName: string,
  installableType: InstallableType,
  cwd?: string,
): LocalSkillEntry | null {
  const state = loadLocalState(cwd);
  if (!state) {
    return null;
  }

  const key =
    installableType === "skill"
      ? `skill:${skillName.toLowerCase()}`
      : `command:${skillName.toLowerCase()}`;

  return state.skills[key] || null;
}

export function updateLocalSkillCommit(
  skillName: string,
  installableType: InstallableType,
  commit: string,
  cwd?: string,
): void {
  const state = loadLocalState(cwd);

  if (!state) {
    return;
  }

  const key =
    installableType === "skill"
      ? `skill:${skillName.toLowerCase()}`
      : `command:${skillName.toLowerCase()}`;

  const skill = state.skills[key];
  if (skill) {
    skill.commit = commit;
    saveLocalState(state, cwd);
  }
}

export function getAllLocalSkills(cwd?: string): LocalState | null {
  return loadLocalState(cwd);
}

export function findLocalSkillInstallations(
  skillName: string,
  installableType: InstallableType,
  cwd?: string,
): SkillInstallation[] {
  const installations: SkillInstallation[] = [];
  const basePath = cwd || process.cwd();

  for (const [agentType, agentConfig] of Object.entries(agents)) {
    if (installableType === "skill") {
      const skillsDirPath = join(basePath, agentConfig.skillsDir);

      if (existsSync(skillsDirPath)) {
        try {
          const entries = readdirSync(skillsDirPath, { withFileTypes: true }) as Dirent[];
          const matchingEntry = entries.find((e) => {
            if (e.name.toLowerCase() !== skillName.toLowerCase()) {
              return false;
            }
            if (e.isDirectory()) {
              return true;
            }
            const fullPath = join(skillsDirPath, e.name);
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
              type: "project",
              path: join(agentConfig.skillsDir, matchingEntry.name),
            });
          }
        } catch {}
      }
    } else {
      const commandsDir = agentConfig.commandsDir;
      if (commandsDir) {
        const commandsDirPath = join(basePath, commandsDir);

        if (existsSync(commandsDirPath)) {
          try {
            const entries = readdirSync(commandsDirPath, { withFileTypes: true }) as Dirent[];
            const matchingEntry = entries.find((e) => {
              const baseName = e.name.replace(/\.md$/, "");
              return baseName.toLowerCase() === skillName.toLowerCase();
            });

            if (matchingEntry) {
              installations.push({
                agent: agentType as AgentType,
                installableType: "command",
                type: "project",
                path: join(commandsDir, matchingEntry.name),
              });
            }
          } catch {}
        }
      }
    }
  }

  return installations;
}

export async function cleanOrphanedEntries(cwd?: string): Promise<void> {
  const state = loadLocalState(cwd);
  if (!state) return;

  const orphanedKeys: string[] = [];

  for (const [key, _entry] of Object.entries(state.skills)) {
    const parsed = key.split(":");
    if (parsed.length !== 2) continue;

    const installableType = parsed[0] === "skill" ? "skill" : "command";
    const name = parsed[1]!;
    const installations = findLocalSkillInstallations(name, installableType, cwd);

    if (installations.length === 0) {
      orphanedKeys.push(key);
    }
  }

  for (const key of orphanedKeys) {
    delete state.skills[key];
  }

  if (orphanedKeys.length > 0) {
    if (Object.keys(state.skills).length > 0) {
      saveLocalState(state, cwd);
    } else {
      const statePath = getLocalStatePath(cwd);
      if (existsSync(statePath)) {
        rmSync(statePath, { force: true });
      }
    }
  }
}
