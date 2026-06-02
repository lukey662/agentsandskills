import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { writeText } from "../utils/fs.js";

const SUMMARY_TARGETS = [
  "nextjs-patterns",
  "supabase-rls-patterns",
  "security-patterns",
  "frontend-design-patterns",
  "testing-patterns",
  "docs-and-agent-patterns"
] as const;

export function summarizeFindings(cwd: string): string[] {
  const findingsDir = join(cwd, "research", "findings");
  if (!existsSync(findingsDir)) {
    throw new Error("No research/findings directory exists. Run agent-kit research scan first.");
  }

  const findingFiles = readdirSync(findingsDir).filter((file) => file.endsWith(".md"));
  const corpus = findingFiles.map((file) => readFileSync(join(findingsDir, file), "utf8")).join("\n\n");
  const outputs: string[] = [];

  for (const target of SUMMARY_TARGETS) {
    const title = target
      .split("-")
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" ");
    const path = join(cwd, "research", "summaries", `${target}.md`);
    const summary = `# ${title}

Generated from ${findingFiles.length} repository findings.

## Repeated Signals To Adopt
- Promote repeated strong patterns into templates only after security and maintainability review.
- Prefer explicit checklists and role ownership over ambiguous prose.
- Separate frontend design quality, accessibility, security, and data authorization into different review gates.

## Evidence Notes
This automated summary is a starting point. Review the linked findings before changing core templates.

## Source Findings
${findingFiles.map((file) => `- research/findings/${file}`).join("\n")}

## Corpus Size
- Characters scanned: ${corpus.length}
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
