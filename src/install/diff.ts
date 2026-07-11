import { existsSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_AGENT_ROSTER_TARGET, DEFAULT_MODEL_ROUTING_TARGET, LIBRARY_FOLDERS, ROOT_DOCS } from "../config/defaults.js";
import { resolveInside } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { planFileUpdate, type FileUpdatePlan } from "./file-update-plan.js";
import { readManifest } from "./install.js";
import { listManagedAssets } from "./managed-assets.js";

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

function diffStatus(plan: FileUpdatePlan): DiffStatus {
  if (plan.action === "created") return "missing";
  if (plan.action === "unchanged") return "unchanged";
  return "changed";
}

export function diffProject(cwd: string, stack = "next-supabase"): DiffResult {
  const packageRoot = findPackageRoot();
  const manifest = readManifest(cwd);
  const assets = listManagedAssets(packageRoot, stack);
  const plans = assets.map((asset) => ({
    asset,
    plan: planFileUpdate({
      target: asset.target,
      sourcePath: asset.sourcePath,
      targetPath: resolveInside(cwd, asset.target),
      installedHash: manifest?.assetHashes?.[asset.target] ?? manifest?.templateHashes?.[asset.target],
      force: false
    })
  }));
  const byTarget = new Map(plans.map(({ asset, plan }) => [asset.target, { asset, plan }]));
  const rootPlans = ROOT_DOCS.map((target) => byTarget.get(target)?.plan).filter((plan): plan is FileUpdatePlan => Boolean(plan));
  const agentPlan = byTarget.get(DEFAULT_AGENT_ROSTER_TARGET)?.plan;
  const modelPlan = byTarget.get(DEFAULT_MODEL_ROUTING_TARGET)?.plan;
  const mutatingActions = new Set(["created", "updated", "overwritten"]);
  const refreshedFolders = [
    ...new Set(plans.filter(({ asset, plan }) => asset.libraryFolder && mutatingActions.has(plan.action)).map(({ asset }) => asset.libraryFolder!))
  ].sort();

  const missingFolders = LIBRARY_FOLDERS.filter((folder) => !existsSync(join(cwd, ".agent-kit", folder)));
  const presentFolders = LIBRARY_FOLDERS.filter((folder) => !missingFolders.includes(folder));
  const wouldCreate = plans.filter(({ plan }) => plan.action === "created").map(({ plan }) => plan.target);
  const wouldWriteConflicts = plans.filter(({ plan }) => plan.action === "conflict").map(({ plan }) => plan.target);

  return {
    missing: rootPlans.filter((plan) => plan.action === "created").map((plan) => plan.target),
    unchanged: rootPlans.filter((plan) => plan.action === "unchanged").map((plan) => plan.target),
    changed: rootPlans.filter((plan) => plan.action !== "created" && plan.action !== "unchanged").map((plan) => plan.target),
    agentRoster: agentPlan ? diffStatus(agentPlan) : "missing",
    modelRouting: modelPlan ? diffStatus(modelPlan) : "missing",
    libraryFolders: {
      missing: missingFolders,
      present: presentFolders,
      willRefresh: refreshedFolders
    },
    preview: {
      wouldCreate,
      wouldWriteConflicts,
      wouldRefreshLibraryFolders: refreshedFolders,
      wouldCreateAgentRoster: agentPlan?.action === "created",
      wouldWriteAgentRosterConflict: agentPlan?.action === "conflict",
      wouldCreateModelRouting: modelPlan?.action === "created",
      wouldWriteModelRoutingConflict: modelPlan?.action === "conflict"
    }
  };
}
