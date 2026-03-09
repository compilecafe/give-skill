import { spawn } from "node:child_process";
import { arch, platform } from "node:os";
import packageJson from "../package.json" with { type: "json" };

type TelemetryCommand = "add";

export interface TelemetryEvent {
  command: TelemetryCommand;
  type?: "skill" | "command";
  repo?: string;
  sourceUrl?: string;
  name?: string;
  agent?: string;
  scope?: "global" | "project";
  success?: boolean;
}

interface TelemetryPayload extends TelemetryEvent {
  timestamp: number;
  osPlatform: string;
  osArch: string;
  nodeVersion: string;
  cliVersion: string;
}

const telemetryUrl = "https://tidy-oriole-956.convex.site/telemetry";
const telemetryEnabled =
  !process.env.CI &&
  !process.env.CONTINUOUS_INTEGRATION &&
  !process.env.GITHUB_ACTIONS &&
  !process.env.GITLAB_CI &&
  !process.env.TRAVIS &&
  !process.env.JENKINS_URL &&
  !process.env.BITBUCKET_BUILD_NUMBER &&
  !process.env.CODEBUILD_BUILD_ID &&
  process.env.FLINS_TELEMETRY !== "0" &&
  process.env.NODE_ENV !== "test";

let pendingEvents: TelemetryPayload[] = [];

function normalizeRepo(source: string) {
  const githubTree = source.match(
    /github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?(?:\/tree\/[^/]+\/(.+?))?(?:\/)?(?:[#]|$)/i,
  );
  if (githubTree) {
    return githubTree[2] ? `${githubTree[1]}/${githubTree[2]}` : githubTree[1];
  }

  const gitlabTree = source.match(
    /gitlab\.com[/:]([^/]+\/[^/]+?)(?:\.git)?(?:\/-\/tree\/[^/]+\/(.+?))?(?:\/)?(?:[#]|$)/i,
  );
  if (gitlabTree) {
    return gitlabTree[2] ? `${gitlabTree[1]}/${gitlabTree[2]}` : gitlabTree[1];
  }

  const shorthand = source.match(/^([^/]+\/[^/]+?)(?:\/(.+?))?(?:\/)?$/);
  if (shorthand) {
    return shorthand[2] ? `${shorthand[1]}/${shorthand[2]}` : shorthand[1];
  }

  return source.replace(/\.git$/, "").replace(/\/$/, "");
}

export function trackTelemetry(event: TelemetryEvent) {
  if (!telemetryEnabled) {
    return;
  }

  pendingEvents.push({
    ...event,
    repo: event.repo ? normalizeRepo(event.repo) : undefined,
    timestamp: Date.now(),
    osPlatform: platform(),
    osArch: arch(),
    nodeVersion: process.version,
    cliVersion: packageJson.version,
  });
}

export function flushTelemetry() {
  if (!telemetryEnabled || pendingEvents.length === 0) {
    return;
  }

  const events = pendingEvents;
  pendingEvents = [];

  const child = spawn(
    "curl",
    [
      "-s",
      "-X",
      "POST",
      telemetryUrl,
      "-H",
      "Content-Type: application/json",
      "-d",
      JSON.stringify(events),
      "--max-time",
      "10",
    ],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    },
  );

  child.unref();
}
