import { resolve } from "path";
import type { SkillInstallation } from "@/types/state";

export function resolveInstallationPath(installation: SkillInstallation): string {
  return installation.type === "global"
    ? installation.path
    : resolve(process.cwd(), installation.path);
}
