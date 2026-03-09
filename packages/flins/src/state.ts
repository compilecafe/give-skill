import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { AgentScope } from "@/agents";
import type { InstallableType } from "@/discovery";

export interface TrackedItem {
  name: string;
  type: InstallableType;
  scope: AgentScope;
  url: string;
  subpath?: string;
  branch: string;
  commit: string;
}

interface StateFile {
  skills?: Record<
    string,
    { name?: string; url: string; subpath?: string; branch: string; commit: string }
  >;
}

const flinsHome = join(homedir(), ".flins");
const stateFileName = "skills.lock";

function getStatePath(scope: AgentScope, cwd: string) {
  return scope === "global" ? join(flinsHome, stateFileName) : join(cwd, stateFileName);
}

function getStateKey(name: string, type: InstallableType) {
  return `${type}:${name.toLowerCase()}`;
}

function parseStateKey(key: string) {
  if (key.startsWith("skill:")) {
    return { name: key.slice("skill:".length), type: "skill" as const };
  }

  if (key.startsWith("command:")) {
    return { name: key.slice("command:".length), type: "command" as const };
  }

  return null;
}

function readState(scope: AgentScope, cwd: string) {
  try {
    const state = JSON.parse(readFileSync(getStatePath(scope, cwd), "utf-8")) as StateFile;
    return typeof state === "object" && state && typeof state.skills === "object" && state.skills
      ? state.skills
      : {};
  } catch {
    return {};
  }
}

function writeState(
  scope: AgentScope,
  items: Record<string, NonNullable<StateFile["skills"]>[string]>,
  cwd: string,
) {
  const path = getStatePath(scope, cwd);

  if (Object.keys(items).length === 0) {
    rmSync(path, { force: true });
    return;
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ skills: items } satisfies StateFile, null, 2));
}

export function listTrackedItems(cwd: string = process.cwd()) {
  const project = readState("project", cwd);
  const global = readState("global", cwd);
  const tracked: TrackedItem[] = [];
  const seen = new Set<string>();

  for (const [key, value] of Object.entries(project)) {
    const parsed = parseStateKey(key);
    if (!parsed) {
      continue;
    }

    tracked.push({
      name: value.name || parsed.name,
      type: parsed.type,
      scope: "project",
      url: value.url,
      subpath: value.subpath,
      branch: value.branch,
      commit: value.commit,
    });

    seen.add(key);
  }

  for (const [key, value] of Object.entries(global)) {
    if (seen.has(key)) {
      continue;
    }

    const parsed = parseStateKey(key);
    if (!parsed) {
      continue;
    }

    tracked.push({
      name: value.name || parsed.name,
      type: parsed.type,
      scope: "global",
      url: value.url,
      subpath: value.subpath,
      branch: value.branch,
      commit: value.commit,
    });
  }

  return tracked;
}

export function trackInstall(item: TrackedItem, cwd: string = process.cwd()) {
  const state = readState(item.scope, cwd);
  const key = getStateKey(item.name, item.type);

  state[key] = {
    name: item.name,
    url: item.url,
    subpath: item.subpath,
    branch: item.branch,
    commit: item.commit,
  };

  writeState(item.scope, state, cwd);
}

export function updateTrackedCommit(
  scope: AgentScope,
  name: string,
  type: InstallableType,
  commit: string,
  cwd: string = process.cwd(),
) {
  const state = readState(scope, cwd);
  const key = getStateKey(name, type);

  if (!state[key]) {
    return;
  }

  state[key].commit = commit;
  writeState(scope, state, cwd);
}

export function removeTrackedItem(
  scope: AgentScope,
  name: string,
  type: InstallableType,
  cwd: string = process.cwd(),
) {
  const state = readState(scope, cwd);
  delete state[getStateKey(name, type)];
  writeState(scope, state, cwd);
}
