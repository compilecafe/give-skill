import { basename, dirname } from "path";
import type { Skill } from "../../types/skills.js";

interface FrontmatterResult {
  data: Record<string, string>;
  content: string;
}

export function parseFrontmatter(content: string): FrontmatterResult {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const yamlSection = match[1]!;
  const bodyContent = match[2]!;
  const data: Record<string, string> = {};

  for (const line of yamlSection.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      data[key] = value.slice(1, -1);
    } else if (key === "metadata") {
      try {
        const metadata: Record<string, string> = {};
        const metadataStr = value.replace(/^\{|\}$/g, "").trim();
        if (metadataStr) {
          for (const pair of metadataStr.split(",")) {
            const [k, v] = pair.split("=").map((s) => s.trim());
            if (k && v) {
              metadata[k] = v.replace(/^['"]|["']$/g, "");
            }
          }
          data[key] = JSON.stringify(metadata);
        }
      } catch {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }

  return { data, content: bodyContent };
}

export function parseSkillMd(skillMdPath: string, content: string): Skill | null {
  try {
    const { data } = parseFrontmatter(content);

    if (!data.name || !data.description) {
      return null;
    }

    return {
      name: data.name,
      description: data.description,
      path: dirname(skillMdPath),
      metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
    };
  } catch {
    return null;
  }
}

export function getSkillDisplayName(skill: Skill): string {
  return skill.name || basename(skill.path);
}
