export interface Command {
  name: string;
  description?: string;
  path: string;
  type: "markdown";
}

export const COMMANDS_SUPPORT_AGENTS = ["claude-code", "opencode", "droid"] as const;

export type CommandsSupportAgent = (typeof COMMANDS_SUPPORT_AGENTS)[number];

export interface AgentCommandsConfig {
  commandsDir: string;
  globalCommandsDir: string;
}
