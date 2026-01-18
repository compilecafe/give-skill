export interface Skill {
  name: string;
  description: string;
  path: string;
  metadata?: Record<string, string>;
}

export interface ParsedSource {
  type: "github" | "gitlab" | "git";
  url: string;
  subpath?: string;
  branch?: string;
}
