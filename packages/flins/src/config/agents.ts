import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import {
  AGENT_TYPES,
  type AgentConfig,
  type AgentDirectoryGroup,
  type AgentType,
} from "@/types/agents";

const home = homedir();
const configHome = process.env.XDG_CONFIG_HOME?.trim() || join(home, ".config");
const codexHome = process.env.CODEX_HOME?.trim() || join(home, ".codex");
const claudeHome = process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude");

export const agents: Record<AgentType, AgentConfig> = {
  amp: {
    name: "amp",
    displayName: "Amp",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: async () => {
      return existsSync(join(configHome, "amp")) || existsSync(join(home, ".amp"));
    },
  },
  antigravity: {
    name: "antigravity",
    displayName: "Antigravity",
    skillsDir: ".agent/skills",
    globalSkillsDir: join(home, ".gemini/antigravity/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".gemini/antigravity"));
    },
  },
  augment: {
    name: "augment",
    displayName: "Augment",
    skillsDir: ".augment/skills",
    globalSkillsDir: join(home, ".augment/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".augment"));
    },
  },
  "claude-code": {
    name: "claude-code",
    displayName: "Claude Code",
    skillsDir: ".claude/skills",
    globalSkillsDir: join(claudeHome, "skills"),
    commandsDir: ".claude/commands",
    globalCommandsDir: join(claudeHome, "commands"),
    detectInstalled: async () => {
      return existsSync(claudeHome);
    },
  },
  openclaw: {
    name: "openclaw",
    displayName: "OpenClaw",
    skillsDir: "skills",
    globalSkillsDir: join(home, ".openclaw/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".openclaw"));
    },
  },
  cline: {
    name: "cline",
    displayName: "Cline",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(home, ".agents/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".cline"));
    },
  },
  codebuddy: {
    name: "codebuddy",
    displayName: "CodeBuddy",
    skillsDir: ".codebuddy/skills",
    globalSkillsDir: join(home, ".codebuddy/skills"),
    detectInstalled: async () => {
      return existsSync(join(process.cwd(), ".codebuddy")) || existsSync(join(home, ".codebuddy"));
    },
  },
  codex: {
    name: "codex",
    displayName: "Codex",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(codexHome, "skills"),
    detectInstalled: async () => {
      return existsSync(codexHome) || existsSync("/etc/codex");
    },
  },
  "command-code": {
    name: "command-code",
    displayName: "Command Code",
    skillsDir: ".commandcode/skills",
    globalSkillsDir: join(home, ".commandcode/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".commandcode"));
    },
  },
  continue: {
    name: "continue",
    displayName: "Continue",
    skillsDir: ".continue/skills",
    globalSkillsDir: join(home, ".continue/skills"),
    detectInstalled: async () => {
      return existsSync(join(process.cwd(), ".continue")) || existsSync(join(home, ".continue"));
    },
  },
  cortex: {
    name: "cortex",
    displayName: "Cortex Code",
    skillsDir: ".cortex/skills",
    globalSkillsDir: join(home, ".snowflake/cortex/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".snowflake/cortex"));
    },
  },
  crush: {
    name: "crush",
    displayName: "Crush",
    skillsDir: ".crush/skills",
    globalSkillsDir: join(configHome, "crush/skills"),
    detectInstalled: async () => {
      return existsSync(join(configHome, "crush"));
    },
  },
  cursor: {
    name: "cursor",
    displayName: "Cursor",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(home, ".cursor/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".cursor"));
    },
  },
  droid: {
    name: "droid",
    displayName: "Droid",
    skillsDir: ".factory/skills",
    globalSkillsDir: join(home, ".factory/skills"),
    commandsDir: ".factory/commands",
    globalCommandsDir: join(home, ".factory/commands"),
    detectInstalled: async () => {
      return existsSync(join(home, ".factory"));
    },
  },
  "gemini-cli": {
    name: "gemini-cli",
    displayName: "Gemini CLI",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(home, ".gemini/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".gemini"));
    },
  },
  "github-copilot": {
    name: "github-copilot",
    displayName: "GitHub Copilot",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(home, ".copilot/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".copilot"));
    },
  },
  goose: {
    name: "goose",
    displayName: "Goose",
    skillsDir: ".goose/skills",
    globalSkillsDir: join(configHome, "goose/skills"),
    detectInstalled: async () => {
      return existsSync(join(configHome, "goose")) || existsSync(join(home, ".goose"));
    },
  },
  junie: {
    name: "junie",
    displayName: "Junie",
    skillsDir: ".junie/skills",
    globalSkillsDir: join(home, ".junie/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".junie"));
    },
  },
  "iflow-cli": {
    name: "iflow-cli",
    displayName: "iFlow CLI",
    skillsDir: ".iflow/skills",
    globalSkillsDir: join(home, ".iflow/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".iflow"));
    },
  },
  kilo: {
    name: "kilo",
    displayName: "Kilo Code",
    skillsDir: ".kilocode/skills",
    globalSkillsDir: join(home, ".kilocode/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".kilocode"));
    },
  },
  "kimi-cli": {
    name: "kimi-cli",
    displayName: "Kimi Code CLI",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".kimi"));
    },
  },
  "kiro-cli": {
    name: "kiro-cli",
    displayName: "Kiro CLI",
    skillsDir: ".kiro/skills",
    globalSkillsDir: join(home, ".kiro/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".kiro"));
    },
  },
  kode: {
    name: "kode",
    displayName: "Kode",
    skillsDir: ".kode/skills",
    globalSkillsDir: join(home, ".kode/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".kode"));
    },
  },
  letta: {
    name: "letta",
    displayName: "Letta",
    skillsDir: ".skills",
    globalSkillsDir: join(home, ".letta/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".letta"));
    },
  },
  mcpjam: {
    name: "mcpjam",
    displayName: "MCPJam",
    skillsDir: ".mcpjam/skills",
    globalSkillsDir: join(home, ".mcpjam/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".mcpjam"));
    },
  },
  "mistral-vibe": {
    name: "mistral-vibe",
    displayName: "Mistral Vibe",
    skillsDir: ".vibe/skills",
    globalSkillsDir: join(home, ".vibe/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".vibe"));
    },
  },
  mux: {
    name: "mux",
    displayName: "Mux",
    skillsDir: ".mux/skills",
    globalSkillsDir: join(home, ".mux/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".mux"));
    },
  },
  opencode: {
    name: "opencode",
    displayName: "OpenCode",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(configHome, "opencode/skills"),
    commandsDir: ".opencode/commands",
    globalCommandsDir: join(configHome, "opencode/commands"),
    detectInstalled: async () => {
      return existsSync(join(configHome, "opencode"));
    },
  },
  openhands: {
    name: "openhands",
    displayName: "OpenHands",
    skillsDir: ".openhands/skills",
    globalSkillsDir: join(home, ".openhands/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".openhands"));
    },
  },
  pi: {
    name: "pi",
    displayName: "Pi",
    skillsDir: ".pi/skills",
    globalSkillsDir: join(home, ".pi/agent/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".pi/agent"));
    },
  },
  qoder: {
    name: "qoder",
    displayName: "Qoder",
    skillsDir: ".qoder/skills",
    globalSkillsDir: join(home, ".qoder/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".qoder"));
    },
  },
  "qwen-code": {
    name: "qwen-code",
    displayName: "Qwen Code",
    skillsDir: ".qwen/skills",
    globalSkillsDir: join(home, ".qwen/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".qwen"));
    },
  },
  replit: {
    name: "replit",
    displayName: "Replit",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: async () => {
      return existsSync(join(process.cwd(), ".replit"));
    },
  },
  roo: {
    name: "roo",
    displayName: "Roo Code",
    skillsDir: ".roo/skills",
    globalSkillsDir: join(home, ".roo/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".roo"));
    },
  },
  trae: {
    name: "trae",
    displayName: "Trae",
    skillsDir: ".trae/skills",
    globalSkillsDir: join(home, ".trae/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".trae"));
    },
  },
  "trae-cn": {
    name: "trae-cn",
    displayName: "Trae CN",
    skillsDir: ".trae/skills",
    globalSkillsDir: join(home, ".trae-cn/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".trae-cn"));
    },
  },
  windsurf: {
    name: "windsurf",
    displayName: "Windsurf",
    skillsDir: ".windsurf/skills",
    globalSkillsDir: join(home, ".codeium/windsurf/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".codeium/windsurf")) || existsSync(join(home, ".windsurf"));
    },
  },
  zencoder: {
    name: "zencoder",
    displayName: "Zencoder",
    skillsDir: ".zencoder/skills",
    globalSkillsDir: join(home, ".zencoder/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".zencoder"));
    },
  },
  neovate: {
    name: "neovate",
    displayName: "Neovate",
    skillsDir: ".neovate/skills",
    globalSkillsDir: join(home, ".neovate/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".neovate"));
    },
  },
  pochi: {
    name: "pochi",
    displayName: "Pochi",
    skillsDir: ".pochi/skills",
    globalSkillsDir: join(home, ".pochi/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".pochi"));
    },
  },
  adal: {
    name: "adal",
    displayName: "AdaL",
    skillsDir: ".adal/skills",
    globalSkillsDir: join(home, ".adal/skills"),
    detectInstalled: async () => {
      return existsSync(join(home, ".adal"));
    },
  },
  universal: {
    name: "universal",
    displayName: "Universal",
    skillsDir: ".agents/skills",
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: async () => false,
  },
};

const agentNameMap = new Map<string, AgentType>();

for (const type of AGENT_TYPES) {
  agentNameMap.set(type, type);
}

export function getAgentEntries(): Array<[AgentType, AgentConfig]> {
  return AGENT_TYPES.map((type) => [type, agents[type]]);
}

export function getAgentNames(): AgentType[] {
  return [...AGENT_TYPES];
}

export function getAgentDisplayName(type: AgentType): string {
  return agents[type].displayName;
}

export function formatAgentPath(path: string): string {
  return path.replace(home, "~");
}

export function normalizeAgentName(name: string): AgentType | null {
  return agentNameMap.get(name.trim().toLowerCase()) ?? null;
}

export function normalizeAgentNames(names: string[]): { agents: AgentType[]; invalid: string[] } {
  const selectedAgents: AgentType[] = [];
  const invalid: string[] = [];
  const seen = new Set<AgentType>();

  for (const name of names) {
    const agent = normalizeAgentName(name);

    if (!agent) {
      invalid.push(name);
      continue;
    }

    if (seen.has(agent)) {
      continue;
    }

    seen.add(agent);
    selectedAgents.push(agent);
  }

  return { agents: selectedAgents, invalid };
}

export function getAgentDirectoryGroups(scope: "project" | "global"): AgentDirectoryGroup[] {
  const groups = new Map<string, AgentType[]>();

  for (const type of AGENT_TYPES) {
    const path = scope === "project" ? agents[type].skillsDir : agents[type].globalSkillsDir;
    const existing = groups.get(path) ?? [];
    existing.push(type);
    groups.set(path, existing);
  }

  return Array.from(groups.entries()).map(([path, groupAgents]) => ({
    path,
    agents: groupAgents,
  }));
}

export function getSharedAgentDirectoryNotes(
  selectedAgents: AgentType[],
  scope: "project" | "global",
): string[] {
  const selected = new Set(selectedAgents);

  return getAgentDirectoryGroups(scope)
    .filter((group) => group.agents.length > 1 && group.agents.some((agent) => selected.has(agent)))
    .map(
      (group) =>
        `${formatAgentPath(group.path)} is shared by ${group.agents.map((agent) => agents[agent].displayName).join(", ")}`,
    );
}

export function getAgentOptionHint(agent: AgentType): string {
  const config = agents[agent];
  const isShared = getAgentDirectoryGroups("project").some(
    (group) => group.path === config.skillsDir && group.agents.length > 1,
  );

  return `project: ${config.skillsDir}${isShared ? " shared" : ""}`;
}

export function getSupportedAgentSummary(): string {
  return `OpenCode, Claude Code, Codex, Cursor, and ${AGENT_TYPES.length - 4} more`;
}
