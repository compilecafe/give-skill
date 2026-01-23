export type InstallableType = "skill" | "command";

export interface Skill {
  name: string;
  description: string;
  path: string;
  metadata?: Record<string, string>;
}

export interface Installable {
  type: InstallableType;
  item: Skill | import("./commands").Command;
}

export interface ParsedSource {
  type: "github" | "gitlab" | "git";
  url: string;
  subpath?: string;
  branch?: string;
}

export interface WellKnownSkillEntry {
  name: string;
  description: string;
  files: string[];
}

export interface WellKnownSkillIndex {
  skills: WellKnownSkillEntry[];
}
