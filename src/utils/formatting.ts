import * as p from "@clack/prompts";
import pc from "picocolors";

export function showNoSkillsMessage(): void {
  p.log.warn("No skills tracked. Install skills with:");
  p.log.message(`  ${pc.cyan("give-skill <repo>")}       # Install in current directory`);
  p.log.message(`  ${pc.cyan("give-skill <repo> --global")}  # Install globally`);
}

export const Plural = (count: number, singular: string, plural?: string): string => {
  return count === 1 ? singular : (plural ?? `${singular}s`);
};
