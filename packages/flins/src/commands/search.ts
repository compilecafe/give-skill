import * as p from "@clack/prompts";
import pc from "picocolors";
import { listDirectory } from "@/sources";
import { showIntro, showOutro, plural, getError } from "@/output";
import { handleAddCommand } from "@/commands/add";

export async function handleSearchCommand() {
  showIntro(false);

  try {
    const spinner = p.spinner();
    spinner.start("Loading directory...");
    const entries = await listDirectory();
    spinner.stop("Directory loaded");

    if (entries.length === 0) {
      p.log.warn("The flins directory is empty.");
      showOutro(pc.yellow("Nothing to browse"));
      return;
    }

    const selected = await p.autocompleteMultiselect({
      message: "Choose skills from the flins directory",
      placeholder: "Type to search...",
      options: entries.map((entry) => ({
        value: entry.name,
        label: entry.name,
        hint: entry.author ? `${entry.author} • ${entry.description}` : entry.description,
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel("Search cancelled");
      return;
    }

    const names = Array.isArray(selected) ? selected : [selected];
    if (names.length === 0) {
      p.log.info("Nothing selected.");
      showOutro(pc.yellow("Nothing installed"));
      return;
    }

    for (const name of names) {
      await handleAddCommand(name, { silent: true });
    }

    showOutro(pc.green(`Installed ${names.length} ${plural(names.length, "directory entry")}.`));
  } catch (error) {
    p.log.error(getError(error, "Something went wrong. Try again or check your connection."));
    showOutro(pc.red("Search failed"));
    process.exit(1);
  }
}
