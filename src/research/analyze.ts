import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RepoCandidate, RepoFinding, RepoScore } from "../config/types.js";
import { listFilesRecursive } from "../utils/fs.js";

function hasFile(files: string[], matcher: RegExp): boolean {
  return files.some((file) => matcher.test(file));
}

function fileText(root: string, file: string): string {
  const path = join(root, file);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function textIncludes(root: string, files: string[], matcher: RegExp, terms: string[]): boolean {
  const lowerTerms = terms.map((term) => term.toLowerCase());
  return files
    .filter((file) => matcher.test(file))
    .some((file) => {
      const text = fileText(root, file).toLowerCase();
      return lowerTerms.some((term) => text.includes(term));
    });
}

function bounded(value: number): number {
  return Math.max(0, Math.min(5, value));
}

export function analyzeRepository(candidate: RepoCandidate, repoRoot: string): RepoFinding {
  const files = listFilesRecursive(repoRoot);
  const score: RepoScore = {
    architecture: bounded(
      Number(hasFile(files, /^app\//)) +
        Number(hasFile(files, /^components\//)) +
        Number(hasFile(files, /^lib\//)) +
        Number(hasFile(files, /^server\//)) +
        Number(hasFile(files, /^packages\//))
    ),
    supabaseAuthRls: bounded(
      Number(hasFile(files, /^supabase\/migrations\//)) * 2 +
        Number(textIncludes(repoRoot, files, /\.(sql|md|ts|tsx)$/, ["row level security", "policy", "rls"])) +
        Number(textIncludes(repoRoot, files, /\.(ts|tsx)$/, ["createServerClient", "supabase-js"])) +
        Number(textIncludes(repoRoot, files, /\.(ts|tsx)$/, ["service_role", "service-role"]))
    ),
    security: bounded(
      Number(hasFile(files, /(^|\/)SECURITY\.md$/)) +
        Number(textIncludes(repoRoot, files, /\.(md|yml|yaml|ts|tsx)$/, ["OWASP", "CodeQL", "rate limit"])) +
        Number(hasFile(files, /^\.github\/workflows\//)) +
        Number(textIncludes(repoRoot, files, /\.(ts|tsx)$/, ["zod", "safeParse"])) +
        Number(textIncludes(repoRoot, files, /\.(md|ts|tsx)$/, ["csrf", "ssrf", "idor"]))
    ),
    frontendDesign: bounded(
      Number(hasFile(files, /^components\//)) +
        Number(textIncludes(repoRoot, files, /\.(css|ts|tsx|json)$/, ["tokens", "theme", "tailwind", "radix"])) +
        Number(textIncludes(repoRoot, files, /\.(tsx|md)$/, ["empty state", "loading", "error state"])) +
        Number(hasFile(files, /tailwind\.config\.(js|ts)$/)) +
        Number(textIncludes(repoRoot, files, /\.(tsx|css)$/, ["aria-", "focus-visible"]))
    ),
    accessibility: bounded(
      Number(textIncludes(repoRoot, files, /\.(tsx|md)$/, ["aria-", "keyboard", "focus-visible"])) +
        Number(textIncludes(repoRoot, files, /\.(tsx|md)$/, ["WCAG", "accessibility", "a11y"])) +
        Number(textIncludes(repoRoot, files, /\.(json|js|ts)$/, ["axe", "eslint-plugin-jsx-a11y"]))
    ),
    testing: bounded(
      Number(hasFile(files, /(vitest|jest)\.config\.(js|ts|mjs)$/)) +
        Number(hasFile(files, /playwright\.config\.(js|ts|mjs)$/)) * 2 +
        Number(hasFile(files, /(^|\/)(tests|__tests__|e2e)\//)) +
        Number(textIncludes(repoRoot, files, /package\.json$/, ["test"]))
    ),
    documentation: bounded(
      Number(hasFile(files, /(^|\/)README\.md$/)) +
        Number(hasFile(files, /(^|\/)CONTRIBUTING\.md$/)) +
        Number(hasFile(files, /(^|\/)CHANGELOG\.md$/)) +
        Number(hasFile(files, /^docs\//)) +
        Number(textIncludes(repoRoot, files, /\.(md|mdx)$/, ["architecture", "decision", "deployment"]))
    ),
    ciDeployment: bounded(
      Number(hasFile(files, /^\.github\/workflows\//)) * 2 +
        Number(hasFile(files, /vercel\.json$/)) +
        Number(textIncludes(repoRoot, files, /\.(yml|yaml|json|md)$/, ["deployment", "preview", "production"]))
    ),
    agentReadiness: bounded(
      Number(hasFile(files, /(^|\/)AGENTS\.md$/)) * 2 +
        Number(hasFile(files, /(^|\/)\.cursor\//)) +
        Number(hasFile(files, /(^|\/)CLAUDE\.md$/)) +
        Number(textIncludes(repoRoot, files, /\.(md|mdx)$/, ["agent", "prompt", "skill"]))
    )
  };

  const selectedFiles = files
    .filter((file) =>
      /(^|\/)(README|SECURITY|CONTRIBUTING|CHANGELOG|AGENTS|CLAUDE|TESTING|DEPLOYMENT)\.md$/.test(file) ||
      /^\.github\/workflows\//.test(file) ||
      /^supabase\/migrations\//.test(file) ||
      /package\.json$/.test(file) ||
      /playwright\.config\.(js|ts|mjs)$/.test(file)
    )
    .slice(0, 30);

  const strongPractices: string[] = [];
  if (score.security >= 4) strongPractices.push("Security posture is explicit through docs, validation, CI, or review tooling.");
  if (score.supabaseAuthRls >= 4) strongPractices.push("Supabase authorization appears to be handled close to the data boundary.");
  if (score.testing >= 4) strongPractices.push("Test setup includes meaningful automated and browser-level coverage.");
  if (score.frontendDesign >= 4) strongPractices.push("Frontend implementation shows reusable components, states, and design-system signals.");
  if (score.documentation >= 4) strongPractices.push("Documentation is strong enough for external contributors or agents to onboard.");

  const weakPractices: string[] = [];
  if (score.security < 3) weakPractices.push("Security expectations are implicit or incomplete.");
  if (score.supabaseAuthRls < 3) weakPractices.push("Supabase RLS/Auth practices are not clearly discoverable.");
  if (score.accessibility < 3) weakPractices.push("Accessibility signals are weak or absent.");
  if (score.agentReadiness < 3) weakPractices.push("Agent handoff and AI-workflow instructions are not mature.");

  const patternsToAdopt = [
    "Prefer explicit docs and checklists over tribal conventions.",
    "Promote authorization and validation rules into reusable review gates.",
    "Separate frontend design quality from generic implementation review."
  ];

  const impactOnKit = [
    "Use score deltas to decide which templates and skills need stronger language.",
    "Add repeated high-confidence patterns to checklists, not one-off project quirks."
  ];

  return {
    candidate,
    score,
    selectedFiles,
    strongPractices,
    weakPractices,
    patternsToAdopt,
    impactOnKit
  };
}
