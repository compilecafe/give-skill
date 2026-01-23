import { createLocalStore } from "./store";
import type { SkillInstallation } from "@/types/state";
import type { InstallableType } from "@/types/skills";

export function addLocalSkill(
  skillName: string,
  url: string,
  subpath: string | undefined,
  branch: string,
  commit: string,
  installableType: InstallableType,
  cwd?: string,
): { updated: boolean; previousBranch?: string } {
  return createLocalStore(cwd).addSkill({
    name: skillName,
    url,
    subpath,
    branch,
    commit,
    installableType,
  });
}

export function removeLocalSkill(
  skillName: string,
  installableType: InstallableType,
  cwd?: string,
): void {
  createLocalStore(cwd).removeSkill(skillName, installableType);
}

export function updateLocalSkillCommit(
  skillName: string,
  installableType: InstallableType,
  commit: string,
  cwd?: string,
): void {
  createLocalStore(cwd).updateCommit(skillName, installableType, commit);
}

export function getAllLocalSkills(cwd?: string) {
  return createLocalStore(cwd).getAll();
}

export function findLocalSkillInstallations(
  skillName: string,
  installableType: InstallableType,
  cwd?: string,
): SkillInstallation[] {
  return createLocalStore(cwd).findInstallations(skillName, installableType);
}

export async function cleanOrphanedEntries(cwd?: string): Promise<void> {
  return createLocalStore(cwd).cleanOrphanedEntries();
}
