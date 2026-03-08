import { join, resolve } from "path";
import { existsSync, readdirSync, lstatSync, type Dirent } from "fs";
import { expandHomeDir, getFlinsHomeDir } from "@/utils/paths";
import type { SkillInstallation } from "@/types/state";
import type { AgentType } from "@/types/agents";
import type { InstallableType } from "@/types/skills";
import { agents } from "@/config";

interface FindInstallationsOptions {
  cwd?: string;
  type: "global" | "project";
}

export function skillKey(name: string): string {
  return `skill:${name.toLowerCase()}`;
}

export function commandKey(name: string): string {
  return `command:${name.toLowerCase()}`;
}

export function parseKey(
  key: string,
): { type: "skill" | "command"; name: string; installableType: InstallableType } | null {
  const skillPrefix = "skill:";
  const commandPrefix = "command:";

  if (key.startsWith(skillPrefix)) {
    return {
      type: "skill",
      name: key.slice(skillPrefix.length),
      installableType: "skill" as const,
    };
  }

  if (key.startsWith(commandPrefix)) {
    return {
      type: "command",
      name: key.slice(commandPrefix.length),
      installableType: "command" as const,
    };
  }

  return null;
}

export function findInstallations(
  skillName: string,
  installableType: InstallableType,
  options: FindInstallationsOptions,
): SkillInstallation[] {
  const installations: SkillInstallation[] = [];
  const basePath =
    options.cwd ?? resolve(options.type === "global" ? getFlinsHomeDir() : process.cwd());

  for (const [agentType, agentConfig] of Object.entries(agents)) {
    if (installableType === "skill") {
      const skillsDir =
        options.type === "global" ? agentConfig.globalSkillsDir : agentConfig.skillsDir;
      const skillsDirPath =
        options.type === "global" ? expandHomeDir(skillsDir) : join(basePath, skillsDir);

      if (existsSync(skillsDirPath)) {
        try {
          const entries = readdirSync(skillsDirPath, { withFileTypes: true }) as Dirent[];
          const matchingEntry = entries.find((e) => {
            if (e.name.toLowerCase() !== skillName.toLowerCase()) {
              return false;
            }
            if (e.isDirectory()) {
              return true;
            }
            const fullPath = join(skillsDirPath, e.name);
            try {
              return lstatSync(fullPath).isSymbolicLink();
            } catch {
              return false;
            }
          });

          if (matchingEntry) {
            installations.push({
              agent: agentType as AgentType,
              installableType: "skill",
              type: options.type,
              path: join(skillsDir, matchingEntry.name),
            });
          }
        } catch {}
      }
    } else {
      const commandsDir =
        options.type === "global" ? agentConfig.globalCommandsDir : agentConfig.commandsDir;
      if (commandsDir) {
        const commandsDirPath =
          options.type === "global" ? expandHomeDir(commandsDir) : join(basePath, commandsDir);

        if (existsSync(commandsDirPath)) {
          try {
            const entries = readdirSync(commandsDirPath, { withFileTypes: true }) as Dirent[];
            const matchingEntry = entries.find((e) => {
              const baseName = e.name.replace(/\.md$/, "");
              return baseName.toLowerCase() === skillName.toLowerCase();
            });

            if (matchingEntry) {
              installations.push({
                agent: agentType as AgentType,
                installableType: "command",
                type: options.type,
                path: join(commandsDir, matchingEntry.name),
              });
            }
          } catch {}
        }
      }
    }
  }

  return installations;
}
