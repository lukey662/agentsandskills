import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-setup-smoke-"));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(`${url}/api/state`);
      if (response.ok) return;
    } catch {
      // retry
    }
    await sleep(200);
  }
  throw new Error(`Setup server did not become ready at ${url}`);
}

async function saveContext(baseUrl) {
  const response = await fetch(`${baseUrl}/api/context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productSummary: "Smoke test product summary for wizard setup.",
      productCategory: "saas",
      primaryAudience: "Test users",
      primaryWorkflows: "Primary workflow one\nPrimary workflow two",
      authModel: "Supabase Auth with RLS enforced in Postgres.",
      tenantModel: "single-user",
      uiPreferred: "Simple and readable.",
      uiAvoid: "Generic heroes.",
      valueProposition: "Users complete work faster.",
      proof: "Automated smoke coverage",
      objections: "None yet",
      qualityTarget: "baseline-setup",
      owner: "smoke"
    })
  });
  if (!response.ok) {
    throw new Error(`Setup wizard save failed: ${await response.text()}`);
  }
}

try {
  if (!existsSync(cliPath)) throw new Error("dist/index.js is missing. Run npm run build before smoke:setup.");
  if (!existsSync(join(repoRoot, "dist", "studio", "wizard", "assets", "wizard.css"))) {
    throw new Error("Wizard assets missing. Run npm run build before smoke:setup.");
  }
  if (!existsSync(join(repoRoot, "dist", "studio", "office", "assets", "office.js"))) {
    throw new Error("Office assets missing. Run npm run build before smoke:setup.");
  }

  writeFileSync(
    join(tempRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "setup-smoke-project",
        scripts: { test: "vitest run", build: "next build" },
        dependencies: { next: "15.0.0", react: "19.0.0", "@supabase/supabase-js": "2.0.0" },
        devDependencies: { vitest: "4.0.0", "@playwright/test": "1.0.0" }
      },
      null,
      2
    )}\n`
  );
  writeFileSync(join(tempRoot, "TESTING.md"), "# Testing\n\nProject tests.\n");

  execFileSync("node", [cliPath, "init", "--stack", "next-supabase", "--no-setup", "--guided"], {
    cwd: tempRoot,
    encoding: "utf8"
  });

  const port = 19321;
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn("node", [cliPath, "setup", "--port", String(port), "--host", "127.0.0.1"], {
    cwd: tempRoot,
    stdio: "ignore"
  });

  try {
    await waitForServer(baseUrl);
    const officeRes = await fetch(`${baseUrl}/`);
    if (!officeRes.ok) throw new Error("Office page failed to load.");
    const officeHtml = await officeRes.text();
    if (!officeHtml.includes("Agent Office")) throw new Error("Office HTML missing expected title.");
    if (!officeHtml.includes("office-floor")) throw new Error("Office HTML missing canvas.");
    await saveContext(baseUrl);
    const statusOutput = execFileSync("node", [cliPath, "setup", "--status"], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    const status = JSON.parse(statusOutput);
    if (!status.quickComplete) {
      throw new Error(`Expected quickComplete true after wizard save, got ${statusOutput}`);
    }
    const context = JSON.parse(readFileSync(join(tempRoot, ".agent-kit", "project-context.json"), "utf8"));
    if (!context.productSummary.includes("Smoke test product summary")) {
      throw new Error("Project context was not updated by setup wizard smoke.");
    }
    const auditOutput = execFileSync("node", [cliPath, "audit", "--json"], { cwd: tempRoot, encoding: "utf8" });
    const audit = JSON.parse(auditOutput);
    if (audit.summary.fail !== 0) {
      throw new Error(`Expected setup smoke audit to have 0 failures, got ${audit.summary.fail}.`);
    }
    console.log(`setup smoke passed: quickComplete=${status.quickComplete} readiness=${audit.readiness?.level ?? "unknown"}`);
  } finally {
    child.kill("SIGTERM");
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
