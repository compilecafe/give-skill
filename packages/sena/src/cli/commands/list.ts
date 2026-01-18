import * as p from "@clack/prompts";
import pc from "picocolors";
import { listRemovableSkills } from "@/services/remove";

export async function listCommand() {
  p.intro(pc.bgCyan(pc.black(" sena ")));

  try {
    await listRemovableSkills();
    p.outro(pc.green("Showing all installed skills"));
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("Couldn't list skills"));
    process.exit(1);
  }
}
