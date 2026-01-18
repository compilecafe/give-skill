import * as p from "@clack/prompts";
import pc from "picocolors";
import { checkStatus, displayStatus } from "@/services/update";

export interface StatusOptions {
  verbose?: boolean;
}

export async function statusCommand(skills: string[], options: StatusOptions = {}) {
  p.intro(pc.bgCyan(pc.black(" sena ")));

  try {
    const results = await checkStatus(skills.length > 0 ? skills : undefined);
    const verbose = options.verbose || skills.length > 0;
    await displayStatus(results, verbose);
    p.outro(pc.green("All checks complete"));
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("Couldn't check status"));
    process.exit(1);
  }
}
