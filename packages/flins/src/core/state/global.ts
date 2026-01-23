import { globalStore } from "./store";
import type { StateFile, SkillInstallation } from "@/types/state";
import type { InstallableType } from "@/types/skills";

export function addSkill(
  skillName: string,
  url: string,
  subpath: string | undefined,
  branch: string,
  commit: string,
  installableType: InstallableType = "skill",
): { updated: boolean; previousBranch?: string } {
  return globalStore.addSkill({
    name: skillName,
    url,
    subpath,
    branch,
    commit,
    installableType,
  });
}

export function removeSkill(skillName: string, installableType: InstallableType): void {
  globalStore.removeSkill(skillName, installableType);
}

export function updateSkillCommit(
  skillName: string,
  installableType: InstallableType,
  commit: string,
): void {
  globalStore.updateCommit(skillName, installableType, commit);
}

export function getAllSkills(): StateFile {
  return globalStore.getAll() as StateFile;
}

export function findGlobalSkillInstallations(
  skillName: string,
  installableType: InstallableType,
): SkillInstallation[] {
  return globalStore.findInstallations(skillName, installableType);
}

export async function cleanOrphanedEntries(): Promise<void> {
  return globalStore.cleanOrphanedEntries();
}
