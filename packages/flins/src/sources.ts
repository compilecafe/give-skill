import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const directoryUrl = "https://flins.tech/directory.json";
const wellKnownPath = "/.well-known/skills";

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

function normalizeHost(host: string) {
  return host.replace(/^https?:\/\//, "").replace(/\/$/, "");
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
  if (value.includes("/") && !value.includes("://")) {
    return false;
  }

  if (value.includes("github.com") || value.includes("gitlab.com") || value.endsWith(".git")) {
    return false;
  }

  return /^(?:https?:\/\/)?([a-z0-9][-a-z0-9]*\.)+[a-z]{2,}$/i.test(value);
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
  if (githubShorthand && !value.includes(":")) {
    return {
      url: `https://github.com/${githubShorthand[1]}/${githubShorthand[2]}.git`,
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
  const normalized = source.startsWith("well-known:") ? source.slice("well-known:".length) : source;
  if (!isWellKnownSource(normalized)) {
    return null;
  }

  return {
    host: normalizeHost(normalized),
    skills: await listWellKnownSkills(normalized),
  };
}

export async function downloadSource(source: string) {
  const normalized = source.startsWith("well-known:") ? source.slice("well-known:".length) : source;
  return isWellKnownSource(normalized)
    ? downloadWellKnownSource(normalized)
    : downloadGitSource(normalized);
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
