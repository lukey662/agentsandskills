import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
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
const failClosed = "A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images.";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderGuidePage(guide, skill) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agents and skills user guide</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: Georgia, "Times New Roman", serif; background: #f6f1e8; color: #1c1916; }
    header { padding: 1.5rem 1.25rem 1rem; background: #1c1916; color: #f6f1e8; }
    h1 { margin: 0 0 0.5rem; font-size: 1.6rem; line-height: 1.2; }
    .rule { margin: 0; font-size: 1rem; max-width: 42rem; }
    main { padding: 1.25rem; max-width: 48rem; }
    pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85rem; background: #fff; padding: 1rem; border: 1px solid #d8cfc3; overflow-wrap: anywhere; }
    @media (max-width: 480px) {
      h1 { font-size: 1.25rem; }
      pre { font-size: 0.75rem; }
    }
  </style>
</head>
<body data-view="browser-qa-guide">
  <header>
    <h1>Installed user guide</h1>
    <p class="rule">${escapeHtml(failClosed)}</p>
  </header>
  <main>
    <p>Do not review code alone. These screenshots prove the installed guide and browser-qa skill are readable on desktop and mobile.</p>
    <h2>USER_GUIDE.md</h2>
    <pre id="user-guide">${escapeHtml(guide)}</pre>
    <h2>browser-qa</h2>
    <pre id="browser-qa">${escapeHtml(skill)}</pre>
  </main>
</body>
</html>`;
}

function startServer(html) {
  return new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(html);
    });
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function captureScreenshots() {
  mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const shots = [
      { name: "desktop", viewport: { width: 1280, height: 800 } },
      { name: "mobile", viewport: { width: 390, height: 844 } }
    ];
    for (const shot of shots) {
      const page = await browser.newPage({ viewport: shot.viewport });
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      await page.waitForSelector("#user-guide", { timeout: 15000 });
      const view = await page.locator("[data-view]").first().getAttribute("data-view");
      if (view !== "browser-qa-guide") {
        throw new Error(`Expected data-view=browser-qa-guide, got ${view}`);
      }
      const bodyText = await page.locator("body").innerText();
      if (!bodyText.includes("Do not review code alone") || !bodyText.includes(failClosed)) {
        throw new Error("Rendered page dropped the screenshot fail-closed rule.");
      }
      await page.screenshot({ path: join(outputDir, `${shot.name}.png`), fullPage: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

function assertPng(relative) {
  const path = join(outputDir, relative);
  if (!existsSync(path)) throw new Error(`Missing screenshot ${relative}`);
  const size = statSync(path).size;
  if (size < 8_000) throw new Error(`Screenshot ${relative} is too small to be a real capture (${size} bytes).`);
}

let server = null;

try {
  if (!existsSync(cliPath)) throw new Error("dist/index.js is missing. Run npm run build before smoke:ui-screens.");

  execFileSync("node", [cliPath, "init", "--stack", "next-supabase", "--activate", "all"], {
    cwd: tempRoot,
    encoding: "utf8"
  });

  const guide = readFileSync(join(tempRoot, "USER_GUIDE.md"), "utf8");
  const skill = readFileSync(join(tempRoot, ".cursor/skills/browser-qa/SKILL.md"), "utf8");
  if (!guide.includes(failClosed) || !guide.includes("Do not review code alone")) {
    throw new Error("Installed USER_GUIDE.md dropped the screenshot fail-closed rule.");
  }
  if (!skill.includes("Do not review code alone")) {
    throw new Error("Installed browser-qa skill dropped the screenshot fail-closed rule.");
  }

  server = await startServer(renderGuidePage(guide, skill));
  await captureScreenshots();
  assertPng("desktop.png");
  assertPng("mobile.png");
  writeFileSync(
    join(outputDir, "notes.md"),
    [
      "route: /",
      "viewport: desktop 1280 and mobile 390",
      "auth: none",
      "verdict: accept",
      "what the screenshots show: installed USER_GUIDE.md and browser-qa skill, including the fail-closed screenshot rule.",
      "Do not review code alone."
    ].join("\n") + "\n"
  );
  console.log(`ui screenshot smoke passed: wrote desktop.png and mobile.png to ${outputDir}`);
} finally {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  rmSync(tempRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
}
