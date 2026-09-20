import { listKnownAgents } from "../catalog.js";
import { findPackageRoot } from "../utils/package-root.js";
import { emptyCollector } from "./copy-asset.js";
import { IDE_TARGETS, isIdeTarget } from "./ide-activate.js";
import { readManifest } from "./install.js";
import { agentTargetPath, copyOptionalAgent, type AgentHost } from "./roster-adapters.js";

export function listAgents(): string[] {
  return listKnownAgents();
}

export interface AddAgentResult {
  action: "created" | "unchanged" | "conflict" | "overwritten";
  target: string;
  targets: string[];
  dryRun: boolean;
}

/** Hosts the project activated, so an optional agent lands everywhere the defaults did. Falls back to Cursor. */
export function activatedHosts(cwd: string): AgentHost[] {
  const activated = (readManifest(cwd)?.activated ?? []).filter(isIdeTarget);
  return activated.length > 0 ? activated : ["cursor"];
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

  const hosts = activatedHosts(cwd).filter((host): host is AgentHost => (IDE_TARGETS as readonly string[]).includes(host));
  const targets = hosts.map((host) => agentTargetPath(host, id));
  const target = targets[0] ?? agentTargetPath("cursor", id);
  if (options.dryRun) {
    return { action: "created", target, targets, dryRun: true };
  }

  const collector = emptyCollector();
  copyOptionalAgent(cwd, id, Boolean(options.force), collector, hosts);
  const action = collector.copied.includes(target)
    ? "created"
    : collector.unchanged.includes(target)
      ? "unchanged"
      : collector.overwritten.includes(target)
        ? "overwritten"
        : "conflict";
  return { action, target, targets, dryRun: false };
}
