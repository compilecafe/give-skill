import * as p from "@clack/prompts";
import pc from "picocolors";

export function showIntro(silent: boolean = false) {
  if (!silent) {
    p.intro(pc.bgCyan(pc.black(" flins ")));
  }
}

export function showOutro(message: string, silent: boolean = false) {
  if (!silent) {
    p.outro(message);
  }
}

export function plural(count: number, singular: string, pluralForm?: string) {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`);
}

export function getError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function showNoTrackedItems() {
  p.log.warn("No skills yet. Install your first skill:");
  p.log.message(`  ${pc.cyan("npx flins@latest add <repo>")}`);
  p.log.message(`  ${pc.cyan("npx flins@latest search")}`);
}
