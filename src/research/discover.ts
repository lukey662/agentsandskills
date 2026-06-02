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
  const excludedRepos = new Set(config.excludeRepos.map((repo) => repo.toLowerCase()));

  for (const category of config.categories) {
    let categoryCount = 0;

    for (const query of category.queries) {
      if (deduped.size >= maxRepos || categoryCount >= category.targetCount) break;

      const response = await octokit.search.repos({
        q: `${query} archived:false pushed:>=${config.activeSince} stars:>=${config.minStars}`,
        sort: "stars",
        order: "desc",
        per_page: 100
      });

      for (const repo of response.data.items) {
        if (deduped.size >= maxRepos || categoryCount >= category.targetCount) break;
        if (deduped.has(repo.full_name)) continue;
        if (excludedRepos.has(repo.full_name.toLowerCase())) continue;

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
        categoryCount += 1;
      }
    }
  }

  for (const seed of config.seedRepos) {
    if (deduped.size >= maxRepos) break;
    if (deduped.has(seed.fullName)) continue;
    if (excludedRepos.has(seed.fullName.toLowerCase())) continue;

    const [owner, repo] = seed.fullName.split("/");
    if (!owner || !repo) continue;

    try {
      const response = await octokit.repos.get({ owner, repo });
      deduped.set(response.data.full_name, {
        fullName: response.data.full_name,
        htmlUrl: response.data.html_url,
        description: response.data.description ?? "",
        stars: response.data.stargazers_count,
        pushedAt: response.data.pushed_at ?? "",
        language: response.data.language,
        topics: response.data.topics ?? [],
        category: seed.category
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping seed repo ${seed.fullName}: ${message}`);
    }
  }

  const candidates = [...deduped.values()].slice(0, maxRepos);
  const output = options.output ?? join(options.cwd, "research", "repo-candidates.json");
  writeText(output, `${JSON.stringify(candidates, null, 2)}\n`);
  return candidates;
}
