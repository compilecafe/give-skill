import * as p from "@clack/prompts";
import pc from "picocolors";
import { performInstallation } from "@/services/install";
import { isDirectoryName, resolveSourceFromDirectory, listDirectory } from "@/services/directory";

export interface InstallOptions {
  global?: boolean;
  agent?: string[];
  yes?: boolean;
  skill?: string[];
  list?: boolean;
}

export async function installCommand(source: string, options: InstallOptions) {
  p.intro(pc.bgCyan(pc.black(" sena ")));

  try {
    let resolvedSource = source;

    if (isDirectoryName(source)) {
      p.log.info(`Looking up "${pc.cyan(source)}" in sena directory...`);
      const directorySource = await resolveSourceFromDirectory(source);

      if (!directorySource) {
        p.log.error(`Directory entry "${pc.cyan(source)}" not found.`);

        const directory = await listDirectory();
        if (directory.length > 0) {
          p.log.info("Available directory entries:");
          for (const entry of directory) {
            p.log.message(`  ${pc.cyan(entry.name)} - ${pc.dim(entry.description)}`);
          }
        }
        process.exit(1);
      }

      resolvedSource = directorySource;
      p.log.success(`Found: ${pc.cyan(resolvedSource)}`);
    }

    const result = await performInstallation(resolvedSource, options);

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
