import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const directoryUrl = "https://flins.tech/directory.json";
const wellKnownPath = "/.well-known/skills";
const knownGitHosts = new Set([
  "bitbucket.org",
  "dev.azure.com",
  "codeberg.org",
  "framagit.org",
  "gitea.com",
  "git.sr.ht",
  "git.disroot.org",
  "github.com",
  "git.launchpad.net",
  "gitlab.com",
  "hg.sr.ht",
  "launchpad.net",
  "notabug.org",
  "pagure.io",
  "repo.or.cz",
  "sourcehut.org",
]);

export interface DirectoryEntry {
  name: string;
  source: string;
  description: string;
  author?: string;
}

export interface ParsedGitSource {
  url: string;
  branch?: string;
  subpath?: string;
}

export interface SourceBundle {
  kind: "git" | "well-known";
  label: string;
  url: string;
  branch: string;
  commit: string;
  root: string;
  subpath?: string;
}

function hasWellKnownPrefix(value: string) {
  return value.startsWith("well-known:");
}

function trimWellKnownPrefix(value: string) {
  return hasWellKnownPrefix(value) ? value.slice("well-known:".length) : value;
}

function parseHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
  } catch {
    return null;
  }
}

function isDomainHost(value: string) {
  return /^(?:[a-z0-9][-a-z0-9]*\.)+[a-z]{2,}$/i.test(value);
}

function normalizeHost(value: string) {
  const parsed = parseHttpUrl(value);
  if (parsed) {
    return parsed.hostname.toLowerCase();
  }

  return value.split("/")[0]!.replace(/\/$/, "").toLowerCase();
}

export function getWellKnownHost(value: string) {
  const normalizedValue = trimWellKnownPrefix(value).trim().replace(/\/+$/, "");
  if (!normalizedValue || normalizedValue.endsWith(".git")) {
    return null;
  }

  const explicitWellKnown = hasWellKnownPrefix(value);
  const parsed = parseHttpUrl(normalizedValue);
  if (parsed) {
    const host = parsed.hostname.toLowerCase();
    if (!isDomainHost(host)) {
      return null;
    }

    if (!explicitWellKnown && knownGitHosts.has(host)) {
      return null;
    }

    return host;
  }

  const host = normalizeHost(normalizedValue);
  if (!isDomainHost(host)) {
    return null;
  }

  if (!explicitWellKnown && knownGitHosts.has(host)) {
    return null;
  }

  return host;
}

function getWellKnownIndexUrl(host: string) {
  return `https://${normalizeHost(host)}${wellKnownPath}/index.json`;
}

function getWellKnownFileUrl(host: string, skill: string, filePath: string) {
  return `https://${normalizeHost(host)}${wellKnownPath}/${skill}/${filePath}`;
}

function runGit(args: string[], cwd?: string) {
  return new Promise<string>((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const child = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      reject(new Error(stderr.trim() || `git ${args.join(" ")} failed`));
    });
  });
}

async function fetchJson<T>(url: string, timeoutMs: number) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function listWellKnownSkills(host: string) {
  const payload = await fetchJson<{
    skills?: { name: string; description: string; files: string[] }[];
  }>(getWellKnownIndexUrl(host), 10000);

  if (!Array.isArray(payload.skills)) {
    throw new Error(`Invalid skill index format from ${normalizeHost(host)}`);
  }

  return payload.skills;
}

async function downloadWellKnownSource(host: string): Promise<SourceBundle> {
  const normalizedHost = normalizeHost(host);
  const skills = await listWellKnownSkills(normalizedHost);
  const root = mkdtempSync(join(tmpdir(), "flins-wellknown-"));

  for (const skill of skills) {
    for (const filePath of skill.files) {
      const targetPath = join(root, skill.name, filePath);
      mkdirSync(dirname(targetPath), { recursive: true });
      const response = await fetch(getWellKnownFileUrl(normalizedHost, skill.name, filePath), {
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${skill.name}/${filePath}: ${response.status}`);
      }

      writeFileSync(targetPath, await response.text(), "utf-8");
    }
  }

  return {
    kind: "well-known",
    label: normalizedHost,
    url: `well-known:${normalizedHost}`,
    branch: "main",
    commit: "well-known",
    root,
  };
}

async function downloadGitSource(source: string): Promise<SourceBundle> {
  const parsed = parseGitSource(source);
  const root = mkdtempSync(join(tmpdir(), "flins-git-"));
  const branch = parsed.branch ?? "main";
  const args = ["clone", "--depth", "1"];

  if (parsed.branch) {
    args.push("--branch", parsed.branch);
  }

  args.push(parsed.url, root);
  await runGit(args);

  return {
    kind: "git",
    label: parsed.url,
    url: parsed.url,
    branch,
    commit: await runGit(["rev-parse", "HEAD"], root),
    root,
    subpath: parsed.subpath,
  };
}

export function isDirectoryName(value: string) {
  return /^[a-z0-9-]+$/i.test(value) && !value.includes("/") && !value.includes(":");
}

export function isWellKnownSource(value: string) {
  return getWellKnownHost(value) !== null;
}

export function parseGitSource(value: string): ParsedGitSource {
  const githubTree = value.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/(.+))?$/);
  if (githubTree) {
    return {
      url: `https://github.com/${githubTree[1]}/${githubTree[2]}.git`,
      branch: githubTree[3],
      subpath: githubTree[4],
    };
  }

  const githubRepo = value.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (githubRepo) {
    return {
      url: `https://github.com/${githubRepo[1]}/${githubRepo[2]!.replace(/\.git$/, "")}.git`,
    };
  }

  const gitlabTree = value.match(/gitlab\.com\/([^/]+)\/([^/]+)\/-\/tree\/([^/]+)(?:\/(.+))?$/);
  if (gitlabTree) {
    return {
      url: `https://gitlab.com/${gitlabTree[1]}/${gitlabTree[2]}.git`,
      branch: gitlabTree[3],
      subpath: gitlabTree[4],
    };
  }

  const gitlabRepo = value.match(/gitlab\.com\/([^/]+)\/([^/]+)/);
  if (gitlabRepo) {
    return {
      url: `https://gitlab.com/${gitlabRepo[1]}/${gitlabRepo[2]!.replace(/\.git$/, "")}.git`,
    };
  }

  const githubShorthand = value.match(/^([^/]+)\/([^/]+)(?:\/(.+))?$/);
  const shorthandOwner = githubShorthand?.[1];
  if (shorthandOwner && githubShorthand[2] && !value.includes(":") && !shorthandOwner.includes(".")) {
    return {
      url: `https://github.com/${shorthandOwner}/${githubShorthand[2]}.git`,
      subpath: githubShorthand[3],
    };
  }

  return { url: value };
}

export async function listDirectory() {
  return fetchJson<DirectoryEntry[]>(directoryUrl, 5000);
}

export async function resolveDirectorySource(name: string) {
  const entries = await listDirectory();
  return entries.find((entry) => entry.name.toLowerCase() === name.toLowerCase())?.source ?? null;
}

export async function listWellKnownSource(source: string) {
  const host = getWellKnownHost(source);
  if (!host) {
    return null;
  }

  try {
    return {
      host,
      skills: await listWellKnownSkills(host),
    };
  } catch (error) {
    if (hasWellKnownPrefix(source)) {
      throw error;
    }

    return null;
  }
}

export async function downloadSource(source: string) {
  const host = getWellKnownHost(source);
  if (!host) {
    return downloadGitSource(trimWellKnownPrefix(source));
  }

  if (hasWellKnownPrefix(source)) {
    return downloadWellKnownSource(host);
  }

  try {
    return await downloadWellKnownSource(host);
  } catch {
    return downloadGitSource(trimWellKnownPrefix(source));
  }
}

export async function getLatestCommit(url: string, branch: string = "main") {
  if (url.startsWith("well-known:")) {
    return "well-known";
  }

  const output = await runGit(["ls-remote", url, `refs/heads/${branch}`]);
  return output.split(/\s+/)[0] ?? "";
}

export async function cleanupSource(source: SourceBundle) {
  rmSync(source.root, { recursive: true, force: true });
}
