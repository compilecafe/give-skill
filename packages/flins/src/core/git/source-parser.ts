import type { ParsedSource } from "@/types/skills";

export function isWellKnownSource(source: string): boolean {
  if (source.includes("/") && !source.includes("://")) {
    return false;
  }

  if (source.includes("github.com") || source.includes("gitlab.com")) {
    return false;
  }

  if (source.endsWith(".git")) {
    return false;
  }

  const pattern = /^(?:https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
  return pattern.test(source);
}

export function buildFileUrl(parsed: ParsedSource, tempDir: string, filePath: string): string {
  const baseUrl = parsed.url.replace(/\.git$/, "");
  const branch = parsed.branch ?? "main";

  const relativePath = filePath.startsWith(tempDir)
    ? filePath.slice(tempDir.length).replace(/^\//, "")
    : filePath;

  if (parsed.type === "github") {
    return `${baseUrl}/blob/${branch}/${relativePath}`;
  }

  if (parsed.type === "gitlab") {
    return `${baseUrl}/-/blob/${branch}/${relativePath}`;
  }

  return parsed.url;
}

export function parseSource(input: string): ParsedSource {
  const githubTreeMatch = input.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/(.+))?$/);
  if (githubTreeMatch) {
    const [, owner, repo, branch, subpath] = githubTreeMatch;
    return {
      type: "github",
      url: `https://github.com/${owner}/${repo}.git`,
      branch,
      subpath,
    };
  }

  const githubRepoMatch = input.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (githubRepoMatch) {
    const [, owner, repo] = githubRepoMatch;
    const cleanRepo = repo!.replace(/\.git$/, "");
    return {
      type: "github",
      url: `https://github.com/${owner}/${cleanRepo}.git`,
    };
  }

  const gitlabTreeMatch = input.match(
    /gitlab\.com\/([^/]+)\/([^/]+)\/-\/tree\/([^/]+)(?:\/(.+))?$/,
  );
  if (gitlabTreeMatch) {
    const [, owner, repo, branch, subpath] = gitlabTreeMatch;
    return {
      type: "gitlab",
      url: `https://gitlab.com/${owner}/${repo}.git`,
      branch,
      subpath,
    };
  }

  const gitlabRepoMatch = input.match(/gitlab\.com\/([^/]+)\/([^/]+)/);
  if (gitlabRepoMatch) {
    const [, owner, repo] = gitlabRepoMatch;
    const cleanRepo = repo!.replace(/\.git$/, "");
    return {
      type: "gitlab",
      url: `https://gitlab.com/${owner}/${cleanRepo}.git`,
    };
  }

  const shorthandMatch = input.match(/^([^/]+)\/([^/]+)(?:\/(.+))?$/);
  if (shorthandMatch && !input.includes(":")) {
    const [, owner, repo, subpath] = shorthandMatch;
    return {
      type: "github",
      url: `https://github.com/${owner}/${repo}.git`,
      subpath,
    };
  }

  return {
    type: "git",
    url: input,
  };
}
