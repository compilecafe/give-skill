import type { AgentType } from "./agents.js";

export interface SkillInstallation {
  agent: AgentType;
  type: "global" | "project";
  path: string;
}

export interface SkillState {
  url: string;
  subpath?: string;
  branch: string;
  commit: string;
  installations: SkillInstallation[];
}

export interface StateFile {
  lastUpdate: string;
  skills: Record<string, SkillState>;
}

export interface LocalSkillEntry {
  url: string;
  subpath?: string;
  branch: string;
  commit: string;
}

export interface LocalState {
  version: string;
  skills: Record<string, LocalSkillEntry>;
}

export interface Dirent {
  name: string;
  isDirectory(): boolean;
}
