import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, rmSync } from "fs";
import { getAllSkills, removeSkillInstallation } from "@/core/state/global";
import {
  getAllLocalSkills,
  findLocalSkillInstallations,
  removeLocalSkill,
} from "@/core/state/local";
import { agents } from "@/core/agents/config";
import { isValidSkillInstallation } from "@/utils/validation";
import { resolveInstallationPath } from "@/utils/paths";
import { showNoSkillsMessage, Plural } from "@/utils/formatting";
import type { SkillState } from "@/types/state";

interface RemoveResult {
  skillName: string;
  success: boolean;
  removed: number;
  failed: number;
  installations: Array<{ agent: string; path: string; removed: boolean; error?: string }>;
}

interface RemoveOptions {
  yes?: boolean;
}

function getAllRemovableSkills(): Array<{
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

async function removeSkillDirectory(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function performRemove(
  skillNames: string[] = [],
  options: RemoveOptions = {},
): Promise<RemoveResult[]> {
  const allSkills = getAllRemovableSkills();
  const results: RemoveResult[] = [];

  if (allSkills.length === 0) {
    showNoSkillsMessage();
    return [];
  }

  let skillsToRemove: typeof allSkills;

  if (skillNames.length > 0) {
    const nameSet = new Set(skillNames.map((n) => n.toLowerCase()));
    skillsToRemove = allSkills.filter(({ skillName }) => nameSet.has(skillName.toLowerCase()));
  } else {
    const allChoices = allSkills.map(({ skillName, state }) => {
      const validInstallations = state.installations
        .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
        .filter(({ resolvedPath }) => isValidSkillInstallation(resolvedPath));

      return {
        value: skillName,
        label: skillName,
        hint:
          validInstallations.length > 0
            ? `${validInstallations.length} ${Plural(validInstallations.length, "installation")}`
            : "no valid installations",
      };
    });

    const validChoices = allChoices.filter((c) => c.hint !== "no valid installations");

    if (validChoices.length === 0) {
      p.log.warn("No valid installations found");
      return [];
    }

    if (options.yes) {
      skillsToRemove = allSkills.filter(({ skillName }) =>
        validChoices.some((c) => c.value === skillName),
      );
    } else {
      const selected = await p.multiselect({
        message: "Select skills to remove",
        options: validChoices,
        required: true,
        initialValues: validChoices.map((c) => c.value),
      });

      if (p.isCancel(selected)) {
        p.cancel("Remove cancelled");
        return [];
      }

      const selectedNames = selected as string[];
      skillsToRemove = allSkills.filter(({ skillName }) => selectedNames.includes(skillName));
    }
  }

  if (skillsToRemove.length === 0) {
    if (skillNames.length > 0) {
      p.log.error(`No matching skills found for: ${skillNames.join(", ")}`);
      p.log.info("Tracked skills:");
      for (const s of allSkills) {
        p.log.message(`  - ${pc.cyan(s.skillName)}`);
      }
    }
    return [];
  }

  p.log.step(pc.bold("Skills to Remove"));

  const toRemove: Array<{
    skillName: string;
    isLocal: boolean;
    installations: Array<{
      installation: (typeof allSkills)[0]["state"]["installations"][number];
      resolvedPath: string;
    }>;
  }> = [];

  for (const { skillName, state: skillState, isLocal } of skillsToRemove) {
    const validInstallations = skillState.installations
      .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
      .filter(({ resolvedPath }) => isValidSkillInstallation(resolvedPath));

    if (validInstallations.length > 0) {
      toRemove.push({ skillName, isLocal, installations: validInstallations });
      p.log.message(`  ${pc.cyan(skillName)}`);
      for (const { resolvedPath } of validInstallations) {
        p.log.message(`    ${pc.dim("→")} ${resolvedPath}`);
      }
    }
  }

  if (toRemove.length === 0) {
    p.log.warn("No installations match the specified criteria");
    return [];
  }

  const skipSecondMultiselect = skillNames.length === 0;

  let selectedToRemove: string[];

  if (options.yes || skipSecondMultiselect) {
    selectedToRemove = toRemove.map(({ skillName }) => skillName);
  } else {
    const removeChoices = toRemove.map(({ skillName, installations }) => ({
      value: skillName,
      label: skillName,
      hint: `${installations.length} ${Plural(installations.length, "installation")}`,
    }));

    const selected = await p.multiselect({
      message: "Select skills to remove",
      options: removeChoices,
      required: true,
      initialValues: toRemove.map(({ skillName }) => skillName),
    });

    if (p.isCancel(selected)) {
      p.cancel("Remove cancelled");
      return [];
    }

    selectedToRemove = selected as string[];
  }

  p.log.step(pc.bold("Will Remove"));
  for (const skillName of selectedToRemove) {
    const item = toRemove.find((r) => r.skillName === skillName);
    if (item) {
      p.log.message(`  ${pc.cyan(item.skillName)}`);
      for (const { resolvedPath } of item.installations) {
        p.log.message(`    ${pc.dim("→")} ${resolvedPath}`);
      }
    }
  }

  if (!options.yes) {
    const confirmed = await p.confirm({ message: "Remove these skills?" });
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Remove cancelled");
      return [];
    }
  }

  const spinner = p.spinner();
  spinner.start(
    `Removing ${selectedToRemove.length} skill${selectedToRemove.length > 1 ? "s" : ""}...`,
  );

  for (const { skillName, isLocal, installations } of toRemove) {
    if (!selectedToRemove.includes(skillName)) {
      continue;
    }
    const result: RemoveResult = {
      skillName,
      success: true,
      removed: 0,
      failed: 0,
      installations: [],
    };

    for (const { installation, resolvedPath } of installations) {
      const removeResult = await removeSkillDirectory(resolvedPath);

      result.installations.push({
        agent: agents[installation.agent].displayName,
        path: resolvedPath,
        removed: removeResult.success,
        error: removeResult.error,
      });

      if (removeResult.success) {
        result.removed++;
        if (!isLocal) {
          removeSkillInstallation(skillName, installation.agent, installation.path);
        }
      } else {
        result.failed++;
        result.success = false;
      }
    }

    if (isLocal && result.removed > 0) {
      removeLocalSkill(skillName);
    }

    results.push(result);
  }

  spinner.stop("Remove complete");

  const successful = results.filter((r) => r.success && r.removed > 0);
  const failed = results.filter((r) => !r.success || r.failed > 0);

  if (successful.length > 0) {
    p.log.success(pc.green(`Removed ${successful.length} ${Plural(successful.length, "skill")}`));
    for (const r of successful) {
      p.log.message(`  ${pc.green("✓")} ${pc.cyan(r.skillName)}`);
      p.log.message(`    ${pc.dim(`${r.removed} ${Plural(r.removed, "installation")} removed`)}`);
    }
  }

  if (failed.length > 0) {
    p.log.error(pc.red(`Failed to remove ${failed.length} ${Plural(failed.length, "skill")}`));
    for (const r of failed) {
      p.log.message(`  ${pc.red("✗")} ${pc.cyan(r.skillName)}`);
      for (const inst of r.installations.filter((i) => !i.removed)) {
        if (inst.error) {
          p.log.message(`    ${pc.dim(inst.error)}`);
        }
      }
    }
  }

  if (successful.length > 0) {
    p.outro(pc.green("Skills removed successfully"));
  } else {
    p.outro(pc.yellow("No skills were removed"));
  }

  return results;
}

export async function listRemovableSkills(): Promise<void> {
  const allSkills = getAllRemovableSkills();

  if (allSkills.length === 0) {
    showNoSkillsMessage();
    return;
  }

  p.log.step(pc.bold("Installed Skills"));

  const localSkills: Array<{ skillName: string; state: SkillState }> = [];
  const globalSkills: Array<{ skillName: string; state: SkillState }> = [];

  for (const { skillName, state, isLocal } of allSkills) {
    if (isLocal) {
      localSkills.push({ skillName, state });
    } else {
      globalSkills.push({ skillName, state });
    }
  }

  if (localSkills.length > 0) {
    if (globalSkills.length > 0) {
      p.log.message(pc.bold(pc.cyan("Local skills (from ./skills.lock)")));
    }
    for (const { skillName, state } of localSkills) {
      p.log.message(`${pc.cyan(skillName)}`);

      const validInstallations = state.installations
        .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
        .filter(({ resolvedPath }) => isValidSkillInstallation(resolvedPath));

      if (validInstallations.length > 0) {
        p.log.message(`  ${pc.dim("Installed in:")}`);
        for (const { installation, resolvedPath } of validInstallations) {
          const scope = installation.type === "global" ? "global" : "project";
          p.log.message(
            `    ${pc.dim("•")} ${agents[installation.agent].displayName} ${pc.dim(`(${scope})`)}: ${pc.dim(resolvedPath)}`,
          );
        }
      }
    }
  }

  if (globalSkills.length > 0) {
    if (localSkills.length > 0) {
      p.log.message("");
      p.log.message(pc.bold(pc.cyan("Global skills (from ~/.sena/state.json)")));
    }
    for (const { skillName, state } of globalSkills) {
      p.log.message(`${pc.cyan(skillName)}`);

      const validInstallations = state.installations
        .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
        .filter(({ resolvedPath }) => isValidSkillInstallation(resolvedPath));

      if (validInstallations.length > 0) {
        p.log.message(`  ${pc.dim("Installed in:")}`);
        for (const { installation, resolvedPath } of validInstallations) {
          const scope = installation.type === "global" ? "global" : "project";
          p.log.message(
            `    ${pc.dim("•")} ${agents[installation.agent].displayName} ${pc.dim(`(${scope})`)}: ${pc.dim(resolvedPath)}`,
          );
        }
      }
    }
  }
}
