import * as p from "@clack/prompts";
import pc from "picocolors";
import { join } from "path";
import {
  cloneRepo,
  cleanupTempDir,
  getLatestCommit,
  getCommitHash,
} from "@/infrastructure/git-client";
import { discoverSkills } from "@/core/skills/discovery";
import { installSkillForAgent } from "@/infrastructure/installer";
import { getAllSkills, updateSkillCommit, cleanOrphanedEntries } from "@/core/state/global";
import {
  getAllLocalSkills,
  findLocalSkillInstallations,
  updateLocalSkillCommit,
} from "@/core/state/local";
import { removeSkillInstallation } from "@/core/state/global";
import { agents } from "@/core/agents/config";
import { isValidSkillInstallation } from "@/utils/validation";
import { resolveInstallationPath } from "@/utils/paths";
import { showNoSkillsMessage, Plural } from "@/utils/formatting";
import type { SkillState } from "@/types/state";

interface StatusResult {
  skillName: string;
  currentCommit: string;
  latestCommit: string;
  status: "latest" | "update-available" | "error" | "orphaned";
  installations: Array<{ agent: string; path: string; exists: boolean }>;
  error?: string;
}

interface UpdateResult {
  skillName: string;
  success: boolean;
  updated: number;
  failed: number;
  error?: string;
}

function getAllSkillsFromBothSources(): Array<{
  skillName: string;
  state: SkillState;
  isLocal: boolean;
}> {
  const result: Array<{ skillName: string; state: SkillState; isLocal: boolean }> = [];
  const seen = new Set<string>();

  const localState = getAllLocalSkills();
  if (localState) {
    for (const [skillName, localEntry] of Object.entries(localState.skills)) {
      const installations = findLocalSkillInstallations(skillName);
      result.push({
        skillName,
        state: {
          ...localEntry,
          installations,
        },
        isLocal: true,
      });
      seen.add(skillName.toLowerCase());
    }
  }

  const globalState = getAllSkills();
  for (const [skillName, skillState] of Object.entries(globalState.skills)) {
    const key = skillName.toLowerCase();
    if (!seen.has(key)) {
      result.push({
        skillName,
        state: skillState,
        isLocal: false,
      });
    }
  }

  return result;
}

async function checkSkillUpdate(skillName: string, skillState: SkillState): Promise<StatusResult> {
  const installations = skillState.installations.map((inst) => {
    const resolvedPath = resolveInstallationPath(inst);
    return {
      agent: agents[inst.agent].displayName,
      path: resolvedPath,
      exists: isValidSkillInstallation(resolvedPath),
    };
  });

  const existingInstallations = installations.filter((i) => i.exists);
  if (existingInstallations.length === 0) {
    return {
      skillName,
      currentCommit: skillState.commit,
      latestCommit: skillState.commit,
      status: "orphaned",
      installations,
    };
  }

  try {
    const latestCommit = await getLatestCommit(skillState.url, skillState.branch);
    const isLatest = latestCommit === skillState.commit;

    return {
      skillName,
      currentCommit: skillState.commit,
      latestCommit,
      status: isLatest ? "latest" : "update-available",
      installations,
    };
  } catch (error) {
    return {
      skillName,
      currentCommit: skillState.commit,
      latestCommit: skillState.commit,
      status: "error",
      installations,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkStatus(skillNames?: string[]): Promise<StatusResult[]> {
  const allSkills = getAllSkillsFromBothSources();
  const results: StatusResult[] = [];

  let skillsToCheck: typeof allSkills;

  if (skillNames && skillNames.length > 0) {
    const nameSet = new Set(skillNames.map((n) => n.toLowerCase()));
    skillsToCheck = allSkills.filter(({ skillName }) => nameSet.has(skillName.toLowerCase()));
  } else {
    skillsToCheck = allSkills;
  }

  if (skillsToCheck.length === 0) {
    return [];
  }

  const spinner = p.spinner();

  if (skillsToCheck.length === 1) {
    const { skillName, state: skillState } = skillsToCheck[0]!;
    spinner.start(`Checking ${pc.cyan(skillName)}...`);
    const result = await checkSkillUpdate(skillName, skillState);
    spinner.stop(
      result.status === "latest" ? pc.green("Up to date") : pc.yellow("Update available"),
    );
    results.push(result);
  } else {
    spinner.start(`Checking ${skillsToCheck.length} ${Plural(skillsToCheck.length, "skill")}...`);
    for (const { skillName, state: skillState } of skillsToCheck) {
      const result = await checkSkillUpdate(skillName, skillState);
      results.push(result);
    }
    spinner.stop("Check complete");
  }

  return results;
}

export async function performUpdate(
  skillNames?: string[],
  options: { yes?: boolean; force?: boolean; silent?: boolean } = {},
): Promise<UpdateResult[]> {
  const allSkills = getAllSkillsFromBothSources();
  const results: UpdateResult[] = [];

  let skillsToUpdate: typeof allSkills;

  if (skillNames && skillNames.length > 0) {
    const nameSet = new Set(skillNames.map((n) => n.toLowerCase()));
    skillsToUpdate = allSkills.filter(({ skillName }) => nameSet.has(skillName.toLowerCase()));
  } else {
    skillsToUpdate = allSkills;
  }

  if (skillsToUpdate.length === 0) {
    p.log.warn("No skills found to update");
    p.outro(pc.yellow("Nothing to update"));
    return [];
  }

  const statusResults = await checkStatus(skillNames);
  const skillsWithUpdates = statusResults.filter((r) => r.status === "update-available");

  if (skillsWithUpdates.length === 0) {
    const orphaned = statusResults.filter((r) => r.status === "orphaned");
    if (orphaned.length > 0) {
      p.log.warn(
        `${orphaned.length} skill${orphaned.length > 1 ? "s" : ""} ${orphaned.length > 1 ? "have" : "has"} no valid installations`,
      );
      for (const o of orphaned) {
        p.log.message(`  ${pc.yellow("○")} ${pc.cyan(o.skillName)} - files were removed`);
      }
    }
    p.log.success(pc.green("All skills are up to date"));
    p.outro(pc.green("Already up to date"));
    return [];
  }

  p.log.step(pc.bold("Updates Available"));

  const updateChoices = skillsWithUpdates.map((r) => ({
    value: r.skillName,
    label: r.skillName,
    hint: `${r.currentCommit.slice(0, 7)} → ${r.latestCommit.slice(0, 7)}`,
  }));

  let selectedToUpdate: string[];

  const autoConfirm = options.yes || options.force;

  if (autoConfirm) {
    selectedToUpdate = skillsWithUpdates.map((r) => r.skillName);
  } else {
    const selected = await p.multiselect({
      message: "Select skills to update",
      options: updateChoices,
      required: true,
      initialValues: skillsWithUpdates.map((r) => r.skillName),
    });

    if (p.isCancel(selected)) {
      p.cancel("Update cancelled");
      return [];
    }

    selectedToUpdate = selected as string[];
  }

  p.log.step(pc.bold("Will Update"));
  for (const skillName of selectedToUpdate) {
    const result = skillsWithUpdates.find((r) => r.skillName === skillName);
    if (result) {
      p.log.message(`  ${pc.cyan(result.skillName)}`);
      p.log.message(
        `    ${pc.dim("Current:")} ${pc.yellow(result.currentCommit.slice(0, 7))} ${pc.dim("→")} ${pc.green(result.latestCommit.slice(0, 7))}`,
      );
    }
  }

  if (!autoConfirm) {
    const confirmed = await p.confirm({ message: "Proceed with update?" });
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Update cancelled");
      return [];
    }
  }

  const spinner = p.spinner();
  spinner.start(
    `Updating ${selectedToUpdate.length} ${Plural(selectedToUpdate.length, "skill")}...`,
  );

  for (const { skillName, state: skillState, isLocal } of skillsToUpdate) {
    const statusResult = statusResults.find((r) => r.skillName === skillName);

    if (!statusResult || statusResult.status !== "update-available") {
      if (statusResult?.status === "latest") {
        results.push({ skillName, success: true, updated: 0, failed: 0 });
      } else {
        results.push({ skillName, success: false, updated: 0, failed: 0 });
      }
      continue;
    }

    if (!selectedToUpdate.includes(skillName)) {
      continue;
    }

    let tempDir: string | null = null;
    let updatedCount = 0;
    let failedCount = 0;

    try {
      tempDir = await cloneRepo(skillState.url);
      const commit = await getCommitHash(tempDir);

      const searchPath = skillState.subpath ? join(tempDir, skillState.subpath) : tempDir;
      const skills = await discoverSkills(searchPath);

      const matchingSkill = skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());

      if (!matchingSkill) {
        throw new Error("Skill not found in repository");
      }

      for (const installation of skillState.installations) {
        const resolvedPath = resolveInstallationPath(installation);
        if (!isValidSkillInstallation(resolvedPath)) {
          if (!isLocal) {
            removeSkillInstallation(skillName, installation.agent, installation.path);
          }
          continue;
        }

        const result = await installSkillForAgent(matchingSkill, installation.agent, {
          global: installation.type === "global",
        });

        if (result.success) {
          updatedCount++;
        } else {
          failedCount++;
        }
      }

      if (isLocal) {
        updateLocalSkillCommit(skillName, commit);
      } else {
        updateSkillCommit(skillName, commit);
      }

      results.push({
        skillName,
        success: failedCount === 0,
        updated: updatedCount,
        failed: failedCount,
      });
    } catch (error) {
      results.push({
        skillName,
        success: false,
        updated: updatedCount,
        failed: failedCount + 1,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      if (tempDir) {
        await cleanupTempDir(tempDir);
      }
    }
  }

  spinner.stop("Update complete");

  const successful = results.filter((r) => r.success && r.updated > 0);
  const failed = results.filter((r) => !r.success || r.failed > 0);

  if (successful.length > 0) {
    p.log.success(pc.green(`Updated ${successful.length} ${Plural(successful.length, "skill")}`));
    for (const r of successful) {
      p.log.message(
        `  ${pc.green("✓")} ${pc.cyan(r.skillName)} (${r.updated} ${Plural(r.updated, "installation")})`,
      );
    }
  }

  if (failed.length > 0) {
    p.log.error(pc.red(`Failed to update ${failed.length} ${Plural(failed.length, "skill")}`));
    for (const r of failed) {
      p.log.message(`  ${pc.red("✗")} ${pc.cyan(r.skillName)}`);
      if (r.error) {
        p.log.message(`    ${pc.dim(r.error)}`);
      }
    }
  }

  if (successful.length > 0) {
    p.outro(pc.green("Skills updated successfully"));
  } else {
    p.outro(pc.yellow("No skills were updated"));
  }

  return results;
}

export async function displayStatus(
  statusResults: StatusResult[],
  verbose: boolean = false,
): Promise<void> {
  if (statusResults.length === 0) {
    showNoSkillsMessage();
    return;
  }

  p.log.step(pc.bold("Skills Status"));

  for (const result of statusResults) {
    const statusIcon = {
      latest: pc.green("✓"),
      "update-available": pc.yellow("↓"),
      error: pc.red("✗"),
      orphaned: pc.dim("○"),
    }[result.status];

    const statusText = {
      latest: pc.green("latest"),
      "update-available": pc.yellow("update available"),
      error: pc.red("error"),
      orphaned: pc.dim("orphaned"),
    }[result.status];

    const validInstallations = result.installations.filter((i) => i.exists);
    const orphanedInstallations = result.installations.filter((i) => !i.exists);

    if (!verbose) {
      const installationCount = validInstallations.length;
      const countSuffix =
        installationCount > 0
          ? ` (${installationCount} ${Plural(installationCount, "installation")})`
          : "";
      p.log.message(
        `${statusIcon} ${pc.cyan(result.skillName)}${pc.dim(countSuffix)} - ${statusText}`,
      );
    } else {
      p.log.message(`${statusIcon} ${pc.cyan(result.skillName)}`);
      p.log.message(`    Status: ${statusText}`);

      if (result.status === "update-available") {
        p.log.message(
          `    ${pc.dim("Commit:")} ${pc.yellow(result.currentCommit.slice(0, 7))} ${pc.dim("→")} ${pc.green(result.latestCommit.slice(0, 7))}`,
        );
      } else if (result.status === "latest") {
        p.log.message(`    ${pc.dim("Commit:")} ${result.currentCommit.slice(0, 7)}`);
      }

      if (result.error) {
        p.log.message(`    ${pc.red(result.error)}`);
      }

      if (validInstallations.length > 0) {
        p.log.message(`    ${pc.dim("Installed in:")}`);
        for (const inst of validInstallations) {
          p.log.message(`      ${pc.dim("•")} ${inst.agent}: ${pc.dim(inst.path)}`);
        }
      }

      if (orphanedInstallations.length > 0) {
        p.log.message(`    ${pc.yellow("Missing installations:")}`);
        for (const inst of orphanedInstallations) {
          p.log.message(`      ${pc.dim("•")} ${inst.agent}: ${pc.dim(inst.path)}`);
        }
      }
    }
  }

  if (!verbose) {
    p.log.info(`Use ${pc.cyan("--verbose")} or ${pc.cyan("-v")} for detailed information`);
  }
}

export async function cleanOrphaned(
  _options: { yes?: boolean; force?: boolean; silent?: boolean } = {},
): Promise<void> {
  const spinner = p.spinner();
  spinner.start("Checking for orphaned entries...");
  await cleanOrphanedEntries();
  spinner.stop(pc.green("State cleaned up"));
}
