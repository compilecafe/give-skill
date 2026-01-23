import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";
import type { Command } from "@/types/commands";
import { SKIP_DIRS } from "@/utils/discovery";
import { parseMarkdownCommand } from "./parser";

const SKIP_FILES = new Set(["README.md", "readme.md", ".DS_Store"]);
const MAX_DEPTH = 5;

async function findCommandsDirs(dir: string, depth = 0): Promise<string[]> {
  const commandsDirs: string[] = [];

  if (depth > MAX_DEPTH) return commandsDirs;

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (SKIP_DIRS.includes(entry.name)) {
        continue;
      }

      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "commands") {
          commandsDirs.push(fullPath);
        } else {
          const subDirs = await findCommandsDirs(fullPath, depth + 1);
          commandsDirs.push(...subDirs);
        }
      }
    }
  } catch {}

  return commandsDirs;
}

async function readCommandsFromDir(commandsDir: string): Promise<Command[]> {
  const commands: Command[] = [];

  try {
    const entries = await readdir(commandsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (SKIP_FILES.has(entry.name)) {
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const filePath = join(commandsDir, entry.name);
      const ext = extname(entry.name).toLowerCase();

      if (ext !== ".md") {
        continue;
      }

      try {
        const content = await readFile(filePath, "utf-8");
        const command = parseMarkdownCommand(filePath, content);

        if (command) {
          commands.push(command);
        }
      } catch {
        continue;
      }
    }
  } catch {}

  return commands;
}

export async function discoverCommands(basePath: string, subpath?: string): Promise<Command[]> {
  const commands: Command[] = [];
  const seenNames = new Set<string>();
  const searchPath = subpath ? join(basePath, subpath) : basePath;

  const commandsDirs = await findCommandsDirs(searchPath);

  for (const commandsDir of commandsDirs) {
    const dirCommands = await readCommandsFromDir(commandsDir);
    for (const command of dirCommands) {
      if (!seenNames.has(command.name)) {
        commands.push(command);
        seenNames.add(command.name);
      }
    }
  }

  return commands;
}
