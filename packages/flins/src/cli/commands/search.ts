import * as p from "@clack/prompts";
import pc from "picocolors";
import { listDirectory } from "@/services/directory";

export async function searchCommand() {
  p.intro(pc.bgCyan(pc.black(" flins ")));

  try {
    const spinner = p.spinner();

    spinner.start("Browsing skills...");
    const entries = await listDirectory();
    spinner.stop("Directory loaded");

    if (entries.length === 0) {
      p.log.warn("Directory is empty");
      p.outro("New skills coming soon");
      return;
    }

    const selected = await p.autocompleteMultiselect({
      message: "Find a skill:",
      options: entries.map((entry) => ({
        value: entry.name,
        label: entry.name,
        hint: `${entry.author} - ${entry.description.slice(0, 50)}${entry.description.length > 50 ? "..." : ""}`,
      })),
      placeholder: "Type to search...",
    });

    if (p.isCancel(selected)) {
      p.cancel("Search cancelled");
      return;
    }

    const selectedNames = Array.isArray(selected) ? selected : [selected];
    if (selectedNames.length === 0) {
      p.cancel("No selection made");
      return;
    }

    const selectedEntries = entries.filter((e) => selectedNames.includes(e.name));
    if (selectedEntries.length === 0) return;

    p.log.step(pc.bold("Selected Skills"));
    for (const entry of selectedEntries) {
      p.log.message(`  ${pc.cyan(entry.name)} ${pc.dim(`- ${entry.author}`)}`);
    }

    const install = await p.confirm({
      message: `Add ${selectedEntries.length} skill${selectedEntries.length > 1 ? "s" : ""}?`,
    });

    if (p.isCancel(install) || !install) {
      p.outro(
        "Install anytime with:\n" +
          selectedEntries.map((e) => `  ${pc.green(`flins add ${e.name}`)}`).join("\n"),
      );
      return;
    }

    const { installCommand } = await import("@/cli/commands/install");
    for (const entry of selectedEntries) {
      await installCommand(entry.name, {});
    }
  } catch (error) {
    p.log.error(
      error instanceof Error
        ? error.message
        : "Something went wrong. Try again or check your connection.",
    );
    p.outro(pc.red("Couldn't load skill directory"));
    process.exit(1);
  }
}
