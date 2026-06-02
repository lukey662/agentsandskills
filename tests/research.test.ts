import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RepoCandidate } from "../src/config/types.js";
import { analyzeRepository } from "../src/research/analyze.js";

let root: string;

describe("analyzeRepository", () => {
  const candidate: RepoCandidate = {
    fullName: "example/repo",
    htmlUrl: "https://github.com/example/repo",
    description: "fixture",
    stars: 100,
    pushedAt: "2026-01-01T00:00:00Z",
    language: "TypeScript",
    topics: ["nextjs"],
    category: "fixture"
  };

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "agent-kit-repo-"));
    mkdirSync(join(root, "app"), { recursive: true });
    mkdirSync(join(root, "components"), { recursive: true });
    mkdirSync(join(root, "supabase", "migrations"), { recursive: true });
    mkdirSync(join(root, ".github", "workflows"), { recursive: true });
    writeFileSync(join(root, "README.md"), "architecture deployment\n");
    writeFileSync(join(root, "app", "page.tsx"), "export default function Page() { return null; }\n");
    writeFileSync(join(root, "components", "button.tsx"), "export function Button() { return null; }\n");
    writeFileSync(join(root, "SECURITY.md"), "OWASP CodeQL rate limit\n");
    writeFileSync(join(root, "supabase", "migrations", "001.sql"), "alter table x enable row level security; create policy p on x;");
    writeFileSync(join(root, "playwright.config.ts"), "export default {};\n");
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { test: "vitest" } }));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("scores high-signal repository structure", () => {
    const finding = analyzeRepository(candidate, root);
    expect(finding.score.architecture).toBeGreaterThan(0);
    expect(finding.score.security).toBeGreaterThan(0);
    expect(finding.selectedFiles.length).toBeGreaterThan(0);
  });
});
