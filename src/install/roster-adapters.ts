import { readFileSync } from "node:fs";
import { agentSourcePath, loadCatalog, parseFrontmatter, skillSourcePath } from "../catalog.js";
import { findPackageRoot } from "../utils/package-root.js";
import { writeGenerated, type CopyCollector } from "./copy-asset.js";

function escapeTomlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function generateCursorAgents(cwd: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const catalog = loadCatalog(packageRoot);
  for (const id of catalog.defaultAgents) {
    const content = readFileSync(agentSourcePath(packageRoot, id), "utf8");
    writeGenerated(cwd, `.cursor/agents/${id}.md`, content, force, collector);
  }
}

export function generateCursorSkills(cwd: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const catalog = loadCatalog(packageRoot);
  for (const id of catalog.defaultSkills) {
    const content = readFileSync(skillSourcePath(packageRoot, id), "utf8");
    writeGenerated(cwd, `.cursor/skills/${id}/SKILL.md`, content, force, collector);
  }
}

export function generateClaudeAgents(cwd: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const catalog = loadCatalog(packageRoot);
  for (const id of catalog.defaultAgents) {
    const content = readFileSync(agentSourcePath(packageRoot, id), "utf8");
    writeGenerated(cwd, `.claude/agents/${id}.md`, content, force, collector);
  }
}

export function generateCodexAgents(cwd: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const catalog = loadCatalog(packageRoot);
  for (const id of catalog.defaultAgents) {
    const markdown = readFileSync(agentSourcePath(packageRoot, id), "utf8");
    const meta = parseFrontmatter(markdown);
    const description = meta.description ?? id;
    const toml = `name = "${id}"
description = "${escapeTomlString(description)}"
model_reasoning_effort = "medium"

developer_instructions = """
${markdown.replace(/"""/g, '\\"\\"\\"')}
"""
`;
    writeGenerated(cwd, `.codex/agents/${id}.toml`, toml, force, collector);
  }
}

export function generateCopilotInstructions(cwd: string, force: boolean, collector: CopyCollector): void {
  const catalog = loadCatalog();
  const content = `# Copilot instructions

This repo uses a small agent and skill pack. Read \`AGENTS.md\` and \`USER_GUIDE.md\`.

When the user names a role, act as that agent:

${catalog.defaultAgents.map((id) => `- ${id}`).join("\n")}

${catalog.screenshotFailClosed}

Do not review user-visible work from code alone. Use the browser-qa skill: open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.

If you cannot open a browser, use Playwright:

\`\`\`bash
npx playwright screenshot --viewport-size=1280,720 "$URL" qa-evidence/<slug>/desktop.png
npx playwright screenshot --viewport-size=390,844 "$URL" qa-evidence/<slug>/mobile.png
\`\`\`
`;
  writeGenerated(cwd, ".github/copilot-instructions.md", content, force, collector);
}

export function generateAntigravityCommands(cwd: string, force: boolean, collector: CopyCollector): void {
  const commands: Array<{ name: string; description: string; prompt: string }> = [
    {
      name: "plan",
      description: "Plan the change and name the owning agent.",
      prompt: "Act as the planner agent. Plan this change. Name the owning agent, extra reviewers, and which screenshots QA must capture. Do not write code. Read AGENTS.md and USER_GUIDE.md."
    },
    {
      name: "browser-qa",
      description: "Live browser QA with desktop and mobile screenshots.",
      prompt: "Act as the QA agent. Use the browser-qa skill. Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject."
    },
    {
      name: "security",
      description: "Auth, RLS, secrets, and OWASP review.",
      prompt: "Act as the security agent. Review auth, RLS, IDOR, and secrets. Exercise login or denied states in the browser when they are user-visible."
    },
    {
      name: "frontend",
      description: "UI review from screenshots first.",
      prompt: "Act as the design agent. Review the running UI from screenshots first. Desktop and mobile. Reject generic AI-looking layout."
    },
    {
      name: "copy",
      description: "Review rendered conversion copy.",
      prompt: "Act as the copy agent. Review the rendered words in screenshots, not just strings in source."
    },
    {
      name: "test",
      description: "Run tests, then browser-qa for UI.",
      prompt: "Act as the QA agent. Run applicable tests, then use browser-qa for any user-visible change."
    },
    {
      name: "ship",
      description: "Release go / no-go.",
      prompt: "Use the ship skill. Confirm env, migrations, rollback, and browser-qa evidence for user-visible changes."
    }
  ];

  writeGenerated(
    cwd,
    ".antigravity/agent-kit/plugin.json",
    `${JSON.stringify({ name: "agents-and-skills", commands: commands.map((item) => item.name) }, null, 2)}\n`,
    force,
    collector
  );

  for (const command of commands) {
    const toml = `name = "${command.name}"
description = "${command.description}"

prompt = """
${command.prompt}
"""
`;
    writeGenerated(cwd, `.antigravity/agent-kit/commands/${command.name}.toml`, toml, force, collector);
  }

  const packageRoot = findPackageRoot();
  const catalog = loadCatalog(packageRoot);
  for (const id of catalog.defaultSkills) {
    const content = readFileSync(skillSourcePath(packageRoot, id), "utf8");
    writeGenerated(cwd, `.antigravity/runtime-skills/${id}/SKILL.md`, content, force, collector);
  }
}

export function copyOptionalAgent(cwd: string, id: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const content = readFileSync(agentSourcePath(packageRoot, id), "utf8");
  writeGenerated(cwd, `.cursor/agents/${id}.md`, content, force, collector);
  writeGenerated(cwd, `.claude/agents/${id}.md`, content, force, collector);
}

export function copyOptionalSkill(cwd: string, id: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const content = readFileSync(skillSourcePath(packageRoot, id), "utf8");
  writeGenerated(cwd, `.cursor/skills/${id}/SKILL.md`, content, force, collector);
}
