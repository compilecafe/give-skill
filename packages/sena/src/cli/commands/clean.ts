import * as p from "@clack/prompts";
import pc from "picocolors";
import { cleanOrphaned } from "@/services/update";

export async function cleanCommand() {
  p.intro(pc.bgCyan(pc.black(" sena ")));

  try {
    await cleanOrphaned();
    p.outro(pc.green("State cleaned up"));
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("Cleanup failed"));
    process.exit(1);
  }
}
