import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, posix } from "node:path";
import { Readable } from "node:stream";
import { gunzipSync } from "node:zlib";
import * as tar from "tar-stream";
import * as yauzl from "yauzl";

const directoryUrl = "https://flins.tech/directory.json";
const wellKnownPath = "/.well-known/agent-skills";
const supportedWellKnownSchema = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";
const maxArchiveBytes = 50 * 1024 * 1024;
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

interface WellKnownLocation {
  host: string;
  origin: string;
}

interface WellKnownSkill {
  name: string;
  description: string;
  type: "skill-md" | "archive";
  url: string;
  digest: string;
}

interface WellKnownSkillIndex {
  host: string;
  origin: string;
  skills: WellKnownSkill[];
}

type ArchiveFormat = "tar.gz" | "zip";

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

function getWellKnownLocation(value: string): WellKnownLocation | null {
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

    return {
      host,
      origin: parsed.origin,
    };
  }

  const host = normalizedValue.split("/")[0]!.replace(/\/$/, "").toLowerCase();
  if (!isDomainHost(host)) {
    return null;
  }

  if (!explicitWellKnown && knownGitHosts.has(host)) {
    return null;
  }

  return {
    host,
    origin: `https://${host}`,
  };
}

export function getWellKnownHost(value: string) {
  return getWellKnownLocation(value)?.host ?? null;
}

export function getWellKnownOrigin(value: string) {
  return getWellKnownLocation(value)?.origin ?? null;
}

function getWellKnownIndexUrl(location: WellKnownLocation) {
  return `${location.origin}${wellKnownPath}/index.json`;
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

function parseDigest(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!/^sha256:[0-9a-f]{64}$/.test(normalized)) {
    throw new Error(`Invalid digest format: ${value}`);
  }

  return normalized.slice("sha256:".length);
}

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizeArchivePath(filePath: string) {
  if (!filePath) {
    throw new Error("Archive entry path is empty");
  }

  if (filePath.startsWith("/") || /^[a-z]:\//i.test(filePath) || filePath.includes("\0")) {
    throw new Error(`Unsafe archive entry path: ${filePath}`);
  }

  const normalized = posix.normalize(filePath.replace(/\\/g, "/"));
  const segments = normalized.split("/");

  if (
    normalized === "." ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    segments.includes("..")
  ) {
    throw new Error(`Unsafe archive entry path: ${filePath}`);
  }

  return normalized.replace(/^\.\/+/, "").replace(/\/$/, "");
}

function detectArchiveFormat(url: string, contentType: string | null): ArchiveFormat {
  const normalizedContentType = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (
    normalizedContentType === "application/gzip" ||
    normalizedContentType === "application/x-gzip"
  ) {
    return "tar.gz";
  }

  if (normalizedContentType === "application/zip") {
    return "zip";
  }

  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".tar.gz") || pathname.endsWith(".tgz")) {
    return "tar.gz";
  }

  if (pathname.endsWith(".zip")) {
    return "zip";
  }

  throw new Error(`Unsupported archive format for ${url}`);
}

function normalizeWellKnownSkills(payload: unknown, indexUrl: string) {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray((payload as { skills?: unknown[] }).skills)
  ) {
    throw new Error(`Invalid skill index format from ${new URL(indexUrl).host}`);
  }

  const baseUrl = new URL(indexUrl);
  const schema =
    typeof (payload as { $schema?: unknown }).$schema === "string"
      ? (payload as { $schema: string }).$schema
      : null;

  if (schema !== supportedWellKnownSchema) {
    throw new Error(`Unsupported discovery schema from ${baseUrl.host}`);
  }

  const skills = (payload as { skills: unknown[] }).skills;

  const installableSkills: WellKnownSkill[] = [];

  for (const skill of skills) {
    if (!skill || typeof skill !== "object") {
      throw new Error(`Invalid skill entry from ${baseUrl.host}`);
    }

    const { name, description, type, url, digest } = skill as {
      name?: unknown;
      description?: unknown;
      type?: unknown;
      url?: unknown;
      digest?: unknown;
    };

    if (typeof name !== "string" || typeof description !== "string") {
      throw new Error(`Invalid skill entry from ${baseUrl.host}`);
    }

    if (!/^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/.test(name)) {
      throw new Error(`Invalid skill name from ${baseUrl.host}: ${name}`);
    }

    if (type !== "skill-md" && type !== "archive") {
      continue;
    }

    if (typeof url !== "string" || typeof digest !== "string") {
      throw new Error(`Invalid skill entry from ${baseUrl.host}`);
    }

    parseDigest(digest);
    installableSkills.push({
      name,
      description,
      type,
      url: new URL(url, baseUrl).toString(),
      digest,
    });
  }

  return installableSkills;
}

async function fetchWellKnownIndex(location: WellKnownLocation): Promise<WellKnownSkillIndex> {
  const indexUrl = getWellKnownIndexUrl(location);
  const payload = await fetchJson(indexUrl, 10000);

  return {
    host: location.host,
    origin: location.origin,
    skills: normalizeWellKnownSkills(payload, indexUrl),
  };
}

async function extractTarArchive(skillRoot: string, bytes: Uint8Array) {
  await new Promise<void>((resolve, reject) => {
    const extract = tar.extract();
    const source = Readable.from(Buffer.from(gunzipSync(bytes)));
    let totalBytes = 0;
    let settled = false;

    const fail = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    extract.on("entry", (header, stream, next) => {
      void (async () => {
        if (header.type === "symlink" || header.type === "link") {
          throw new Error(`Unsafe archive entry in ${basename(skillRoot)}: ${header.name}`);
        }

        const relativePath = normalizeArchivePath(header.name);
        const targetPath = join(skillRoot, relativePath);

        if (header.type === "directory") {
          mkdirSync(targetPath, { recursive: true });
          stream.resume();
          return;
        }

        if (header.type !== "file") {
          stream.resume();
          return;
        }

        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          totalBytes += buffer.length;
          if (totalBytes > maxArchiveBytes) {
            throw new Error(`Archive exceeds ${maxArchiveBytes} bytes after extraction`);
          }
          chunks.push(buffer);
        }

        mkdirSync(dirname(targetPath), { recursive: true });
        writeFileSync(targetPath, Buffer.concat(chunks));
      })()
        .then(() => next())
        .catch((error) => {
          stream.resume();
          fail(error);
        });
    });

    extract.on("finish", () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    });

    extract.on("error", fail);
    source.on("error", fail);
    source.pipe(extract);
  });
}

async function extractZipArchive(skillRoot: string, bytes: Uint8Array) {
  await new Promise<void>((resolve, reject) => {
    yauzl.fromBuffer(
      Buffer.from(bytes),
      {
        decodeStrings: true,
        lazyEntries: true,
        strictFileNames: true,
        validateEntrySizes: true,
      },
      (error, zipfile) => {
        if (error || !zipfile) {
          reject(error instanceof Error ? error : new Error("Unable to open zip archive"));
          return;
        }

        let totalBytes = 0;
        let finished = false;

        const fail = (reason: unknown) => {
          if (finished) {
            return;
          }

          finished = true;
          zipfile.close();
          reject(reason instanceof Error ? reason : new Error(String(reason)));
        };

        zipfile.on("entry", (entry) => {
          try {
            const unixMode =
              entry.versionMadeBy >> 8 === 3 ? entry.externalFileAttributes >>> 16 : 0;

            if ((unixMode & 0o170000) === 0o120000) {
              fail(new Error(`Unsafe archive entry in ${basename(skillRoot)}: ${entry.fileName}`));
              return;
            }

            const relativePath = normalizeArchivePath(entry.fileName);
            const targetPath = join(skillRoot, relativePath);

            if (entry.fileName.endsWith("/") || (unixMode & 0o170000) === 0o040000) {
              mkdirSync(targetPath, { recursive: true });
              zipfile.readEntry();
              return;
            }

            totalBytes += entry.uncompressedSize;
            if (totalBytes > maxArchiveBytes) {
              fail(new Error(`Archive exceeds ${maxArchiveBytes} bytes after extraction`));
              return;
            }

            zipfile.openReadStream(entry, (streamError, stream) => {
              if (streamError || !stream) {
                fail(
                  streamError instanceof Error
                    ? streamError
                    : new Error("Unable to read zip entry"),
                );
                return;
              }

              const chunks: Buffer[] = [];

              stream.on("data", (chunk) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              });

              stream.on("end", () => {
                mkdirSync(dirname(targetPath), { recursive: true });
                writeFileSync(targetPath, Buffer.concat(chunks));
                zipfile.readEntry();
              });

              stream.on("error", fail);
            });
          } catch (entryError) {
            fail(entryError);
          }
        });

        zipfile.once("end", () => {
          if (!finished) {
            finished = true;
            resolve();
          }
        });

        zipfile.once("error", fail);
        zipfile.readEntry();
      },
    );
  });
}

async function downloadWellKnownSkill(root: string, skill: WellKnownSkill) {
  const skillRoot = join(root, skill.name);
  mkdirSync(skillRoot, { recursive: true });

  const response = await fetch(skill.url, {
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${skill.url}: ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (sha256(bytes) !== parseDigest(skill.digest)) {
    throw new Error(`Digest mismatch for ${skill.name}`);
  }

  if (skill.type === "skill-md") {
    writeFileSync(join(skillRoot, "SKILL.md"), Buffer.from(bytes));
    return;
  }

  const archiveFormat = detectArchiveFormat(skill.url, response.headers.get("content-type"));

  if (archiveFormat === "tar.gz") {
    await extractTarArchive(skillRoot, bytes);
  } else {
    await extractZipArchive(skillRoot, bytes);
  }

  if (!existsSync(join(skillRoot, "SKILL.md"))) {
    throw new Error(`Archive for ${skill.name} must contain SKILL.md at the root`);
  }
}

async function downloadWellKnownIndex(index: WellKnownSkillIndex): Promise<SourceBundle> {
  const root = mkdtempSync(join(tmpdir(), "flins-wellknown-"));

  for (const skill of index.skills) {
    await downloadWellKnownSkill(root, skill);
  }

  return {
    kind: "well-known",
    label: index.host,
    url: `well-known:${index.origin}`,
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
  return getWellKnownLocation(value) !== null;
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
  if (
    shorthandOwner &&
    githubShorthand[2] &&
    !value.includes(":") &&
    !shorthandOwner.includes(".")
  ) {
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
  const location = getWellKnownLocation(source);
  if (!location) {
    return null;
  }

  return await fetchWellKnownIndex(location);
}

export async function downloadSource(source: string) {
  const location = getWellKnownLocation(source);
  if (!location) {
    return downloadGitSource(trimWellKnownPrefix(source));
  }

  return downloadWellKnownIndex(await fetchWellKnownIndex(location));
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
