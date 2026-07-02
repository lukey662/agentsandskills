import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-studio-smoke-"));
const fakeSecret = "sk_test_fake_secret_value";

function run(args, options = {}) {
  return execFileSync("node", [cliPath, ...args], {
    cwd: tempRoot,
    encoding: "utf8",
    ...options
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(join(tempRoot, path), "utf8"));
}

try {
  if (!existsSync(cliPath)) throw new Error("dist/index.js is missing. Run npm run build before smoke:studio.");

  writeFileSync(
    join(tempRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "studio-smoke-project",
        scripts: {
          test: "vitest run",
          build: "next build"
        },
        dependencies: {
          next: "15.0.0",
          react: "19.0.0",
          "@supabase/supabase-js": "2.0.0"
        },
        devDependencies: {
          vitest: "4.0.0",
          "@playwright/test": "1.0.0",
          tailwindcss: "4.0.0"
        }
      },
      null,
      2
    )}\n`
  );
  writeFileSync(join(tempRoot, ".env.example"), "NEXT_PUBLIC_SUPABASE_URL=\nSUPABASE_SERVICE_ROLE_KEY=\n");

  run(["init", "--stack", "next-supabase", "--guided"]);
  run(["context", "validate"]);
  const context = readJson(".agent-kit/project-context.json");
  if (context.projectName !== "studio-smoke-project") throw new Error("Context scan did not capture package name.");
  if (!context.architecture.frameworks.includes("next")) throw new Error("Context scan did not detect Next.js.");
  if (!context.architecture.hasSupabase) throw new Error("Context scan did not detect Supabase.");

  const startOutput = JSON.parse(run(["session", "start", "Build", "checkout", "flow", "--workflow", "frontend-change", "--json"]));
  const sessionId = startOutput.sessionId;
  run(["session", "decision", "--agent", "planner", "--risk", "Generic UI risk", "Use", "frontend-change", "workflow"]);
  run([
    "session",
    "handoff",
    "--from",
    "planner",
    "--to",
    "frontend-design-lead",
    "--decision",
    "Start design intake.",
    "--risk",
    "Generic UI risk.",
    "--evidence",
    "DESIGN.md"
  ]);
  run(["session", "correct", "--agent", "frontend-design-lead", "--scope", "project", "Keep", "the", "UI", "operational", "and", "dense.", fakeSecret]);
  run(["session", "artifact", "--file", "DESIGN.md", "--note", "Design direction reviewed."]);
  run(["session", "verify", "--command", `npm test ${fakeSecret}`, "--result", "pass", "--notes", "Smoke verification passed."]);
  run(["session", "output", "visual", "QA", "evidence", "--status", "not-applicable", "--evidence", "Smoke flow does not change UI."]);
  run(["session", "render"]);

  const eventText = readFileSync(join(tempRoot, ".agent-kit", "council-sessions", sessionId, "events.jsonl"), "utf8");
  const indexText = readFileSync(join(tempRoot, ".agent-kit", "council-sessions", sessionId, "index.md"), "utf8");
  const transcriptText = readFileSync(join(tempRoot, ".agent-kit", "council-sessions", sessionId, "transcript.md"), "utf8");
  const projectRules = readJson(".agent-kit/corrections/project-rules.json");
  const firstProjectRule = projectRules.rules.find((rule) => rule.scope === "project");

  if (!firstProjectRule) throw new Error("Project-scoped correction was not persisted.");
  run(["correction", "apply", "--id", firstProjectRule.id]);
  const appliedProjectRules = readJson(".agent-kit/corrections/project-rules.json");

  if (!indexText.includes("Handoff Graph")) throw new Error("Rendered session index is missing handoff graph.");
  if (!indexText.includes("frontend-design-lead")) throw new Error("Rendered session index is missing handoff target.");
  if (!indexText.includes("| visual QA evidence | not-applicable | Smoke flow does not change UI. |")) {
    throw new Error("Rendered session index is missing required output status.");
  }
  if (!transcriptText.includes("planner")) throw new Error("Rendered transcript is missing planner stream.");
  if (!transcriptText.includes("visual QA evidence: not-applicable")) throw new Error("Rendered transcript is missing required output event.");
  if (!appliedProjectRules.rules.some((rule) => rule.id === firstProjectRule.id && rule.status === "active" && rule.reviewedAt)) {
    throw new Error("Project-scoped correction was not applied and reviewed.");
  }
  for (const text of [eventText, indexText, transcriptText, JSON.stringify(appliedProjectRules)]) {
    if (text.includes(fakeSecret)) throw new Error("Studio smoke found an unredacted fake secret.");
  }

  const exportResult = JSON.parse(run(["studio", "export", "--json"]));
  const exportText = readFileSync(join(tempRoot, ".agent-kit", "studio", "index.html"), "utf8");
  if (exportResult.studioPath !== ".agent-kit/studio/index.html") throw new Error("Static studio export returned an unexpected path.");
  if (!exportText.includes("Agent Studio")) throw new Error("Static studio export is missing the page title.");
  if (!exportText.includes("agent-studio-data")) throw new Error("Static studio export is missing embedded JSON data.");
  if (!exportText.includes("<svg")) throw new Error("Static studio export is missing an SVG graph.");
  if (!exportText.includes("<details")) throw new Error("Static studio export is missing clickable transcript panels.");
  if (exportText.includes(fakeSecret)) throw new Error("Static studio export contains an unredacted fake secret.");

  const audit = JSON.parse(run(["audit", "--json", "--min-readiness", "baseline-setup"]));
  if (audit.summary.fail !== 0) {
    throw new Error(`Expected Agent Studio smoke audit to have 0 failures, got ${audit.summary.fail}.`);
  }
  if (!audit.findings.some((finding) => finding.area === "studio")) {
    throw new Error("Audit did not include Agent Studio findings.");
  }

  console.log(
    `studio smoke passed: ${audit.summary.pass} pass / ${audit.summary.warn} warn / ${audit.summary.fail} fail / readiness ${audit.readiness?.level ?? "unknown"}`
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
