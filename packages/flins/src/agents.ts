import { existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

const home = homedir();
const configHome = process.env.XDG_CONFIG_HOME?.trim() || join(home, ".config");

export const universalProjectSkillsDir = ".agents/skills";

export type AgentScope = "project" | "global";

export interface AgentConfig {
  label: string;
  skillsDir: string;
  globalSkillsDir: string;
  commandsDir?: string;
  globalCommandsDir?: string;
  detectInstalled: () => boolean;
}

function defineAgents<T extends Record<string, AgentConfig>>(value: T) {
  return value;
}

export const agents = defineAgents({
  amp: {
    label: "Amp",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: () => existsSync(join(configHome, "amp")) || existsSync(join(home, ".amp")),
  },
  antigravity: {
    label: "Antigravity",
    skillsDir: ".agent/skills",
    globalSkillsDir: join(home, ".gemini/antigravity/skills"),
    detectInstalled: () => existsSync(join(home, ".gemini/antigravity")),
  },
  augment: {
    label: "Augment",
    skillsDir: ".augment/skills",
    globalSkillsDir: join(home, ".augment/skills"),
    detectInstalled: () => existsSync(join(home, ".augment")),
  },
  "claude-code": {
    label: "Claude Code",
    skillsDir: ".claude/skills",
    globalSkillsDir: join(process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude"), "skills"),
    commandsDir: ".claude/commands",
    globalCommandsDir: join(
      process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude"),
      "commands",
    ),
    detectInstalled: () =>
      existsSync(process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude")),
  },
  openclaw: {
    label: "OpenClaw",
    skillsDir: "skills",
    globalSkillsDir: join(home, ".openclaw/skills"),
    detectInstalled: () => existsSync(join(home, ".openclaw")),
  },
  cline: {
    label: "Cline",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(home, ".agents/skills"),
    detectInstalled: () => existsSync(join(home, ".cline")),
  },
  codebuddy: {
    label: "CodeBuddy",
    skillsDir: ".codebuddy/skills",
    globalSkillsDir: join(home, ".codebuddy/skills"),
    detectInstalled: () =>
      existsSync(join(process.cwd(), ".codebuddy")) || existsSync(join(home, ".codebuddy")),
  },
  codex: {
    label: "Codex",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(process.env.CODEX_HOME?.trim() || join(home, ".codex"), "skills"),
    detectInstalled: () =>
      existsSync(process.env.CODEX_HOME?.trim() || join(home, ".codex")) ||
      existsSync("/etc/codex"),
  },
  "command-code": {
    label: "Command Code",
    skillsDir: ".commandcode/skills",
    globalSkillsDir: join(home, ".commandcode/skills"),
    detectInstalled: () => existsSync(join(home, ".commandcode")),
  },
  continue: {
    label: "Continue",
    skillsDir: ".continue/skills",
    globalSkillsDir: join(home, ".continue/skills"),
    detectInstalled: () =>
      existsSync(join(process.cwd(), ".continue")) || existsSync(join(home, ".continue")),
  },
  cortex: {
    label: "Cortex Code",
    skillsDir: ".cortex/skills",
    globalSkillsDir: join(home, ".snowflake/cortex/skills"),
    detectInstalled: () => existsSync(join(home, ".snowflake/cortex")),
  },
  crush: {
    label: "Crush",
    skillsDir: ".crush/skills",
    globalSkillsDir: join(configHome, "crush/skills"),
    detectInstalled: () => existsSync(join(configHome, "crush")),
  },
  cursor: {
    label: "Cursor",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(home, ".cursor/skills"),
    detectInstalled: () => existsSync(join(home, ".cursor")),
  },
  droid: {
    label: "Droid",
    skillsDir: ".factory/skills",
    globalSkillsDir: join(home, ".factory/skills"),
    commandsDir: ".factory/commands",
    globalCommandsDir: join(home, ".factory/commands"),
    detectInstalled: () => existsSync(join(home, ".factory")),
  },
  "gemini-cli": {
    label: "Gemini CLI",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(home, ".gemini/skills"),
    detectInstalled: () => existsSync(join(home, ".gemini")),
  },
  "github-copilot": {
    label: "GitHub Copilot",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(home, ".copilot/skills"),
    detectInstalled: () => existsSync(join(home, ".copilot")),
  },
  goose: {
    label: "Goose",
    skillsDir: ".goose/skills",
    globalSkillsDir: join(configHome, "goose/skills"),
    detectInstalled: () =>
      existsSync(join(configHome, "goose")) || existsSync(join(home, ".goose")),
  },
  junie: {
    label: "Junie",
    skillsDir: ".junie/skills",
    globalSkillsDir: join(home, ".junie/skills"),
    detectInstalled: () => existsSync(join(home, ".junie")),
  },
  "iflow-cli": {
    label: "iFlow CLI",
    skillsDir: ".iflow/skills",
    globalSkillsDir: join(home, ".iflow/skills"),
    detectInstalled: () => existsSync(join(home, ".iflow")),
  },
  kilo: {
    label: "Kilo Code",
    skillsDir: ".kilocode/skills",
    globalSkillsDir: join(home, ".kilocode/skills"),
    detectInstalled: () => existsSync(join(home, ".kilocode")),
  },
  "kimi-cli": {
    label: "Kimi Code CLI",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: () => existsSync(join(home, ".kimi")),
  },
  "kiro-cli": {
    label: "Kiro CLI",
    skillsDir: ".kiro/skills",
    globalSkillsDir: join(home, ".kiro/skills"),
    detectInstalled: () => existsSync(join(home, ".kiro")),
  },
  kode: {
    label: "Kode",
    skillsDir: ".kode/skills",
    globalSkillsDir: join(home, ".kode/skills"),
    detectInstalled: () => existsSync(join(home, ".kode")),
  },
  letta: {
    label: "Letta",
    skillsDir: ".skills",
    globalSkillsDir: join(home, ".letta/skills"),
    detectInstalled: () => existsSync(join(home, ".letta")),
  },
  mcpjam: {
    label: "MCPJam",
    skillsDir: ".mcpjam/skills",
    globalSkillsDir: join(home, ".mcpjam/skills"),
    detectInstalled: () => existsSync(join(home, ".mcpjam")),
  },
  "mistral-vibe": {
    label: "Mistral Vibe",
    skillsDir: ".vibe/skills",
    globalSkillsDir: join(home, ".vibe/skills"),
    detectInstalled: () => existsSync(join(home, ".vibe")),
  },
  mux: {
    label: "Mux",
    skillsDir: ".mux/skills",
    globalSkillsDir: join(home, ".mux/skills"),
    detectInstalled: () => existsSync(join(home, ".mux")),
  },
  opencode: {
    label: "OpenCode",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(configHome, "opencode/skills"),
    commandsDir: ".opencode/commands",
    globalCommandsDir: join(configHome, "opencode/commands"),
    detectInstalled: () => existsSync(join(configHome, "opencode")),
  },
  openhands: {
    label: "OpenHands",
    skillsDir: ".openhands/skills",
    globalSkillsDir: join(home, ".openhands/skills"),
    detectInstalled: () => existsSync(join(home, ".openhands")),
  },
  pi: {
    label: "Pi",
    skillsDir: ".pi/skills",
    globalSkillsDir: join(home, ".pi/agent/skills"),
    detectInstalled: () => existsSync(join(home, ".pi/agent")),
  },
  qoder: {
    label: "Qoder",
    skillsDir: ".qoder/skills",
    globalSkillsDir: join(home, ".qoder/skills"),
    detectInstalled: () => existsSync(join(home, ".qoder")),
  },
  "qwen-code": {
    label: "Qwen Code",
    skillsDir: ".qwen/skills",
    globalSkillsDir: join(home, ".qwen/skills"),
    detectInstalled: () => existsSync(join(home, ".qwen")),
  },
  replit: {
    label: "Replit",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: () => existsSync(join(process.cwd(), ".replit")),
  },
  roo: {
    label: "Roo Code",
    skillsDir: ".roo/skills",
    globalSkillsDir: join(home, ".roo/skills"),
    detectInstalled: () => existsSync(join(home, ".roo")),
  },
  trae: {
    label: "Trae",
    skillsDir: ".trae/skills",
    globalSkillsDir: join(home, ".trae/skills"),
    detectInstalled: () => existsSync(join(home, ".trae")),
  },
  "trae-cn": {
    label: "Trae CN",
    skillsDir: ".trae/skills",
    globalSkillsDir: join(home, ".trae-cn/skills"),
    detectInstalled: () => existsSync(join(home, ".trae-cn")),
  },
  windsurf: {
    label: "Windsurf",
    skillsDir: ".windsurf/skills",
    globalSkillsDir: join(home, ".codeium/windsurf/skills"),
    detectInstalled: () =>
      existsSync(join(home, ".codeium/windsurf")) || existsSync(join(home, ".windsurf")),
  },
  zencoder: {
    label: "Zencoder",
    skillsDir: ".zencoder/skills",
    globalSkillsDir: join(home, ".zencoder/skills"),
    detectInstalled: () => existsSync(join(home, ".zencoder")),
  },
  neovate: {
    label: "Neovate",
    skillsDir: ".neovate/skills",
    globalSkillsDir: join(home, ".neovate/skills"),
    detectInstalled: () => existsSync(join(home, ".neovate")),
  },
  pochi: {
    label: "Pochi",
    skillsDir: ".pochi/skills",
    globalSkillsDir: join(home, ".pochi/skills"),
    detectInstalled: () => existsSync(join(home, ".pochi")),
  },
  adal: {
    label: "AdaL",
    skillsDir: ".adal/skills",
    globalSkillsDir: join(home, ".adal/skills"),
    detectInstalled: () => existsSync(join(home, ".adal")),
  },
  universal: {
    label: "Universal",
    skillsDir: universalProjectSkillsDir,
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: () => false,
  },
});

export type AgentName = keyof typeof agents;

export function getAgentNames() {
  return Object.keys(agents) as AgentName[];
}

export function getCommandAgents() {
  return getAgentNames().filter((agent) => {
    const config: AgentConfig = agents[agent];
    return Boolean(config.commandsDir);
  });
}

export function getUniversalAgents() {
  return getAgentNames().filter((agent) => agents[agent].skillsDir === universalProjectSkillsDir);
}

export function getNonUniversalAgents() {
  const universal = new Set(getUniversalAgents());
  return getAgentNames().filter((agent) => !universal.has(agent));
}

export function getSupportedAgentSummary() {
  return `OpenCode, Claude Code, Codex, Cursor, and ${getAgentNames().length - 4} more`;
}

export function formatAgentPath(path: string) {
  return path.replace(home, "~");
}

export function normalizeAgentNames(values: string[]) {
  const normalized: AgentName[] = [];
  const invalid: string[] = [];
  const seen = new Set<AgentName>();

  for (const value of values) {
    const agent = value.trim().toLowerCase() as AgentName;
    if (!(agent in agents)) {
      invalid.push(value);
      continue;
    }

    if (seen.has(agent)) {
      continue;
    }

    seen.add(agent);
    normalized.push(agent);
  }

  return { agents: normalized, invalid };
}

export function supportsCommands(agent: AgentName) {
  const config: AgentConfig = agents[agent];
  return Boolean(config.commandsDir);
}

export function detectInstalledAgents() {
  return getAgentNames().filter((agent) => agents[agent].detectInstalled());
}

function expandHome(path: string) {
  if (path.startsWith("~")) {
    return path.replace("~", home);
  }

  if (platform() === "win32" && path.startsWith("%USERPROFILE%")) {
    return path.replace("%USERPROFILE%", home);
  }

  return path;
}

export function resolveAgentSkillsDir(
  agent: AgentName,
  scope: AgentScope,
  cwd: string = process.cwd(),
) {
  const path = scope === "global" ? agents[agent].globalSkillsDir : agents[agent].skillsDir;
  return scope === "global" ? expandHome(path) : join(cwd, path);
}

export function resolveAgentCommandsDir(
  agent: AgentName,
  scope: AgentScope,
  cwd: string = process.cwd(),
) {
  const config: AgentConfig = agents[agent];
  const path = scope === "global" ? config.globalCommandsDir : config.commandsDir;
  if (!path) {
    return null;
  }

  return scope === "global" ? expandHome(path) : join(cwd, path);
}

export function getSharedDirectoryNotes(selectedAgents: AgentName[], scope: AgentScope) {
  const selected = new Set(selectedAgents);
  const groups = new Map<string, AgentName[]>();

  for (const agent of getAgentNames()) {
    const path = scope === "global" ? agents[agent].globalSkillsDir : agents[agent].skillsDir;
    const grouped = groups.get(path) ?? [];
    grouped.push(agent);
    groups.set(path, grouped);
  }

  return Array.from(groups.entries())
    .filter(([, grouped]) => grouped.length > 1 && grouped.some((agent) => selected.has(agent)))
    .map(
      ([path, grouped]) =>
        `${formatAgentPath(path)} is shared by ${grouped.map((agent) => agents[agent].label).join(", ")}`,
    );
}
