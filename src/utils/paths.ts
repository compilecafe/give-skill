import { resolve } from "path";
import type { SkillInstallation } from "../types/state.js";

export function resolveInstallationPath(installation: SkillInstallation): string {
  return installation.type === "global"
    ? installation.path
    : resolve(process.cwd(), installation.path);
}
