import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RepoCandidate, RepoFinding, RepoScore } from "../config/types.js";
import { listFilesRecursive } from "../utils/fs.js";

function normalizeRelativePath(file: string): string {
  return file.replace(/\\/g, "/");
}

function hasFile(files: string[], matcher: RegExp): boolean {
  return files.some((file) => matcher.test(normalizeRelativePath(file)));
}

function fileText(root: string, file: string): string {
  const path = join(root, file);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function textIncludes(root: string, files: string[], matcher: RegExp, terms: string[]): boolean {
  const lowerTerms = terms.map((term) => term.toLowerCase());
  return files
    .filter((file) => matcher.test(normalizeRelativePath(file)))
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
        Number(textIncludes(repoRoot, files, /\.(tsx|md|mdx)$/, ["empty state", "loading", "error state"])) +
        Number(hasFile(files, /(^|\/)(DESIGN|STYLE_GUIDE)\.md$/)) +
        Number(textIncludes(repoRoot, files, /\.(md|mdx)$/, ["creative direction", "content inventory", "user needs"])) +
        Number(textIncludes(repoRoot, files, /\.(md|mdx)$/, ["reference set", "anti-reference", "design critique", "distinctiveness"])) +
        Number(textIncludes(repoRoot, files, /\.(md|mdx)$/, ["product quality scorecard", "user/task fit", "content specificity", "source safety"])) +
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
        Number(hasFile(files, /^\.storybook\//)) +
        Number(textIncludes(repoRoot, files, /\.(ts|tsx|js|jsx|md|mdx|json|yml|yaml)$/, ["toHaveScreenshot", "visual regression", "chromatic", "argos", "loki", "test-storybook"])) +
        Number(textIncludes(repoRoot, files, /package\.json$/, ["test"]))
    ),
    documentation: bounded(
      Number(hasFile(files, /(^|\/)README\.md$/)) +
        Number(hasFile(files, /(^|\/)CONTRIBUTING\.md$/)) +
        Number(hasFile(files, /(^|\/)CHANGELOG\.md$/)) +
        Number(hasFile(files, /(^|\/)(CODE_OF_CONDUCT|SUPPORT|GOVERNANCE)\.md$/)) +
        Number(hasFile(files, /^docs\//)) +
        Number(textIncludes(repoRoot, files, /\.(md|mdx)$/, ["architecture", "decision", "deployment"]))
    ),
    ciDeployment: bounded(
      Number(hasFile(files, /^\.github\/workflows\//)) * 2 +
        Number(hasFile(files, /vercel\.json$/)) +
        Number(textIncludes(repoRoot, files, /\.(yml|yaml|json|md)$/, ["deployment", "preview", "production"]))
    ),
    repoHealth: bounded(
      Number(hasFile(files, /^\.github\/ISSUE_TEMPLATE\//)) +
        Number(hasFile(files, /(^|\/)pull_request_template\.md$/i)) +
        Number(hasFile(files, /^\.github\/CODEOWNERS$/)) +
        Number(hasFile(files, /^\.github\/(dependabot|labels|labeler)\.ya?ml$/)) +
        Number(hasFile(files, /^\.github\/workflows\/.*(codeql|labeler).*\.ya?ml$/)) +
        Number(hasFile(files, /(^|\/)(CODE_OF_CONDUCT|SUPPORT|GOVERNANCE|REPOSITORY_SETTINGS)\.md$/)) +
        Number(textIncludes(repoRoot, files, /\.(md|yml|yaml)$/, ["branch protection", "private vulnerability reporting", "required status checks"]))
    ),
    supplyChain: bounded(
      Number(hasFile(files, /^\.github\/workflows\/.*dependency.*review.*\.ya?ml$/)) +
        Number(hasFile(files, /^\.github\/workflows\/.*scorecard.*\.ya?ml$/)) +
        Number(textIncludes(repoRoot, files, /^\.github\/workflows\/.*\.ya?ml$/, ["id-token: write", "npm publish", "trusted publishing", "provenance"])) +
        Number(textIncludes(repoRoot, files, /^\.github\/workflows\/.*\.ya?ml$/, ["dependency-review-action", "scorecard-action", "npm audit"])) +
        Number(hasFile(files, /(^|\/)SUPPLY_CHAIN\.md$/)) +
        Number(textIncludes(repoRoot, files, /\.(md|yml|yaml|json)$/, ["provenance", "OIDC", "trusted publishing", "OpenSSF"]))
    ),
    agentReadiness: bounded(
      Number(hasFile(files, /(^|\/)AGENTS\.md$/)) * 2 +
        Number(hasFile(files, /(^|\/)\.cursor\//)) +
        Number(hasFile(files, /(^|\/)CLAUDE\.md$/)) +
        Number(hasFile(files, /(^|\/)schemas\//)) +
        Number(textIncludes(repoRoot, files, /\.(md|mdx|json|ts|tsx)$/, ["agent", "prompt", "skill", "handoff", "trace", "guardrail", "agent-roster"]))
    )
  };

  const selectedFiles = files
    .filter((file) =>
      /(^|\/)(README|SECURITY|CONTRIBUTING|CHANGELOG|CODE_OF_CONDUCT|SUPPORT|GOVERNANCE|REPOSITORY_SETTINGS|SUPPLY_CHAIN|AGENTS|CLAUDE|DESIGN|STYLE_GUIDE|TESTING|DEPLOYMENT)\.md$/.test(file) ||
      /(^|\/)COUNCIL\.md$/.test(file) ||
      /^\.github\/workflows\//.test(file) ||
      /^\.github\/ISSUE_TEMPLATE\//.test(file) ||
      /^\.github\/CODEOWNERS$/.test(file) ||
      /^\.github\/(dependabot|labels|labeler)\.ya?ml$/.test(file) ||
      /(^|\/)pull_request_template\.md$/i.test(file) ||
      /^\.storybook\//.test(file) ||
      /^schemas\//.test(file) ||
      /^supabase\/migrations\//.test(file) ||
      /package\.json$/.test(file) ||
      /playwright\.config\.(js|ts|mjs)$/.test(file) ||
      /(chromatic|argos|loki)\.(config\.)?(json|js|ts|mjs|yml|yaml)$/.test(file)
    )
    .slice(0, 30);

  const strongPractices: string[] = [];
  if (score.security >= 4) strongPractices.push("Security posture is explicit through docs, validation, CI, or review tooling.");
  if (score.supabaseAuthRls >= 4) strongPractices.push("Supabase authorization appears to be handled close to the data boundary.");
  if (score.testing >= 4) strongPractices.push("Test setup includes meaningful automated, browser-level, component-state, or visual-regression coverage.");
  if (score.frontendDesign >= 4)
    strongPractices.push("Frontend implementation shows reusable components, states, design-system, content-first direction, or reference-led critique signals.");
  if (score.documentation >= 4) strongPractices.push("Documentation is strong enough for external contributors or agents to onboard.");
  if (score.repoHealth >= 4) strongPractices.push("Repository health is supported by issue/PR templates, labels, dependency automation, code scanning, ownership, branch protection guidance, or support docs.");
  if (score.supplyChain >= 4) strongPractices.push("Supply-chain posture includes provenance, dependency review, Scorecard, OIDC publishing, or release integrity signals.");

  const weakPractices: string[] = [];
  if (score.security < 3) weakPractices.push("Security expectations are implicit or incomplete.");
  if (score.supabaseAuthRls < 3) weakPractices.push("Supabase RLS/Auth practices are not clearly discoverable.");
  if (score.accessibility < 3) weakPractices.push("Accessibility signals are weak or absent.");
  if (score.repoHealth < 3) weakPractices.push("Public repository health files, labels, branch protection guidance, contribution workflow, dependency automation, or code scanning are weak.");
  if (score.supplyChain < 3) weakPractices.push("Supply-chain provenance, dependency review, Scorecard, or release-integrity signals are weak.");
  if (score.agentReadiness < 3) weakPractices.push("Agent handoff, tracing, guardrail, schema, or AI-workflow instructions are not mature.");

  const patternsToAdopt = [
    "Prefer explicit docs and checklists over tribal conventions.",
    "Promote authorization and validation rules into reusable review gates.",
    "Separate frontend design quality from generic implementation review.",
    "Treat brand, content, and creative-direction evidence as frontend quality inputs, not optional polish.",
    "Use references and anti-references as critique inputs, not as source designs to copy.",
    "Use repeatable frontend product-quality scoring for user task, content specificity, visual identity, IA, states, accessibility, and source safety.",
    "Treat component-state screenshots and visual-regression evidence as acceptance artifacts for high-risk UI changes.",
    "Promote agent handoff practices into schema-backed records and auditable evidence instead of prose-only instructions.",
    "Treat public repository health files, issue/PR templates, labels, branch protection guidance, dependency automation, and code scanning as release-readiness assets.",
    "Treat package provenance, dependency review, Scorecard, and release workflow controls as package trust requirements."
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
