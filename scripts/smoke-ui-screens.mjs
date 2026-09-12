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

function startServer(html) {
  return new Promise((resolve, reject) => {
    const server = createServer((_request, response) => {
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
      await page.waitForSelector("[data-view='user-guide']", { timeout: 15000 });
      const bodyText = await page.locator("body").innerText();
      if (!bodyText.includes("Do not review code alone") || !bodyText.includes(failClosed)) {
        throw new Error("Rendered USER_GUIDE.html dropped the screenshot fail-closed rule.");
      }
      if (!bodyText.includes("Ask one specialist")) {
        throw new Error("Rendered USER_GUIDE.html dropped the assignment-desk headline.");
      }
      if (!bodyText.includes("Run accessibility-wcag") || !bodyText.includes("Do not accept contrast from the screenshot alone")) {
        throw new Error("Rendered USER_GUIDE.html dropped the accessibility-wcag keyboard prompt.");
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

  const htmlPath = join(tempRoot, "USER_GUIDE.html");
  if (!existsSync(htmlPath)) throw new Error("init did not install USER_GUIDE.html.");
  const html = readFileSync(htmlPath, "utf8");
  if (!html.includes(failClosed) || !html.includes("Do not review code alone")) {
    throw new Error("Installed USER_GUIDE.html dropped the screenshot fail-closed rule.");
  }
  if (!html.includes("Run accessibility-wcag") || !html.includes("Do not accept contrast from the screenshot alone")) {
    throw new Error("Installed USER_GUIDE.html dropped the accessibility-wcag keyboard prompt.");
  }

  server = await startServer(html);
  await captureScreenshots();
  assertPng("desktop.png");
  assertPng("mobile.png");
  writeFileSync(
    join(outputDir, "notes.md"),
    [
      "route: USER_GUIDE.html",
      "viewport: desktop 1280 and mobile 390",
      "auth: none",
      "verdict: accept-with-nits-pending-visual-read",
      "what the screenshots show: assignment-desk field guide with fail-closed frames and pasteable prompts.",
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
