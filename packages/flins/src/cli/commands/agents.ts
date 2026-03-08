import * as p from "@clack/prompts";
import pc from "picocolors";
import { agents, formatAgentPath, getAgentDirectoryGroups, getAgentNames } from "@/config";
import type { AgentType } from "@/types/agents";

function formatAgentSpec(agent: AgentType): string {
  return `${agents[agent].displayName} (${pc.cyan(agent)})`;
}

function printDirectoryGroups(scope: "project" | "global", title: string): void {
  p.log.step(pc.bold(title));

  for (const group of getAgentDirectoryGroups(scope)) {
    p.log.message(`  ${pc.cyan(formatAgentPath(group.path))}`);
    p.log.message(`    ${group.agents.map(formatAgentSpec).join(", ")}`);
  }
}

export async function agentsCommand() {
  p.intro(pc.bgCyan(pc.black(" flins ")));

  printDirectoryGroups("project", "Project Skill Folders");
  printDirectoryGroups("global", "Global Skill Folders");

  p.outro(
    pc.green(`Supported agents: ${getAgentNames().length}. Use canonical --agent names only.`),
  );
}
