import { basename, dirname, extname, join } from "node:path";
import { readdirSync, readFileSync } from "node:fs";

const skipDirectories = new Set(["node_modules", ".git", "dist", "build", "__pycache__"]);

export type InstallableType = "skill" | "command";

export interface Installable {
  type: InstallableType;
  name: string;
  description: string;
  path: string;
}

function readText(path: string) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function listEntries(path: string) {
  try {
    return readdirSync(path, { withFileTypes: true });
  } catch {
    return [];
  }
}

function readHeaders(path: string) {
  const content = readText(path);
  if (!content) {
    return null;
  }

  const frontmatter = content.match(/^---\n([\s\S]+?)\n---/)?.[1] || content;

  return {
    name: frontmatter
      .match(/^name:\s*(.+)$/m)?.[1]
      ?.replace(/^['"]|['"]$/g, "")
      .trim(),
    description: frontmatter
      .match(/^description:\s*(.+)$/m)?.[1]
      ?.replace(/^['"]|['"]$/g, "")
      .trim(),
  };
}

function parseSkill(path: string) {
  const headers = readHeaders(path);
  if (!headers?.name || !headers.description) {
    return null;
  }

  return {
    type: "skill" as const,
    name: headers.name,
    description: headers.description,
    path: dirname(path),
  };
}

function parseCommand(path: string) {
  const headers = readHeaders(path);
  if (!headers) {
    return null;
  }

  return {
    type: "command" as const,
    name: headers.name || basename(path, ".md"),
    description: headers.description || `Command: ${basename(path, ".md")}`,
    path,
  };
}

function walk(
  root: string,
  depth: number,
  installables: Installable[],
  seenSkills: Set<string>,
  seenCommands: Set<string>,
) {
  if (depth > 5) {
    return;
  }

  const skill = parseSkill(join(root, "SKILL.md"));
  if (skill && !seenSkills.has(skill.name.toLowerCase())) {
    seenSkills.add(skill.name.toLowerCase());
    installables.push(skill);
  }

  for (const entry of listEntries(root)) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (skipDirectories.has(entry.name)) {
      continue;
    }

    const path = join(root, entry.name);

    if (entry.name === "commands") {
      for (const file of listEntries(path)) {
        if (!file.isFile() || extname(file.name).toLowerCase() !== ".md") {
          continue;
        }

        const base = basename(file.name, ".md").toLowerCase();
        if (base === "readme" || file.name === ".DS_Store") {
          continue;
        }

        const command = parseCommand(join(path, file.name));
        if (!command || seenCommands.has(command.name.toLowerCase())) {
          continue;
        }

        seenCommands.add(command.name.toLowerCase());
        installables.push(command);
      }

      continue;
    }

    walk(path, depth + 1, installables, seenSkills, seenCommands);
  }
}

export function discoverInstallables(root: string, subpath?: string) {
  const installables: Installable[] = [];
  const seenSkills = new Set<string>();
  const seenCommands = new Set<string>();

  walk(subpath ? join(root, subpath) : root, 0, installables, seenSkills, seenCommands);

  return installables.sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "skill" ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}
