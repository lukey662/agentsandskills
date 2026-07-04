import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const outputDir = join(repoRoot, "artifacts", "ui-screens");
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-ui-screens-"));
const port = 19457;
const baseUrl = `http://127.0.0.1:${port}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(`${url}/api/state`);
      if (response.ok) return;
    } catch {
      // retry
    }
    await sleep(250);
  }
  throw new Error(`Setup server did not become ready at ${url}`);
}

async function captureScreenshots() {
  mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const shots = [
      { path: "/office", name: "office-desktop", viewport: { width: 1280, height: 800 }, selector: "canvas", view: "office-v1" },
      { path: "/wizard", name: "wizard-desktop", viewport: { width: 1280, height: 800 }, selector: ".wizard-card", view: "wizard-v1" },
      { path: "/office", name: "office-mobile", viewport: { width: 390, height: 844 }, selector: "canvas", view: "office-v1" },
      { path: "/wizard", name: "wizard-mobile", viewport: { width: 390, height: 844 }, selector: ".wizard-card", view: "wizard-v1" }
    ];

    for (const shot of shots) {
      const page = await browser.newPage({ viewport: shot.viewport });
      await page.goto(`${baseUrl}${shot.path}`, { waitUntil: "networkidle" });
      await page.waitForSelector(shot.selector, { timeout: 15000 });
      const viewAttr = await page.locator("[data-view]").first().getAttribute("data-view");
      if (viewAttr !== shot.view) {
        throw new Error(`Expected data-view=${shot.view} at ${shot.path}, got ${viewAttr}`);
      }
      await page.screenshot({ path: join(outputDir, `${shot.name}.png`), fullPage: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

let child = null;

try {
  if (!existsSync(cliPath)) throw new Error("dist/index.js is missing. Run npm run build before smoke:ui-screens.");
  if (!existsSync(join(repoRoot, "dist", "studio", "office", "assets", "office.js"))) {
    throw new Error("Office assets missing. Run npm run build before smoke:ui-screens.");
  }

  writeFileSync(
    join(tempRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "ui-screens-smoke",
        scripts: { test: "vitest run", build: "next build" },
        dependencies: { next: "15.0.0", react: "19.0.0", "@supabase/supabase-js": "2.0.0" }
      },
      null,
      2
    )}\n`
  );
  writeFileSync(join(tempRoot, "TESTING.md"), "# Testing\n\nProject tests.\n");

  execFileSync("node", [cliPath, "init", "--stack", "next-supabase", "--no-setup"], {
    cwd: tempRoot,
    encoding: "utf8"
  });

  child = spawn("node", [cliPath, "setup", "--port", String(port), "--host", "127.0.0.1"], {
    cwd: tempRoot,
    stdio: "ignore"
  });

  await waitForServer(baseUrl);
  await captureScreenshots();
  console.log(`ui screenshot smoke passed: wrote 4 PNG files to ${outputDir}`);
} finally {
  if (child && !child.killed) {
    child.kill("SIGTERM");
    await new Promise((resolve) => {
      child.once("exit", resolve);
      setTimeout(resolve, 2000);
    });
  }
  rmSync(tempRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
}
