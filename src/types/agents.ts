export type AgentType =
  | "opencode"
  | "claude-code"
  | "codex"
  | "cursor"
  | "amp"
  | "kilo"
  | "roo"
  | "goose"
  | "antigravity"
  | "copilot"
  | "gemini"
  | "windsurf"
  | "trae"
  | "factory"
  | "letta";

export interface AgentConfig {
  name: string;
  displayName: string;
  configDir: string;
  skillsDir: string;
  globalSkillsDir: string;
  detectInstalled: () => Promise<boolean>;
}
