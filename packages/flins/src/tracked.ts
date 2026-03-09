import { getLatestCommit } from "@/sources";
import { findInstallations, getValidInstallations } from "@/installations";
import { listTrackedItems, type TrackedItem } from "@/state";
import { getError } from "@/output";

export interface ScannedItem {
  id: string;
  tracked: TrackedItem;
  validInstallations: ReturnType<typeof findInstallations>;
  missingInstallations: ReturnType<typeof findInstallations>;
  status: "latest" | "update-available" | "error" | "orphaned";
  latestCommit: string;
  error?: string;
}

export function scanTracked(skillNames?: string[]) {
  const tracked = listTrackedItems();
  const names =
    skillNames && skillNames.length > 0
      ? new Set(skillNames.map((name) => name.toLowerCase()))
      : null;

  return tracked
    .filter((item) => !names || names.has(item.name.toLowerCase()))
    .map((item) => {
      const allInstallations = findInstallations(item.name, item.type, item.scope);
      const validInstallations = getValidInstallations(item);
      const validPaths = new Set(validInstallations.map((installation) => installation.path));

      return {
        id: `${item.scope}:${item.type}:${item.name.toLowerCase()}`,
        tracked: item,
        validInstallations,
        missingInstallations: allInstallations.filter(
          (installation) => !validPaths.has(installation.path),
        ),
        status: validInstallations.length === 0 ? "orphaned" : "latest",
        latestCommit: item.commit,
      } satisfies ScannedItem;
    });
}

export async function hydrateTracked(items: ScannedItem[]) {
  const hydrated: ScannedItem[] = [];

  for (const item of items) {
    if (item.validInstallations.length === 0) {
      hydrated.push(item);
      continue;
    }

    try {
      const latestCommit = await getLatestCommit(item.tracked.url, item.tracked.branch);
      hydrated.push({
        ...item,
        latestCommit,
        status: latestCommit === item.tracked.commit ? "latest" : "update-available",
      });
    } catch (error) {
      hydrated.push({
        ...item,
        status: "error",
        error: getError(error, "Failed to check for updates"),
      });
    }
  }

  return hydrated;
}
