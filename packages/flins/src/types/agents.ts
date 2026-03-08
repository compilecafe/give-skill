export const AGENT_TYPES = [
  "amp",
  "antigravity",
  "augment",
  "claude-code",
  "openclaw",
  "cline",
  "codebuddy",
  "codex",
  "command-code",
  "continue",
  "cortex",
  "crush",
  "cursor",
  "droid",
  "gemini-cli",
  "github-copilot",
  "goose",
  "junie",
  "iflow-cli",
  "kilo",
  "kimi-cli",
  "kiro-cli",
  "kode",
  "letta",
  "mcpjam",
  "mistral-vibe",
  "mux",
  "opencode",
  "openhands",
  "pi",
  "qoder",
  "qwen-code",
  "replit",
  "roo",
  "trae",
  "trae-cn",
  "windsurf",
  "zencoder",
  "neovate",
  "pochi",
  "adal",
  "universal",
] as const;

export type AgentType = (typeof AGENT_TYPES)[number];

export interface AgentConfig {
  name: AgentType;
  displayName: string;
  skillsDir: string;
  globalSkillsDir: string;
  commandsDir?: string;
  globalCommandsDir?: string;
  detectInstalled: () => Promise<boolean>;
}

export interface AgentDirectoryGroup {
  path: string;
  agents: AgentType[];
}
