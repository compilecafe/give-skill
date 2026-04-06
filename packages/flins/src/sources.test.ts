import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as tar from "tar-stream";
import { gzipSync, strToU8, zipSync } from "fflate";
import {
  cleanupSource,
  downloadSource,
  getWellKnownHost,
  getWellKnownOrigin,
  isWellKnownSource,
  listWellKnownSource,
  parseGitSource,
} from "@/sources";

const originalFetch = globalThis.fetch;
const schema = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function sha256(bytes: Uint8Array) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function createIndex(skill: {
  name: string;
  description: string;
  type: "skill-md" | "archive";
  url: string;
  digest: string;
}) {
  return {
    $schema: schema,
    skills: [skill],
  };
}

function createSkillMarkdown(name: string, description: string) {
  return strToU8(
    ["---", `name: ${name}`, `description: ${description}`, "---", "", "# Skill"].join("\n"),
  );
}

async function createTarGzArchive(files: Record<string, Uint8Array>) {
  const pack = tar.pack();
  const chunks: Buffer[] = [];

  const archive = new Promise<Uint8Array>((resolve, reject) => {
    pack.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    pack.on("end", () => {
      resolve(gzipSync(Buffer.concat(chunks)));
    });
    pack.on("error", reject);
  });

  for (const [fileName, content] of Object.entries(files)) {
    pack.entry({ name: fileName }, Buffer.from(content));
  }

  pack.finalize();

  return await archive;
}

test("detects well-known hosts from website urls with paths", () => {
  expect(getWellKnownHost("https://mintlify.com/docs")).toBe("mintlify.com");
  expect(getWellKnownOrigin("https://mintlify.com/docs")).toBe("https://mintlify.com");
  expect(getWellKnownHost("mintlify.com/docs")).toBe("mintlify.com");
  expect(getWellKnownOrigin("mintlify.com/docs")).toBe("https://mintlify.com");
  expect(isWellKnownSource("https://mintlify.com/docs")).toBe(true);
  expect(isWellKnownSource("mintlify.com/docs")).toBe(true);
});

test("keeps git providers out of well-known detection", () => {
  expect(getWellKnownHost("https://github.com/powroom/flins")).toBeNull();
  expect(getWellKnownHost("codeberg.org/user/repo")).toBeNull();
  expect(isWellKnownSource("https://gitlab.com/user/repo")).toBe(false);
});

test("does not treat domain-like input as github shorthand", () => {
  expect(parseGitSource("mintlify.com/docs")).toEqual({
    url: "mintlify.com/docs",
  });
  expect(parseGitSource("powroom/flins")).toEqual({
    url: "https://github.com/powroom/flins.git",
    subpath: undefined,
  });
});

test("lists modern well-known skills from the RFC endpoint", async () => {
  const requests: string[] = [];
  const skillBytes = createSkillMarkdown("see-ai-news-reader", "Read See AI News");

  globalThis.fetch = (async (input) => {
    const url = String(input);
    requests.push(url);

    if (url === "https://seeai.noval.me/.well-known/agent-skills/index.json") {
      return new Response(
        JSON.stringify(
          createIndex({
            name: "see-ai-news-reader",
            description: "Read See AI News",
            type: "skill-md",
            url: "/.well-known/agent-skills/see-ai-news-reader/SKILL.md",
            digest: sha256(skillBytes),
          }),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  const result = await listWellKnownSource("https://seeai.noval.me/news");

  expect(result).toEqual({
    host: "seeai.noval.me",
    origin: "https://seeai.noval.me",
    skills: [
      {
        name: "see-ai-news-reader",
        description: "Read See AI News",
        type: "skill-md",
        url: "https://seeai.noval.me/.well-known/agent-skills/see-ai-news-reader/SKILL.md",
        digest: sha256(skillBytes),
      },
    ],
  });
  expect(requests).toEqual(["https://seeai.noval.me/.well-known/agent-skills/index.json"]);
});

test("downloads a modern well-known skill from a protocol source", async () => {
  const skillBytes = createSkillMarkdown("see-ai-news-reader", "Read See AI News");

  globalThis.fetch = (async (input) => {
    const url = String(input);

    if (url === "https://seeai.noval.me/.well-known/agent-skills/index.json") {
      return new Response(
        JSON.stringify(
          createIndex({
            name: "see-ai-news-reader",
            description: "Read See AI News",
            type: "skill-md",
            url: "/.well-known/agent-skills/see-ai-news-reader/SKILL.md",
            digest: sha256(skillBytes),
          }),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url === "https://seeai.noval.me/.well-known/agent-skills/see-ai-news-reader/SKILL.md") {
      return new Response(skillBytes, {
        status: 200,
        headers: { "Content-Type": "text/markdown" },
      });
    }

    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  const source = await downloadSource("https://seeai.noval.me");

  try {
    expect(source.kind).toBe("well-known");
    expect(source.label).toBe("seeai.noval.me");
    expect(source.url).toBe("well-known:https://seeai.noval.me");
    expect(readFileSync(`${source.root}/see-ai-news-reader/SKILL.md`, "utf-8")).toContain(
      "name: see-ai-news-reader",
    );
  } finally {
    await cleanupSource(source);
  }
});

test("downloads a tar.gz archive skill", async () => {
  const archive = await createTarGzArchive({
    "SKILL.md": createSkillMarkdown("wrangler", "Deploy workers"),
    "references/COMMANDS.md": strToU8("deploy"),
  });

  globalThis.fetch = (async (input) => {
    const url = String(input);

    if (url === "https://example.com/.well-known/agent-skills/index.json") {
      return new Response(
        JSON.stringify(
          createIndex({
            name: "wrangler",
            description: "Deploy workers",
            type: "archive",
            url: "/.well-known/agent-skills/wrangler.tar.gz",
            digest: sha256(archive),
          }),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url === "https://example.com/.well-known/agent-skills/wrangler.tar.gz") {
      return new Response(archive, {
        status: 200,
        headers: { "Content-Type": "application/gzip" },
      });
    }

    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  const source = await downloadSource("https://example.com");

  try {
    expect(readFileSync(`${source.root}/wrangler/SKILL.md`, "utf-8")).toContain("name: wrangler");
    expect(readFileSync(`${source.root}/wrangler/references/COMMANDS.md`, "utf-8")).toBe("deploy");
  } finally {
    await cleanupSource(source);
  }
});

test("downloads a zip archive skill", async () => {
  const archive = zipSync({
    "SKILL.md": createSkillMarkdown("wrangler", "Deploy workers"),
    "assets/template.txt": strToU8("worker"),
  });

  globalThis.fetch = (async (input) => {
    const url = String(input);

    if (url === "https://example.com/.well-known/agent-skills/index.json") {
      return new Response(
        JSON.stringify(
          createIndex({
            name: "wrangler",
            description: "Deploy workers",
            type: "archive",
            url: "/.well-known/agent-skills/wrangler.zip",
            digest: sha256(archive),
          }),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url === "https://example.com/.well-known/agent-skills/wrangler.zip") {
      return new Response(archive, {
        status: 200,
        headers: { "Content-Type": "application/zip" },
      });
    }

    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  const source = await downloadSource("https://example.com");

  try {
    expect(readFileSync(`${source.root}/wrangler/SKILL.md`, "utf-8")).toContain("name: wrangler");
    expect(readFileSync(`${source.root}/wrangler/assets/template.txt`, "utf-8")).toBe("worker");
  } finally {
    await cleanupSource(source);
  }
});

test("rejects a digest mismatch", async () => {
  const skillBytes = createSkillMarkdown("see-ai-news-reader", "Read See AI News");

  globalThis.fetch = (async (input) => {
    const url = String(input);

    if (url === "https://example.com/.well-known/agent-skills/index.json") {
      return new Response(
        JSON.stringify(
          createIndex({
            name: "see-ai-news-reader",
            description: "Read See AI News",
            type: "skill-md",
            url: "/.well-known/agent-skills/see-ai-news-reader/SKILL.md",
            digest: sha256(strToU8("different")),
          }),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url === "https://example.com/.well-known/agent-skills/see-ai-news-reader/SKILL.md") {
      return new Response(skillBytes, {
        status: 200,
        headers: { "Content-Type": "text/markdown" },
      });
    }

    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  await expect(downloadSource("https://example.com")).rejects.toThrow(
    "Digest mismatch for see-ai-news-reader",
  );
});

test("rejects an unsafe tar archive", async () => {
  const archive = await createTarGzArchive({
    "../SKILL.md": createSkillMarkdown("wrangler", "Deploy workers"),
  });

  globalThis.fetch = (async (input) => {
    const url = String(input);

    if (url === "https://example.com/.well-known/agent-skills/index.json") {
      return new Response(
        JSON.stringify(
          createIndex({
            name: "wrangler",
            description: "Deploy workers",
            type: "archive",
            url: "/.well-known/agent-skills/wrangler.tar.gz",
            digest: sha256(archive),
          }),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url === "https://example.com/.well-known/agent-skills/wrangler.tar.gz") {
      return new Response(archive, {
        status: 200,
        headers: { "Content-Type": "application/gzip" },
      });
    }

    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  await expect(downloadSource("https://example.com")).rejects.toThrow(
    "Unsafe archive entry path: ../SKILL.md",
  );
});
