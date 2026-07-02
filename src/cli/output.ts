import pc from "picocolors";

const colorEnabled = process.env.NO_COLOR === undefined && process.stdout.isTTY === true;

function paint(painter: (text: string) => string, text: string): string {
  return colorEnabled ? painter(text) : text;
}

export const style = {
  heading: (text: string) => paint(pc.cyan, text),
  pass: (text: string) => paint(pc.green, text),
  warn: (text: string) => paint(pc.yellow, text),
  fail: (text: string) => paint(pc.red, text),
  dim: (text: string) => paint(pc.dim, text),
  bold: (text: string) => paint(pc.bold, text)
};

export function levelLabel(level: "pass" | "warn" | "fail"): string {
  const label = level.toUpperCase().padEnd(4);
  if (level === "pass") return style.pass(label);
  if (level === "warn") return style.warn(label);
  return style.fail(label);
}

export function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

export function heading(text: string): void {
  console.log(style.heading(text));
}

export function line(text = ""): void {
  console.log(text);
}

export function detail(text: string): void {
  console.log(style.dim(`  ${text}`));
}

export function listItem(text: string): void {
  console.log(`- ${text}`);
}

/** Print a labeled list of file paths, skipping empty groups. */
export function fileGroup(label: string, files: string[]): void {
  if (files.length === 0) return;
  console.log(`${style.bold(label)} (${files.length})`);
  for (const file of files) console.log(`  ${file}`);
}

export function fail(message: string): void {
  console.error(style.fail(`error: ${message}`));
}
