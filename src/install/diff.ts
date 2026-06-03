import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_AGENT_ROSTER_SOURCE,
  DEFAULT_AGENT_ROSTER_TARGET,
  DEFAULT_MODEL_ROUTING_SOURCE,
  DEFAULT_MODEL_ROUTING_TARGET,
  LIBRARY_FOLDERS,
  ROOT_DOCS
} from "../config/defaults.js";
import { sha256 } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";

export type DiffStatus = "missing" | "unchanged" | "changed";

export interface DiffResult {
  missing: string[];
  unchanged: string[];
  changed: string[];
  agentRoster: DiffStatus;
  modelRouting: DiffStatus;
  libraryFolders: {
    missing: string[];
    present: string[];
    willRefresh: string[];
  };
  preview: {
    wouldCreate: string[];
    wouldWriteConflicts: string[];
    wouldRefreshLibraryFolders: string[];
    wouldCreateAgentRoster: boolean;
    wouldWriteAgentRosterConflict: boolean;
    wouldCreateModelRouting: boolean;
    wouldWriteModelRoutingConflict: boolean;
  };
}

function statusForTextFile(target: string, template: string): DiffStatus {
  if (!existsSync(target)) return "missing";

  const targetHash = sha256(readFileSync(target, "utf8"));
  const templateHash = sha256(readFileSync(template, "utf8"));
  return targetHash === templateHash ? "unchanged" : "changed";
}

export function diffProject(cwd: string, stack = "next-supabase"): DiffResult {
  const packageRoot = findPackageRoot();
  const templateRoot = join(packageRoot, "templates", stack);
  const libraryFolders = {
    missing: [] as string[],
    present: [] as string[],
    willRefresh: [...LIBRARY_FOLDERS]
  };
  const result: DiffResult = {
    missing: [],
    unchanged: [],
    changed: [],
    agentRoster: "missing",
    modelRouting: "missing",
    libraryFolders,
    preview: {
      wouldCreate: [],
      wouldWriteConflicts: [],
      wouldRefreshLibraryFolders: [...LIBRARY_FOLDERS],
      wouldCreateAgentRoster: false,
      wouldWriteAgentRosterConflict: false,
      wouldCreateModelRouting: false,
      wouldWriteModelRoutingConflict: false
    }
  };

  for (const doc of ROOT_DOCS) {
    const target = join(cwd, doc);
    const template = join(templateRoot, doc);
    const status = statusForTextFile(target, template);

    if (status === "missing") {
      result.missing.push(doc);
      result.preview.wouldCreate.push(doc);
      continue;
    }

    if (status === "unchanged") result.unchanged.push(doc);
    else {
      result.changed.push(doc);
      result.preview.wouldWriteConflicts.push(doc);
    }
  }

  result.agentRoster = statusForTextFile(join(cwd, DEFAULT_AGENT_ROSTER_TARGET), join(packageRoot, DEFAULT_AGENT_ROSTER_SOURCE));
  if (result.agentRoster === "missing") {
    result.preview.wouldCreate.push(DEFAULT_AGENT_ROSTER_TARGET);
    result.preview.wouldCreateAgentRoster = true;
  }
  if (result.agentRoster === "changed") {
    result.preview.wouldWriteConflicts.push(DEFAULT_AGENT_ROSTER_TARGET);
    result.preview.wouldWriteAgentRosterConflict = true;
  }

  result.modelRouting = statusForTextFile(join(cwd, DEFAULT_MODEL_ROUTING_TARGET), join(packageRoot, DEFAULT_MODEL_ROUTING_SOURCE));
  if (result.modelRouting === "missing") {
    result.preview.wouldCreate.push(DEFAULT_MODEL_ROUTING_TARGET);
    result.preview.wouldCreateModelRouting = true;
  }
  if (result.modelRouting === "changed") {
    result.preview.wouldWriteConflicts.push(DEFAULT_MODEL_ROUTING_TARGET);
    result.preview.wouldWriteModelRoutingConflict = true;
  }

  for (const folder of LIBRARY_FOLDERS) {
    const target = join(cwd, ".agent-kit", folder);
    if (existsSync(target)) libraryFolders.present.push(folder);
    else libraryFolders.missing.push(folder);
  }

  return result;
}
