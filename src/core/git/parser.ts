import type { ParsedSource } from "@/types/skills";

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
