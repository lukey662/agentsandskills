import { createInterface } from "node:readline";
import type { InitResult } from "../install/install.js";
import { PACKAGE_NAME, PACKAGE_VERSION } from "../config/defaults.js";

export function formatInitSummary(result: InitResult): string {
  const lines = [
    `${PACKAGE_NAME} v${PACKAGE_VERSION} installed.`,
    "",
    `Created/updated: ${result.copied.length} file(s)`,
    `Unchanged: ${result.unchanged.length} file(s)`
  ];
  if (result.conflicts.length > 0) {
    lines.push(`Conflicts to review: ${result.conflicts.length} → see .agent-kit/conflicts/`);
  }
  if (result.contextPath) {
    lines.push(`Project context: ${result.contextPath}`);
  }
  if (result.activation?.activated.length) {
    lines.push(`IDE activation: ${result.activation.activated.join(", ")}`);
  }
  if ([...result.copied, ...result.unchanged].some((path) => path.includes("agent-kit-audit.yml"))) {
    lines.push("CI template: .github/workflows/agent-kit-audit.yml");
  }
  lines.push("", "Next: teach agents about your project with the setup wizard (~5 min).", "  agent-kit setup --open");
  return lines.join("\n");
}

export async function promptStartSetup(defaultYes = true): Promise<boolean> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const question = defaultYes ? "Start setup wizard now? [Y/n] " : "Start setup wizard now? [y/N] ";
  const answer = await new Promise<string>((resolve) => {
    rl.question(question, (value) => {
      rl.close();
      resolve(value.trim().toLowerCase());
    });
  });
  if (!answer) return defaultYes;
  if (defaultYes) return answer !== "n" && answer !== "no";
  return answer === "y" || answer === "yes";
}
