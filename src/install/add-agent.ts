import { listKnownAgents } from "../catalog.js";
import { findPackageRoot } from "../utils/package-root.js";
import { emptyCollector } from "./copy-asset.js";
import { copyOptionalAgent } from "./roster-adapters.js";

export function listAgents(): string[] {
  return listKnownAgents();
}

export interface AddAgentResult {
  action: "created" | "unchanged" | "conflict" | "overwritten";
  target: string;
  dryRun: boolean;
}

export function addAgent(cwd: string, agentName: string, options: { force?: boolean; dryRun?: boolean } = {}): AddAgentResult {
  const packageRoot = findPackageRoot();
  const id = agentName.replace(/\.md$/, "");
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error("Agent names may contain only lowercase letters, numbers, and hyphens.");
  }

  const available = listKnownAgents(packageRoot);
  if (!available.includes(id)) {
    throw new Error(`Unknown agent "${agentName}". Available agents: ${available.join(", ")}`);
  }

  const target = `.cursor/agents/${id}.md`;
  if (options.dryRun) {
    return { action: "created", target, dryRun: true };
  }

  const collector = emptyCollector();
  copyOptionalAgent(cwd, id, Boolean(options.force), collector);
  const action = collector.copied.includes(target)
    ? "created"
    : collector.unchanged.includes(target)
      ? "unchanged"
      : collector.overwritten.includes(target)
        ? "overwritten"
        : "conflict";
  return { action, target, dryRun: false };
}
