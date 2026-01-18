import * as p from "@clack/prompts";
import pc from "picocolors";

export function showNoSkillsMessage(): void {
  p.log.warn("No skills installed yet. Get started by installing a skill:");
  p.log.message(`  ${pc.cyan("npx sena@latest <repo>")}       # Install in current project`);
  p.log.message(
    `  ${pc.cyan("npx sena@latest <repo> --global")}  # Install globally for all projects`,
  );
  p.log.message(``);
  p.log.message(`  ${pc.dim("Examples:")}`);
  p.log.message(`    ${pc.cyan("npx sena@latest expo")}  # Install from sena directory`);
  p.log.message(`    ${pc.cyan("npx sena@latest search")}            # Browse available skills`);
}

export const Plural = (count: number, singular: string, plural?: string): string => {
  return count === 1 ? singular : (plural ?? `${singular}s`);
};
