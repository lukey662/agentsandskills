import { existsSync, readFileSync } from "node:fs";
import { sha256 } from "../utils/fs.js";

export type PlannedUpdateAction = "created" | "updated" | "unchanged" | "kept-local" | "conflict" | "overwritten";

export interface FileUpdatePlan {
  target: string;
  action: PlannedUpdateAction;
  reason: string;
  sourceContent: string;
  sourceHash: string;
  localContent?: string;
}

export interface FileUpdatePlanInput {
  target: string;
  sourcePath: string;
  targetPath: string;
  installedHash: string | undefined;
  force: boolean;
}

export function planFileUpdate(input: FileUpdatePlanInput): FileUpdatePlan {
  const sourceContent = readFileSync(input.sourcePath, "utf8");
  const sourceHash = sha256(sourceContent);

  if (!existsSync(input.targetPath)) {
    return { target: input.target, action: "created", reason: "File is missing locally.", sourceContent, sourceHash };
  }

  const localContent = readFileSync(input.targetPath, "utf8");
  const localHash = sha256(localContent);
  if (localHash === sourceHash) {
    return {
      target: input.target,
      action: "unchanged",
      reason: "File already matches the current package asset.",
      sourceContent,
      sourceHash,
      localContent
    };
  }
  if (input.installedHash && localHash === input.installedHash) {
    return {
      target: input.target,
      action: "updated",
      reason: "File was unmodified since install; applied the newer package asset.",
      sourceContent,
      sourceHash,
      localContent
    };
  }
  if (input.force) {
    return {
      target: input.target,
      action: "overwritten",
      reason: "Local changes will be overwritten because --force was used.",
      sourceContent,
      sourceHash,
      localContent
    };
  }
  if (input.installedHash && input.installedHash === sourceHash) {
    return {
      target: input.target,
      action: "kept-local",
      reason: "File is locally customized and the package asset has not changed.",
      sourceContent,
      sourceHash,
      localContent
    };
  }
  return {
    target: input.target,
    action: "conflict",
    reason: "File is locally customized and the package asset changed; review the proposed content.",
    sourceContent,
    sourceHash,
    localContent
  };
}
