import * as p from "@clack/prompts";
import pc from "picocolors";
import { performRemove } from "@/services/remove";

export interface RemoveOptions {
  yes?: boolean;
}

export async function removeCommand(skills: string[], options: RemoveOptions) {
  p.intro(pc.bgCyan(pc.black(" sena ")));

  try {
    await performRemove(skills, options);
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("Remove failed"));
    process.exit(1);
  }
}
