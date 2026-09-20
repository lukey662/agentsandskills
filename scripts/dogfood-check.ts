#!/usr/bin/env tsx
/**
 * Maintainer drift guard. This repo dogfoods its own kit, so the IDE reads the rendered layers
 * (.cursor/, .claude/, .codex/, .agents/, .github/agents/), not agents/ and skills/. If those
 * copies lag, the newest playbook never reaches the agent and the maintainers test a different
 * kit than downstream users install.
 *
 * Regenerates the IDE layers with force (never the root docs, which are the kit's own here),
 * then fails if any tracked generated file changed, any rendered copy differs from what the
 * renderer produces now, or doctor / adapter validate fail.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog } from "../src/catalog.js";
import { validateAdapter } from "../src/install/adapter-validate.js";
import { createDoctorReport } from "../src/install/doctor.js";
import { activateIdeTargets } from "../src/install/ide-activate.js";
import { agentTargetPath, renderAgent, type AgentHost } from "../src/install/roster-adapters.js";

const cwd = process.cwd();
const catalog = loadCatalog(cwd);
const problems: string[] = [];
const HOSTS: AgentHost[] = ["cursor", "claude", "codex", "copilot", "antigravity"];

// Tracked files that a generator writes. Snapshot before regenerating so the comparison is
// content-to-content and does not depend on git index state.
const TRACKED_GENERATED = [".cursor/rules/cursor-agent-kit.mdc", "CLAUDE.md", ".github/copilot-instructions.md"];
const before = new Map<string, string | null>();
for (const relativePath of TRACKED_GENERATED) {
  const path = join(cwd, relativePath);
  before.set(relativePath, existsSync(path) ? readFileSync(path, "utf8") : null);
}

activateIdeTargets({ cwd, targets: ["all"], force: true });

for (const relativePath of TRACKED_GENERATED) {
  const previous = before.get(relativePath);
  const current = readFileSync(join(cwd, relativePath), "utf8");
  if (previous === null) problems.push(`${relativePath} did not exist before regeneration. Commit the generated file.`);
  else if (previous !== current) problems.push(`${relativePath} changed after regeneration. Commit the regenerated file.`);
}

for (const id of catalog.defaultAgents) {
  for (const host of HOSTS) {
    const relativePath = agentTargetPath(host, id);
    const path = join(cwd, relativePath);
    if (!existsSync(path)) problems.push(`${relativePath} missing`);
    else if (readFileSync(path, "utf8") !== renderAgent(host, id)) problems.push(`${relativePath} differs from the ${host} render of agents/${id}/agent.md`);
  }
}
for (const id of catalog.defaultSkills) {
  const canonical = readFileSync(join(cwd, "skills", id, "SKILL.md"), "utf8");
  for (const relativePath of [`.agents/skills/${id}/SKILL.md`, `.claude/skills/${id}/SKILL.md`]) {
    const path = join(cwd, relativePath);
    if (!existsSync(path)) problems.push(`${relativePath} missing`);
    else if (readFileSync(path, "utf8") !== canonical) problems.push(`${relativePath} differs from skills/${id}/SKILL.md`);
  }
}

const report = createDoctorReport(cwd);
for (const finding of report.findings.filter((item) => item.level === "fail")) problems.push(`doctor: ${finding.message}`);

const adapters = validateAdapter(cwd, "all");
for (const finding of adapters.findings.filter((item) => item.level === "fail")) problems.push(`adapter validate: ${finding.message}`);

if (problems.length > 0) {
  console.error("dogfood check failed");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log(
  `dogfood check passed: ${catalog.defaultAgents.length} agents × ${HOSTS.length} hosts, ${catalog.defaultSkills.length} skills, doctor and adapter validate ok`
);
