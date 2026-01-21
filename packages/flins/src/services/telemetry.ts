import { platform, arch } from "node:os";
import packageJson from "../../package.json" with { type: "json" };

const TELEMETRY_URL = "https://tidy-oriole-956.convex.cloud/telemetry";
const version = packageJson.version;

const isCI = Boolean(
  process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.TRAVIS ||
    process.env.JENKINS_URL ||
    process.env.BITBUCKET_BUILD_NUMBER ||
    process.env.CODEBUILD_BUILD_ID
);

const ENABLED = !isCI && process.env.FLINS_TELEMETRY !== "0" && process.env.NODE_ENV !== "test";

let pending: { command: string; timestamp: number }[] | null = null;
let scheduled = false;

async function flush() {
  if (!pending?.length) return;
  const events = pending;
  pending = null;
  scheduled = false;
  try {
    await fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...events[0],
        osPlatform: platform(),
        osArch: arch(),
        nodeVersion: process.version,
        cliVersion: version,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {}
}

export function track(command: string) {
  if (!ENABLED) return;
  (pending ??= []).push({ command, timestamp: Date.now() });
  if (!scheduled) {
    scheduled = true;
    setTimeout(() => flush(), 1000).unref();
  }
}

export function flushSync() {
  flush();
}
