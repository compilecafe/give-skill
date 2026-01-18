import * as p from "@clack/prompts";
import pc from "picocolors";
import { performUpdate } from "@/services/update";

export interface UpdateOptions {
  yes?: boolean;
}

export async function updateCommand(skills: string[], options: UpdateOptions) {
  p.intro(pc.bgCyan(pc.black(" sena ")));

  try {
    await performUpdate(skills.length > 0 ? skills : undefined, options);
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("Update failed"));
    process.exit(1);
  }
}
