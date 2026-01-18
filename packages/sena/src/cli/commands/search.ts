import * as p from "@clack/prompts";
import pc from "picocolors";
import { listDirectory, type DirectoryEntry } from "@/services/directory";

export async function searchCommand() {
  p.intro(pc.bgCyan(pc.black(" sena ")));

  try {
    const spinner = p.spinner();

    spinner.start("Loading skill directory...");
    const entries = await listDirectory();
    spinner.stop("Directory loaded");

    if (entries.length === 0) {
      p.log.warn("No skills found in directory");
      p.outro("Check back later for new skills");
      return;
    }

    const selected = await p.autocompleteMultiselect({
      message: "Select a skill to view details:",
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

    const selectedName = Array.isArray(selected) && selected.length > 0 ? selected[0] : selected;
    if (!selectedName) {
      p.cancel("No selection made");
      return;
    }

    const entry = entries.find((e) => e.name === selectedName);
    if (!entry) return;

    showEntryDetails(entry);

    const install = await p.confirm({
      message: "Install this skill?",
    });

    if (p.isCancel(install) || !install) {
      p.outro("Install anytime with " + pc.green(`sena add ${entry.name}`));
      return;
    }

    const { installCommand } = await import("@/cli/commands/install");
    await installCommand(entry.name, {});
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : "Failed to fetch directory");
    p.outro(pc.red("Couldn't load directory"));
    process.exit(1);
  }
}

function showEntryDetails(entry: DirectoryEntry) {
  p.log.step(pc.bold("Skill Details"));

  p.log.message(`${pc.cyan(entry.name)}`);
  p.log.message(`  ${pc.dim(entry.description)}`);

  if (entry.tags.length > 0) {
    p.log.message(`  ${pc.bold("Tags:")} ${entry.tags.map((t) => pc.green(t)).join(", ")}`);
  }

  p.log.message(`  ${pc.bold("Author:")} ${pc.yellow(entry.author)}`);
  p.log.message(`  ${pc.bold("Source:")} ${pc.dim(entry.source)}`);
  p.log.message(`  ${pc.dim("Install with:")} ${pc.green(`sena add ${entry.name}`)}`);
}
