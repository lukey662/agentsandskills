import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-audit-gate-"));

function run(args) {
  return execFileSync("node", [cliPath, ...args], {
    cwd: tempRoot,
    encoding: "utf8"
  });
}

try {
  if (!existsSync(cliPath)) {
    throw new Error("dist/index.js is missing. Run npm run build before smoke:audit-gate.");
  }

  run(["init", "--stack", "next-supabase"]);
  const auditOutput = run(["audit", "--json", "--min-readiness", "baseline-setup"]);
  const auditReport = JSON.parse(auditOutput);

  if (auditReport.summary?.fail !== 0) {
    throw new Error(`Expected baseline audit gate to have 0 failures, got ${auditReport.summary?.fail}.\n${auditOutput}`);
  }

  const readiness = auditReport.readiness?.level ?? "unknown";
  const allowed = new Set(["baseline-setup", "strong-delivery", "best-practice-candidate"]);
  if (!allowed.has(readiness)) {
    throw new Error(`Expected baseline audit gate readiness baseline-setup or better, got ${readiness}.\n${auditOutput}`);
  }

  if (!existsSync(join(tempRoot, ".cursor", "rules", "cursor-agent-kit.mdc"))) {
    throw new Error("Expected init to install .cursor/rules/cursor-agent-kit.mdc for Cursor adapter activation.");
  }

  console.log(
    `audit gate smoke passed: ${auditReport.summary.pass} pass / ${auditReport.summary.warn} warn / ${auditReport.summary.fail} fail / readiness ${readiness}`
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
