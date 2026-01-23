import { mkdir, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { tmpdir } from "os";
import type { WellKnownSkillIndex, WellKnownSkillEntry } from "@/types/skills";

const WELL_KNOWN_PATH = "/.well-known/skills";

const indexCache = new Map<string, { data: WellKnownSkillIndex; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

function cleanHost(host: string): string {
  return host.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function buildIndexUrl(host: string): string {
  return `https://${cleanHost(host)}${WELL_KNOWN_PATH}/index.json`;
}

function buildSkillFileUrl(host: string, skillName: string, filePath: string): string {
  return `https://${cleanHost(host)}${WELL_KNOWN_PATH}/${skillName}/${filePath}`;
}

export function buildSkillUrl(host: string, skillName: string): string {
  return `https://${cleanHost(host)}${WELL_KNOWN_PATH}/${skillName}/SKILL.md`;
}

async function fetchIndex(host: string): Promise<WellKnownSkillIndex> {
  const now = Date.now();
  const cached = indexCache.get(host);

  if (cached && now < cached.expiry) {
    return cached.data;
  }

  const url = buildIndexUrl(host);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch skill index from ${host}: ${response.status}`);
  }

  const data = (await response.json()) as WellKnownSkillIndex;

  if (!data.skills || !Array.isArray(data.skills)) {
    throw new Error(`Invalid skill index format from ${host}: missing 'skills' array`);
  }

  indexCache.set(host, { data, expiry: now + CACHE_DURATION });
  return data;
}

export async function listSkills(host: string): Promise<WellKnownSkillEntry[]> {
  const index = await fetchIndex(host);
  return index.skills;
}

async function downloadSkillFiles(
  host: string,
  skill: WellKnownSkillEntry,
  targetDir: string,
): Promise<void> {
  const skillDir = join(targetDir, skill.name);
  await mkdir(skillDir, { recursive: true });

  const downloadPromises = skill.files.map(async (filePath) => {
    const url = buildSkillFileUrl(host, skill.name, filePath);
    const localPath = join(skillDir, filePath);

    await mkdir(dirname(localPath), { recursive: true });

    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Failed to download ${filePath}: ${response.status}`);
    }

    const content = await response.text();
    await writeFile(localPath, content, "utf-8");
  });

  await Promise.all(downloadPromises);
}

export async function downloadSkills(
  host: string,
  skillNames?: string[],
): Promise<{ tempDir: string; skills: WellKnownSkillEntry[] }> {
  const index = await fetchIndex(host);
  const hostSlug = cleanHost(host).replace(/[^a-zA-Z0-9]/g, "-");
  const tempDir = join(tmpdir(), `flins-wellknown-${hostSlug}-${Date.now()}`);

  await mkdir(tempDir, { recursive: true });

  let skillsToDownload = index.skills;

  if (skillNames && skillNames.length > 0) {
    skillsToDownload = index.skills.filter((s) =>
      skillNames.some((name) => s.name.toLowerCase() === name.toLowerCase()),
    );

    if (skillsToDownload.length === 0) {
      const available = index.skills.map((s) => s.name).join(", ");
      throw new Error(`No matching skills found. Available: ${available}`);
    }
  }

  await Promise.all(skillsToDownload.map((skill) => downloadSkillFiles(host, skill, tempDir)));

  return { tempDir, skills: skillsToDownload };
}

export function cleanupTempDir(dir: string): void {
  const { rmSync } = require("fs");
  rmSync(dir, { recursive: true, force: true });
}
