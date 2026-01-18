import * as p from "@clack/prompts";
import pc from "picocolors";
import { cleanOrphaned } from "@/services/update";

export interface CleanOptions {
  yes?: boolean;
  force?: boolean;
  silent?: boolean;
}

export async function cleanCommand(options: CleanOptions = {}) {
  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sena ")));
  }

  try {
    await cleanOrphaned(options);
    if (!options.silent) {
      p.outro(pc.green("State cleaned up"));
    }
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    if (!options.silent) {
      p.outro(pc.red("Cleanup failed"));
    }
    process.exit(1);
  }
}
