import { Octokit } from "@octokit/rest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RepoCandidate } from "../config/types.js";
import { writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { researchConfigSchema } from "./config.js";

export interface DiscoverOptions {
  cwd: string;
  output?: string;
  token?: string;
  limit?: number;
}

export async function discoverRepos(options: DiscoverOptions): Promise<RepoCandidate[]> {
  const packageRoot = findPackageRoot();
  const configPath = join(packageRoot, "research", "scan-config.json");
  const config = researchConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const token = options.token ?? process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN is required for GitHub API research discovery.");
  }

  const octokit = new Octokit({ auth: token });
  const deduped = new Map<string, RepoCandidate>();
  const maxRepos = options.limit ?? config.maxRepos;

  for (const category of config.categories) {
    for (const query of category.queries) {
      if (deduped.size >= maxRepos) break;

      const response = await octokit.search.repos({
        q: `${query} archived:false pushed:>=${config.activeSince} stars:>=${config.minStars}`,
        sort: "stars",
        order: "desc",
        per_page: Math.min(30, category.targetCount)
      });

      for (const repo of response.data.items) {
        if (deduped.size >= maxRepos) break;
        deduped.set(repo.full_name, {
          fullName: repo.full_name,
          htmlUrl: repo.html_url,
          description: repo.description ?? "",
          stars: repo.stargazers_count,
          pushedAt: repo.pushed_at ?? "",
          language: repo.language,
          topics: repo.topics ?? [],
          category: category.name
        });
      }
    }
  }

  const candidates = [...deduped.values()].slice(0, maxRepos);
  const output = options.output ?? join(options.cwd, "research", "repo-candidates.json");
  writeText(output, `${JSON.stringify(candidates, null, 2)}\n`);
  return candidates;
}
