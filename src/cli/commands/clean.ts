import * as p from "@clack/prompts";
import pc from "picocolors";
import { cleanOrphaned } from "../../services/update.js";

export async function cleanCommand() {
  p.intro(pc.bgCyan(pc.black(" give-skill ")));

  try {
    await cleanOrphaned();
    p.outro(pc.green("Done!"));
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("Clean failed"));
    process.exit(1);
  }
}
