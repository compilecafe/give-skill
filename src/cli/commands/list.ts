import * as p from "@clack/prompts";
import pc from "picocolors";
import { listRemovableSkills } from "@/services/remove";

export async function listCommand() {
  p.intro(pc.bgCyan(pc.black(" give-skill ")));

  try {
    await listRemovableSkills();
    p.outro("Done!");
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("List failed"));
    process.exit(1);
  }
}
