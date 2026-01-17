import * as p from "@clack/prompts";
import pc from "picocolors";
import { performInstallation } from "@/services/install";

export interface InstallOptions {
  global?: boolean;
  agent?: string[];
  yes?: boolean;
  skill?: string[];
  list?: boolean;
}

export async function installCommand(source: string, options: InstallOptions) {
  p.intro(pc.bgCyan(pc.black(" give-skill ")));

  try {
    const result = await performInstallation(source, options);

    if (!result.success && result.installed === 0 && result.failed === 0) {
      process.exit(1);
    }

    if (result.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Unknown error occurred");
    p.outro(pc.red("Installation failed"));
    process.exit(1);
  }
}
