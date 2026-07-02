import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { RepoScore } from "../config/types.js";
import { writeText } from "../utils/fs.js";

const SUMMARY_TARGETS = {
  "nextjs-patterns": {
    title: "Next.js Patterns",
    scoreKeys: ["architecture", "ciDeployment", "documentation"] satisfies (keyof RepoScore)[],
    categories: ["official-nextjs", "production-saas"]
  },
  "supabase-rls-patterns": {
    title: "Supabase RLS Patterns",
    scoreKeys: ["supabaseAuthRls"] satisfies (keyof RepoScore)[],
    categories: ["supabase-nextjs"]
  },
  "security-patterns": {
    title: "Security Patterns",
    scoreKeys: ["security"] satisfies (keyof RepoScore)[],
    categories: ["security-quality", "supabase-nextjs", "production-saas"]
  },
  "frontend-design-patterns": {
    title: "Frontend Design Patterns",
    scoreKeys: ["frontendDesign", "accessibility"] satisfies (keyof RepoScore)[],
    categories: ["design-systems", "production-saas"]
  },
  "testing-patterns": {
    title: "Testing Patterns",
    scoreKeys: ["testing"] satisfies (keyof RepoScore)[],
    categories: ["testing-docs-agents", "official-nextjs", "production-saas"]
  },
  "docs-and-agent-patterns": {
    title: "Docs And Agent Patterns",
    scoreKeys: ["documentation", "agentReadiness"] satisfies (keyof RepoScore)[],
    categories: ["testing-docs-agents", "official-nextjs"]
  },
  "repo-health-patterns": {
    title: "Repo Health Patterns",
    scoreKeys: ["repoHealth", "documentation", "ciDeployment", "security"] satisfies (keyof RepoScore)[],
    categories: ["repo-health-maintainers", "testing-docs-agents", "security-quality", "production-saas"]
  },
  "supply-chain-patterns": {
    title: "Supply Chain Patterns",
    scoreKeys: ["supplyChain", "security", "ciDeployment", "repoHealth"] satisfies (keyof RepoScore)[],
    categories: ["supply-chain-security", "repo-health-maintainers", "security-quality"]
  }
} as const;

interface ParsedFinding {
  file: string;
  fullName: string;
  category: string;
  stars: number;
  score: RepoScore;
  totalScore: number;
  strongPractices: string[];
  weakPractices: string[];
}

const SCORE_KEYS: (keyof RepoScore)[] = [
  "architecture",
  "supabaseAuthRls",
  "security",
  "frontendDesign",
  "accessibility",
  "testing",
  "documentation",
  "ciDeployment",
  "repoHealth",
  "supplyChain",
  "agentReadiness"
];

function sectionBullets(text: string, start: string, end: string): string[] {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) return [];

  const afterStart = text.slice(startIndex + start.length);
  const endIndex = afterStart.indexOf(end);
  const section = endIndex === -1 ? afterStart : afterStart.slice(0, endIndex);

  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") && !line.includes("None detected"))
    .map((line) => line.slice(2));
}

function parseFinding(file: string, text: string): ParsedFinding | null {
  const fullName = text.match(/^# Repo Finding: (.+)$/m)?.[1];
  const category = text.match(/^- Category: (.+)$/m)?.[1];
  const stars = Number.parseInt(text.match(/^- Stars: (\d+)$/m)?.[1] ?? "0", 10);
  const scoreJson = text.match(/## Score\n```json\n([\s\S]*?)\n```/)?.[1];

  if (!fullName || !category || !scoreJson) return null;

  const parsedScore = JSON.parse(scoreJson) as Partial<RepoScore>;
  const score = Object.fromEntries(SCORE_KEYS.map((key) => [key, parsedScore[key] ?? 0])) as unknown as RepoScore;
  const totalScore = Object.values(score as unknown as Record<string, number>).reduce((sum, value) => sum + value, 0);

  return {
    file,
    fullName,
    category,
    stars,
    score,
    totalScore,
    strongPractices: sectionBullets(text, "## Strong Practices", "## Weaknesses / Not Worth Copying Blindly"),
    weakPractices: sectionBullets(text, "## Weaknesses / Not Worth Copying Blindly", "## Files Worth Studying")
  };
}

function countBy(values: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function scoreFor(finding: ParsedFinding, scoreKeys: (keyof RepoScore)[]): number {
  return scoreKeys.reduce((sum, key) => sum + finding.score[key], 0);
}

function averageScore(findings: ParsedFinding[], scoreKeys: (keyof RepoScore)[]): string {
  if (findings.length === 0) return "0.00";
  const max = scoreKeys.length * 5;
  const avg = findings.reduce((sum, finding) => sum + scoreFor(finding, scoreKeys) / max, 0) / findings.length;
  return avg.toFixed(2);
}

function renderRepoList(findings: ParsedFinding[], scoreKeys: (keyof RepoScore)[]): string {
  const maxTotalScore = findings[0] ? Object.keys(findings[0].score).length * 5 : 0;
  return findings
    .slice()
    .sort((a, b) => scoreFor(b, scoreKeys) - scoreFor(a, scoreKeys) || b.totalScore - a.totalScore || b.stars - a.stars)
    .slice(0, 12)
    .map((finding) => `- ${finding.fullName} (${finding.category}) - focus score ${scoreFor(finding, scoreKeys)}, total ${finding.totalScore}/${maxTotalScore}`)
    .join("\n");
}

export function summarizeFindings(cwd: string): string[] {
  const findingsDir = join(cwd, "research", "findings");
  if (!existsSync(findingsDir)) {
    throw new Error("No research/findings directory exists. Run agent-kit research scan first.");
  }

  const findingFiles = readdirSync(findingsDir).filter((file) => file.endsWith(".md"));
  const findings = findingFiles
    .map((file) => parseFinding(file, readFileSync(join(findingsDir, file), "utf8")))
    .filter((finding): finding is ParsedFinding => finding !== null);

  const categoryCounts = countBy(findings.map((finding) => finding.category));
  const outputs: string[] = [];

  const overview = `# Research Scan Overview

Generated from ${findings.length} parsed repository findings.

## Category Coverage
${categoryCounts.map(([category, count]) => `- ${category}: ${count}`).join("\n")}

## Highest Total Scores
${findings
  .slice()
  .sort((a, b) => b.totalScore - a.totalScore || b.stars - a.stars)
  .slice(0, 20)
  .map((finding) => `- ${finding.fullName} (${finding.category}) - ${finding.totalScore}/${Object.keys(finding.score).length * 5}`)
  .join("\n")}

## Most Repeated Strengths
${countBy(findings.flatMap((finding) => finding.strongPractices))
  .slice(0, 12)
  .map(([practice, count]) => `- ${practice} (${count})`)
  .join("\n")}

## Most Repeated Gaps
${countBy(findings.flatMap((finding) => finding.weakPractices))
  .slice(0, 12)
  .map(([practice, count]) => `- ${practice} (${count})`)
  .join("\n")}
`;

  const overviewPath = join(cwd, "research", "summaries", "scan-overview.md");
  writeText(overviewPath, overview);
  outputs.push(overviewPath);

  for (const [target, config] of Object.entries(SUMMARY_TARGETS)) {
    const categories: readonly string[] = config.categories;
    const scopedFindings = findings.filter((finding) => categories.includes(finding.category));
    const path = join(cwd, "research", "summaries", `${target}.md`);
    const summary = `# ${config.title}

Generated from ${scopedFindings.length} relevant repository findings.

## Focus Areas
${config.scoreKeys.map((key) => `- ${key}`).join("\n")}

## Aggregate Evidence
- Average normalized focus score: ${averageScore(scopedFindings, config.scoreKeys)}
- Repositories considered: ${scopedFindings.length}

## Strongest Repositories For This Topic
${renderRepoList(scopedFindings, config.scoreKeys) || "- No matching findings."}

## Repeated Strengths
${countBy(scopedFindings.flatMap((finding) => finding.strongPractices))
  .slice(0, 8)
  .map(([practice, count]) => `- ${practice} (${count})`)
  .join("\n") || "- No repeated strengths detected."}

## Repeated Gaps
${countBy(scopedFindings.flatMap((finding) => finding.weakPractices))
  .slice(0, 8)
  .map(([practice, count]) => `- ${practice} (${count})`)
  .join("\n") || "- No repeated gaps detected."}

## Source Findings
${scopedFindings
  .slice()
  .sort((a, b) => scoreFor(b, config.scoreKeys) - scoreFor(a, config.scoreKeys))
  .slice(0, 25)
  .map((finding) => `- research/findings/${finding.file}`)
  .join("\n")}
`;

    writeText(path, summary);
    outputs.push(path);
  }

  return outputs;
}

export function proposeUpdates(cwd: string): string {
  const output = `# Proposed Agent Kit Updates

Review the generated research summaries, then convert repeated best practices into:

- Root markdown templates in \`templates/next-supabase\`
- Reusable skills in \`skills/\`
- Agent role docs in \`agents/\`
- Security and frontend checklists in \`checklists/\`

Do not copy source code from scanned repositories. Adopt only generalized practices with clear rationale.
`;

  const path = join(cwd, "research", "proposed-updates.md");
  writeText(path, output);
  return path;
}
