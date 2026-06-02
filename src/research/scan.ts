import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { simpleGit } from "simple-git";
import type { RepoCandidate, RepoFinding } from "../config/types.js";
import { writeText } from "../utils/fs.js";
import { analyzeRepository } from "./analyze.js";

export interface ScanOptions {
  cwd: string;
  candidatesPath?: string;
  workdir?: string;
  keepClones?: boolean;
}

function findingToMarkdown(finding: RepoFinding): string {
  const total = Object.values(finding.score).reduce((sum, value) => sum + value, 0);

  return `# Repo Finding: ${finding.candidate.fullName}

## Why It Was Selected
- Category: ${finding.candidate.category}
- Stars: ${finding.candidate.stars}
- Last pushed: ${finding.candidate.pushedAt}
- Language: ${finding.candidate.language ?? "unknown"}
- URL: ${finding.candidate.htmlUrl}
- Score: ${total}/45

## Score
\`\`\`json
${JSON.stringify(finding.score, null, 2)}
\`\`\`

## Strong Practices
${finding.strongPractices.map((item) => `- ${item}`).join("\n") || "- None detected by static scan."}

## Weaknesses / Not Worth Copying Blindly
${finding.weakPractices.map((item) => `- ${item}`).join("\n") || "- None detected by static scan."}

## Files Worth Studying
${finding.selectedFiles.map((item) => `- \`${item}\``).join("\n") || "- No high-signal files detected."}

## Patterns To Adopt
${finding.patternsToAdopt.map((item) => `- ${item}`).join("\n")}

## Impact On Agent Kit
${finding.impactOnKit.map((item) => `- ${item}`).join("\n")}
`;
}

export async function scanRepos(options: ScanOptions): Promise<RepoFinding[]> {
  const candidatesPath = options.candidatesPath ?? join(options.cwd, "research", "repo-candidates.json");
  if (!existsSync(candidatesPath)) {
    throw new Error(`Candidates file not found: ${candidatesPath}`);
  }

  const candidates = JSON.parse(readFileSync(candidatesPath, "utf8")) as RepoCandidate[];
  const workdir = options.workdir ?? join(options.cwd, "research", "workdir");
  mkdirSync(workdir, { recursive: true });
  mkdirSync(join(options.cwd, "research", "findings"), { recursive: true });

  const findings: RepoFinding[] = [];
  const git = simpleGit();

  for (const candidate of candidates) {
    const repoSlug = candidate.fullName.replace("/", "__");
    const repoPath = join(workdir, repoSlug);
    if (existsSync(repoPath)) rmSync(repoPath, { recursive: true, force: true });

    await git.raw(["clone", "--depth", "1", candidate.htmlUrl, repoPath]);
    const finding = analyzeRepository(candidate, repoPath);
    findings.push(finding);

    writeText(join(options.cwd, "research", "findings", `${repoSlug}.md`), findingToMarkdown(finding));

    if (!options.keepClones) {
      rmSync(repoPath, { recursive: true, force: true });
    }
  }

  return findings;
}
