import * as p from "@clack/prompts";
import pc from "picocolors";
import { lstatSync } from "node:fs";
import { agents } from "@/agents";
import { discoverInstallables } from "@/discovery";
import { groupInstallations, installInstallable } from "@/installations";
import { showIntro, showOutro, plural, showNoTrackedItems, getError } from "@/output";
import { cleanupSource, downloadSource } from "@/sources";
import { removeTrackedItem, updateTrackedCommit } from "@/state";
import { hydrateTracked, scanTracked } from "@/tracked";

export interface UpdateOptions {
  yes?: boolean;
  force?: boolean;
  silent?: boolean;
}

export interface OutdatedOptions {
  verbose?: boolean;
  silent?: boolean;
}

function isAutoConfirm(options: UpdateOptions) {
  return Boolean(options.yes || options.force);
}

function printStatus(items: Awaited<ReturnType<typeof hydrateTracked>>, verbose: boolean) {
  if (items.length === 0) {
    showNoTrackedItems();
    return;
  }

  p.log.step(pc.bold("Installed Items"));

  for (const item of items) {
    const icon = {
      latest: pc.green("✓"),
      "update-available": pc.yellow("↓"),
      error: pc.red("✗"),
      orphaned: pc.dim("○"),
    }[item.status];
    const label = {
      latest: pc.green("Up to date"),
      "update-available": pc.yellow("Update available"),
      error: pc.red("Check failed"),
      orphaned: pc.dim("Missing files"),
    }[item.status];

    if (!verbose) {
      p.log.message(
        `${icon} ${pc.cyan(`${item.tracked.type}:${item.tracked.name}`)} ${pc.dim(`- ${label}`)}`,
      );
      continue;
    }

    p.log.message(`${icon} ${pc.cyan(`${item.tracked.type}:${item.tracked.name}`)}`);
    p.log.message(`    Status: ${label}`);

    if (item.status === "update-available") {
      p.log.message(
        `    Commit: ${pc.yellow(item.tracked.commit.slice(0, 7))} ${pc.dim("→")} ${pc.green(item.latestCommit.slice(0, 7))}`,
      );
    } else if (item.tracked.commit) {
      p.log.message(`    Commit: ${item.tracked.commit.slice(0, 7)}`);
    }

    if (item.error) {
      p.log.message(`    ${pc.red(item.error)}`);
    }

    const installedGroups = groupInstallations(item.validInstallations);
    const missingGroups = groupInstallations(item.missingInstallations);

    if (installedGroups.length > 0) {
      p.log.message("    Installed in:");
      for (const installation of installedGroups) {
        p.log.message(
          `      ${installation.agents.map((agent) => agents[agent].label).join(", ")}: ${pc.dim(installation.path)}`,
        );
      }
    }

    if (missingGroups.length > 0) {
      p.log.message(`    ${pc.yellow("Missing installations:")}`);
      for (const installation of missingGroups) {
        p.log.message(
          `      ${installation.agents.map((agent) => agents[agent].label).join(", ")}: ${pc.dim(installation.path)}`,
        );
      }
    }
  }
}

export async function handleOutdatedCommand(skillNames: string[], options: OutdatedOptions = {}) {
  showIntro(Boolean(options.silent));

  try {
    const spinner = p.spinner();
    spinner.start("Checking installation status...");
    const status = await hydrateTracked(
      scanTracked(skillNames.length > 0 ? skillNames : undefined),
    );
    spinner.stop("Check complete");
    printStatus(status, Boolean(options.verbose || skillNames.length > 0));
    showOutro(pc.green("Done"), Boolean(options.silent));
  } catch (error) {
    p.log.error(getError(error, "Something went wrong. Try again or check your connection."));
    showOutro(pc.red("Failed to check status"), Boolean(options.silent));
    process.exit(1);
  }
}

export async function handleUpdateCommand(skillNames: string[], options: UpdateOptions = {}) {
  showIntro(Boolean(options.silent));

  try {
    const scanned = await hydrateTracked(
      scanTracked(skillNames.length > 0 ? skillNames : undefined),
    );
    const updatable = scanned.filter((item) => item.status === "update-available");

    if (scanned.length === 0) {
      showNoTrackedItems();
      showOutro(pc.yellow("Nothing to update"), Boolean(options.silent));
      return;
    }

    if (updatable.length === 0) {
      const orphaned = scanned.filter((item) => item.status === "orphaned");
      if (orphaned.length > 0) {
        p.log.warn(
          `${orphaned.length} ${plural(orphaned.length, "item")} ${orphaned.length === 1 ? "has" : "have"} missing files.`,
        );
      }
      p.log.success(pc.green("All tracked items are up to date."));
      showOutro(pc.green("Everything is current"), Boolean(options.silent));
      return;
    }

    let selectedIds = updatable.map((item) => item.id);

    if (!isAutoConfirm(options)) {
      const selected = await p.multiselect<string>({
        message: "Choose items to update",
        required: true,
        initialValues: selectedIds,
        options: updatable.map((item) => ({
          value: item.id,
          label: `${item.tracked.type}:${item.tracked.name}`,
          hint: `${item.tracked.commit.slice(0, 7)} → ${item.latestCommit.slice(0, 7)}`,
        })),
      });

      if (p.isCancel(selected)) {
        p.cancel("Update cancelled");
        return;
      }

      selectedIds = selected as string[];
    }

    const selected = updatable.filter((item) => selectedIds.includes(item.id));
    if (selected.length === 0) {
      p.log.info("Nothing selected.");
      showOutro(pc.yellow("Nothing updated"), Boolean(options.silent));
      return;
    }

    p.log.step(pc.bold("Will Update"));
    for (const item of selected) {
      p.log.message(
        `  ${pc.cyan(`${item.tracked.type}:${item.tracked.name}`)} ${pc.dim(`${item.tracked.commit.slice(0, 7)} → ${item.latestCommit.slice(0, 7)}`)}`,
      );
    }

    if (!isAutoConfirm(options)) {
      const confirmed = await p.confirm({ message: "Ready to update?" });
      if (p.isCancel(confirmed) || !confirmed) {
        p.cancel("Update cancelled");
        return;
      }
    }

    const spinner = p.spinner();
    spinner.start("Updating...");

    let updated = 0;
    let failed = 0;

    for (const item of selected) {
      const source = await downloadSource(item.tracked.url);
      let itemUpdated = 0;

      try {
        const installable = discoverInstallables(
          source.root,
          item.tracked.subpath || source.subpath,
        ).find(
          (candidate) =>
            candidate.type === item.tracked.type &&
            candidate.name.toLowerCase() === item.tracked.name.toLowerCase(),
        );

        if (!installable) {
          failed += 1;
          p.log.error(
            `Could not find ${item.tracked.type}:${item.tracked.name} in ${item.tracked.url}`,
          );
          continue;
        }

        for (const installation of groupInstallations(item.validInstallations)) {
          const outcome = installInstallable(installable, installation.agent, installation.scope, {
            symlink: lstatSync(installation.path).isSymbolicLink(),
          });

          if (outcome.success) {
            updated += 1;
            itemUpdated += 1;
          } else {
            failed += 1;
            p.log.error(`${item.tracked.type}:${item.tracked.name} → ${outcome.error}`);
          }
        }

        if (itemUpdated > 0) {
          updateTrackedCommit(
            item.tracked.scope,
            item.tracked.name,
            item.tracked.type,
            source.commit,
          );
        }
      } finally {
        await cleanupSource(source);
      }
    }

    spinner.stop("Update complete");

    if (updated > 0) {
      p.log.success(pc.green(`Updated ${updated} ${plural(updated, "installation")}.`));
    }

    if (failed > 0) {
      showOutro(pc.red("Update finished with errors"), Boolean(options.silent));
      process.exit(1);
    }

    showOutro(pc.green("Done! Items updated."), Boolean(options.silent));
  } catch (error) {
    p.log.error(getError(error, "Something went wrong. Try again or check your connection."));
    showOutro(pc.red("Update failed"), Boolean(options.silent));
    process.exit(1);
  }
}

export async function handleCleanCommand(options: UpdateOptions = {}) {
  showIntro(Boolean(options.silent));

  try {
    const orphaned = scanTracked().filter((item) => item.validInstallations.length === 0);

    if (orphaned.length === 0) {
      p.log.success(pc.green("No orphaned state entries found."));
      showOutro(pc.green("Nothing to clean"), Boolean(options.silent));
      return;
    }

    p.log.step(pc.bold("Orphaned State Entries"));
    for (const item of orphaned) {
      p.log.message(
        `  ${pc.cyan(`${item.tracked.type}:${item.tracked.name}`)} ${pc.dim(`(${item.tracked.scope})`)}`,
      );
    }

    if (!isAutoConfirm(options)) {
      const confirmed = await p.confirm({
        message: `Remove ${orphaned.length} orphaned ${plural(orphaned.length, "entry")} from skills.lock?`,
      });
      if (p.isCancel(confirmed) || !confirmed) {
        p.cancel("Clean cancelled");
        return;
      }
    }

    for (const item of orphaned) {
      removeTrackedItem(item.tracked.scope, item.tracked.name, item.tracked.type);
    }

    showOutro(pc.green("State cleaned up"), Boolean(options.silent));
  } catch (error) {
    p.log.error(getError(error, "Something went wrong. Try again or check your connection."));
    showOutro(pc.red("Clean failed"), Boolean(options.silent));
    process.exit(1);
  }
}
