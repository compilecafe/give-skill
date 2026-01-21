import * as p from "@clack/prompts";
import pc from "picocolors";
import { rmSync } from "fs";
import { getAllSkills, removeSkill, findGlobalSkillInstallations } from "@/core/state/global";
import {
  getAllLocalSkills,
  findLocalSkillInstallations,
  removeLocalSkill,
} from "@/core/state/local";
import { parseKey } from "@/types/state";
import type { InstallableType } from "@/types/skills";
import { agents } from "@/core/agents/config";
import { isValidInstallation } from "@/utils/validation";
import { resolveInstallationPath } from "@/utils/paths";
import { showNoSkillsMessage, Plural } from "@/utils/formatting";
import { removeSymlinkSource } from "@/infrastructure/file-system";

interface RemoveResult {
  skillName: string;
  success: boolean;
  removed: number;
  failed: number;
  installations: Array<{ agent: string; path: string; removed: boolean; error?: string }>;
}

interface RemoveOptions {
  yes?: boolean;
  force?: boolean;
  silent?: boolean;
}

function getAllRemovableSkills(): Array<{
  skillName: string;
  url: string;
  subpath: string | undefined;
  branch: string;
  commit: string;
  isLocal: boolean;
  installableType: InstallableType;
}> {
  const result: Array<{
    skillName: string;
    url: string;
    subpath: string | undefined;
    branch: string;
    commit: string;
    isLocal: boolean;
    installableType: InstallableType;
  }> = [];
  const seen = new Set<string>();

  const localState = getAllLocalSkills();
  if (localState) {
    for (const [key, localEntry] of Object.entries(localState.skills)) {
      const parsed = parseKey(key);
      if (parsed) {
        result.push({
          skillName: parsed.name,
          url: localEntry.url,
          subpath: localEntry.subpath,
          branch: localEntry.branch,
          commit: localEntry.commit,
          isLocal: true,
          installableType: parsed.installableType,
        });
        seen.add(`${parsed.installableType}:${parsed.name.toLowerCase()}`);
      }
    }
  }

  const globalState = getAllSkills();
  for (const [skillName, skillEntry] of Object.entries(globalState.skills)) {
    const parsed = parseKey(skillName);
    const key = parsed
      ? `${parsed.installableType}:${parsed.name.toLowerCase()}`
      : skillName.toLowerCase();
    if (!seen.has(key)) {
      result.push({
        skillName: parsed?.name ?? skillName,
        url: skillEntry.url,
        subpath: skillEntry.subpath,
        branch: skillEntry.branch,
        commit: skillEntry.commit,
        isLocal: false,
        installableType: parsed?.installableType ?? "skill",
      });
    }
  }

  return result;
}

async function removeSkillDirectory(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    rmSync(path, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "ENOENT") {
      return { success: true };
    }
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
    const allChoices = allSkills.map(({ skillName, isLocal, installableType }) => {
      const installations = isLocal
        ? findLocalSkillInstallations(skillName, installableType)
        : findGlobalSkillInstallations(skillName, installableType);

      const validInstallations = installations
        .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
        .filter(({ installation, resolvedPath }) =>
          isValidInstallation(resolvedPath, installation.installableType),
        );

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

    const autoConfirm = options.yes || options.force;

    if (autoConfirm) {
      skillsToRemove = allSkills.filter(({ skillName }) =>
        validChoices.some((c) => c.value === skillName),
      );
    } else {
      const selected = await p.multiselect({
        message: "Choose skills to remove",
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
    installableType: InstallableType;
    installations: Array<{
      installation: import("@/types/state").SkillInstallation;
      resolvedPath: string;
    }>;
  }> = [];

  for (const { skillName, isLocal, installableType } of skillsToRemove) {
    const installations = isLocal
      ? findLocalSkillInstallations(skillName, installableType)
      : findGlobalSkillInstallations(skillName, installableType);

    const validInstallations = installations
      .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
      .filter(({ installation, resolvedPath }) =>
        isValidInstallation(resolvedPath, installation.installableType),
      );

    if (validInstallations.length > 0) {
      toRemove.push({ skillName, isLocal, installableType, installations: validInstallations });
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

  const autoConfirm = options.yes || options.force;

  if (autoConfirm || skipSecondMultiselect) {
    selectedToRemove = toRemove.map(({ skillName }) => skillName);
  } else {
    const removeChoices = toRemove.map(({ skillName, installations }) => ({
      value: skillName,
      label: skillName,
      hint: `${installations.length} ${Plural(installations.length, "installation")}`,
    }));

    const selected = await p.multiselect({
      message: "Choose skills to remove",
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

  if (!autoConfirm) {
    const confirmed = await p.confirm({ message: "Remove selected skills?" });
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Remove cancelled");
      return [];
    }
  }

  const spinner = p.spinner();
  spinner.start("Removing...");

  for (const { skillName, isLocal, installableType, installations } of toRemove) {
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
      const symlinkSourceResult = await removeSymlinkSource(resolvedPath);

      const removeResult = await removeSkillDirectory(resolvedPath);

      result.installations.push({
        agent: agents[installation.agent].displayName,
        path: resolvedPath,
        removed: removeResult.success && symlinkSourceResult.success,
        error: removeResult.error || symlinkSourceResult.error,
      });

      if (removeResult.success && symlinkSourceResult.success) {
        result.removed++;
      } else {
        result.failed++;
        result.success = false;
      }
    }

    if (result.removed > 0) {
      if (isLocal) {
        removeLocalSkill(skillName, installableType);
      } else {
        removeSkill(skillName, installableType);
      }
    }

    results.push(result);
  }

  spinner.stop("Remove complete");

  const successful = results.filter((r) => r.success && r.removed > 0);
  const failed = results.filter((r) => !r.success || r.failed > 0);

  if (successful.length > 0) {
    p.log.success(pc.green(`Removed successfully`));
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
    p.outro(pc.green("Done! Skills removed."));
  } else {
    p.outro(pc.yellow("Nothing removed"));
  }

  return results;
}

export async function listRemovableSkills(): Promise<void> {
  const allSkills = getAllRemovableSkills();

  if (allSkills.length === 0) {
    showNoSkillsMessage();
    return;
  }

  p.log.step(pc.bold("Installed Skills and Commands"));

  const localSkills: Array<{ skillName: string; installableType: InstallableType }> = [];
  const globalSkills: Array<{ skillName: string; installableType: InstallableType }> = [];

  for (const { skillName, isLocal, installableType } of allSkills) {
    if (isLocal) {
      localSkills.push({ skillName, installableType });
    } else {
      globalSkills.push({ skillName, installableType });
    }
  }

  if (localSkills.length > 0) {
    if (globalSkills.length > 0) {
      p.log.message(pc.bold(pc.cyan("Local (from ./skills.lock)")));
    }
    for (const { skillName, installableType } of localSkills) {
      p.log.message(
        `${pc.green("✓")} ${pc.cyan(installableType + ":" + skillName)} ${installableType === "command" ? pc.yellow("(experimental)") : ""}`,
      );

      const installations = findLocalSkillInstallations(skillName, installableType);
      const validInstallations = installations
        .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
        .filter(({ installation, resolvedPath }) =>
          isValidInstallation(resolvedPath, installation.installableType),
        );

      if (validInstallations.length > 0) {
        p.log.message(`  ${pc.dim("Installed in:")}`);
        for (const { installation, resolvedPath } of validInstallations) {
          p.log.message(
            `    ${pc.dim("•")} ${agents[installation.agent].displayName}: ${pc.dim(resolvedPath)}`,
          );
        }
      }
    }
  }

  if (globalSkills.length > 0) {
    if (localSkills.length > 0) {
      p.log.message(pc.bold(pc.cyan("Global (from ~/.flins/skills.lock)")));
    }
    for (const { skillName, installableType } of globalSkills) {
      const typeLabel = installableType === "command" ? pc.yellow("⚡") : pc.green("✓");
      p.log.message(`${typeLabel} ${pc.cyan(skillName)}`);

      const installations = findGlobalSkillInstallations(skillName, installableType);
      const validInstallations = installations
        .map((inst) => ({ installation: inst, resolvedPath: resolveInstallationPath(inst) }))
        .filter(({ installation, resolvedPath }) =>
          isValidInstallation(resolvedPath, installation.installableType),
        );

      if (validInstallations.length > 0) {
        p.log.message(`  ${pc.dim("Installed in:")}`);
        for (const { installation, resolvedPath } of validInstallations) {
          p.log.message(
            `    ${pc.dim("•")} ${agents[installation.agent].displayName}: ${pc.dim(resolvedPath)}`,
          );
        }
      }
    }
  }
}
