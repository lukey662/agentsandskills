import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(join(root, "../../package.json"));
const { chromium } = require("playwright");

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "qa-evidence", "2026-09-09-kept-book");
const base = process.env.KEPT_BOOK_URL ?? "http://127.0.0.1:3000";

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const notes = [];

async function shot(page, name) {
  await page.waitForLoadState("networkidle");
  const path = join(out, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  notes.push(`- ${name}.png`);
}

const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await desktop.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "The recipes that live in this kitchen." }).waitFor();
await shot(page, "desktop-home");

await page.getByLabel("Kitchen name").fill("Oak Street");
await page.getByLabel("Your name on the cards").fill("Jo");
await page.getByRole("button", { name: "Open this kitchen" }).click();
await page.waitForURL("**/box");
await page.getByRole("heading", { name: "The box" }).waitFor();
await shot(page, "desktop-box-empty");

await page.getByRole("button", { name: "Add three sample cards" }).click();
await page.getByRole("link", { name: "Tuesday beans" }).waitFor();
await shot(page, "desktop-box");

await page.getByRole("link", { name: "Tuesday beans" }).click();
await page.waitForURL("**/recipes/**");
await page.getByRole("heading", { name: "Tuesday beans" }).waitFor();
await shot(page, "desktop-recipe");

await page.getByRole("link", { name: "The book" }).click();
await page.waitForURL("**/book");
await page.getByRole("heading", { name: "The book" }).waitFor();
await shot(page, "desktop-book");

const pdfMeta = await page.evaluate(async () => {
  const res = await fetch("/book/pdf");
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (const byte of buf) binary += String.fromCharCode(byte);
  return { status: res.status, type: res.headers.get("content-type"), head: String.fromCharCode(...buf.slice(0, 4)), b64: btoa(binary) };
});
if (pdfMeta.status !== 200 || pdfMeta.head !== "%PDF") {
  throw new Error(`pdf failed status=${pdfMeta.status} type=${pdfMeta.type} head=${pdfMeta.head}`);
}
await writeFile(join(out, "book.pdf"), Buffer.from(pdfMeta.b64, "base64"));

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const m = await mobile.newPage();
await m.goto(base, { waitUntil: "networkidle" });
await m.getByRole("heading", { name: "The recipes that live in this kitchen." }).waitFor();
await shot(m, "mobile-home");
await m.getByLabel("Kitchen name").fill("Pine Street");
await m.getByLabel("Your name on the cards").fill("Sam");
await m.getByRole("button", { name: "Open this kitchen" }).click();
await m.waitForURL("**/box");
await m.getByRole("heading", { name: "The box" }).waitFor();
await m.getByRole("button", { name: "Add three sample cards" }).click();
await m.getByRole("link", { name: "Lemon sink cake" }).waitFor();
await shot(m, "mobile-box");
await m.getByRole("link", { name: "The book" }).click();
await m.waitForURL("**/book");
await m.getByRole("heading", { name: "The book" }).waitFor();
await shot(m, "mobile-book");

await writeFile(
  join(out, "notes.md"),
  `# Kept Book visual QA — 2026-09-09

Opened the running production server at ${base}. Desktop 1280×800 and mobile 390×844.

Flow: open kitchen → empty box → sample cards → one recipe → book desk → PDF download.

${notes.join("\n")}

PDF saved as book.pdf from the authenticated desktop session.
`
);

await browser.close();
console.log(`wrote ${out}`);
