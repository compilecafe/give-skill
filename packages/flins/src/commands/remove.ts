import * as p from "@clack/prompts";
import pc from "picocolors";
import { agents } from "@/agents";
import { findInstallations, groupInstallations, removeInstalledPath } from "@/installations";
import { showIntro, showOutro, plural, showNoTrackedItems, getError } from "@/output";
import { removeTrackedItem } from "@/state";
import { scanTracked } from "@/tracked";

export interface RemoveOptions {
  yes?: boolean;
  force?: boolean;
  silent?: boolean;
}

function isAutoConfirm(options: RemoveOptions) {
  return Boolean(options.yes || options.force);
}

export async function handleRemoveCommand(skillNames: string[], options: RemoveOptions) {
  showIntro(Boolean(options.silent));

  try {
    const scanned = scanTracked(skillNames.length > 0 ? skillNames : undefined);
    const removable = scanned.filter((item) => item.validInstallations.length > 0);

    if (scanned.length === 0) {
      if (skillNames.length > 0) {
        p.log.error(`No matching tracked items found for: ${skillNames.join(", ")}`);
      } else {
        showNoTrackedItems();
      }
      showOutro(pc.yellow("Nothing to remove"), Boolean(options.silent));
      return;
    }

    if (removable.length === 0) {
      p.log.warn("No valid installations found to remove.");
      showOutro(pc.yellow("Nothing to remove"), Boolean(options.silent));
      return;
    }

    let selectedIds = removable.map((item) => item.id);

    if (!isAutoConfirm(options) && skillNames.length === 0) {
      const selected = await p.multiselect<string>({
        message: "Choose items to remove",
        required: true,
        initialValues: selectedIds,
        options: removable.map((item) => {
          const installations = groupInstallations(item.validInstallations).length;
          return {
            value: item.id,
            label: `${item.tracked.type}:${item.tracked.name}`,
            hint: `${installations} ${plural(installations, "installation")} • ${item.tracked.scope}`,
          };
        }),
      });

      if (p.isCancel(selected)) {
        p.cancel("Remove cancelled");
        return;
      }

      selectedIds = selected as string[];
    }

    const selected = removable.filter((item) => selectedIds.includes(item.id));
    if (selected.length === 0) {
      p.log.info("Nothing selected.");
      showOutro(pc.yellow("Nothing removed"), Boolean(options.silent));
      return;
    }

    p.log.step(pc.bold("Will Remove"));
    for (const item of selected) {
      p.log.message(
        `  ${pc.cyan(`${item.tracked.type}:${item.tracked.name}`)} ${pc.dim(`(${item.validInstallations.map((installation) => agents[installation.agent].label).join(", ")})`)}`,
      );
    }

    if (!isAutoConfirm(options)) {
      const confirmed = await p.confirm({ message: "Remove selected items?" });
      if (p.isCancel(confirmed) || !confirmed) {
        p.cancel("Remove cancelled");
        return;
      }
    }

    const spinner = p.spinner();
    spinner.start("Removing...");

    let removed = 0;
    let failed = 0;

    for (const item of selected) {
      for (const installation of groupInstallations(item.validInstallations)) {
        const outcome = removeInstalledPath(installation.path);
        if (outcome.success) {
          removed += 1;
        } else {
          failed += 1;
          p.log.error(`${item.tracked.type}:${item.tracked.name} → ${outcome.error}`);
        }
      }

      if (
        findInstallations(item.tracked.name, item.tracked.type, item.tracked.scope).length === 0
      ) {
        removeTrackedItem(item.tracked.scope, item.tracked.name, item.tracked.type);
      }
    }

    spinner.stop("Remove complete");

    if (removed > 0) {
      p.log.success(pc.green(`Removed ${removed} ${plural(removed, "installation")}.`));
    }

    if (failed > 0) {
      showOutro(pc.red("Remove finished with errors"), Boolean(options.silent));
      process.exit(1);
    }

    showOutro(pc.green("Done! Items removed."), Boolean(options.silent));
  } catch (error) {
    p.log.error(getError(error, "Something went wrong. Try again or check your connection."));
    showOutro(pc.red("Remove failed"), Boolean(options.silent));
    process.exit(1);
  }
}
