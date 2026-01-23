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
  | "letta"
  | "qoder"
  | "qwen"
  | "clawdbot"
  | "kiro"
  | "openhands"
  | "zencoder"
  | "neovate"
  | "commandcode"
    | "pi"
  | "codebuddy";

export interface AgentConfig {
  name: string;
  displayName: string;
  skillsDir: string;
  globalSkillsDir: string;
  commandsDir?: string;
  globalCommandsDir?: string;
  installDir: string;
  detectInstalled: () => Promise<boolean>;
}
