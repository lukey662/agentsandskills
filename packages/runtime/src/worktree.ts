import { execFile } from "node:child_process";
import { existsSync, mkdirSync, realpathSync, rmSync } from "node:fs";
import { homedir, platform } from "node:os";
import { basename, join, resolve } from "node:path";
import { promisify } from "node:util";
import { isSensitiveRelativePath } from "./security/paths.js";

const execFileAsync = promisify(execFile);

export interface WorktreeRecord {
  sourceRoot: string;
  path: string;
  branchName: string;
  baseCommit: string;
  excludedDirtyChanges: boolean;
}

function cacheRoot(): string {
  if (process.env.XDG_CACHE_HOME) return join(process.env.XDG_CACHE_HOME, "agent-kit", "worktrees");
  if (platform() === "darwin") return join(homedir(), "Library", "Caches", "agent-kit", "worktrees");
  if (platform() === "win32") return join(process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"), "agent-kit", "worktrees");
  return join(homedir(), ".cache", "agent-kit", "worktrees");
}

async function git(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd, encoding: "utf8", maxBuffer: 2_000_000 });
    return stdout.trim();
  } catch (error) {
    const failure = error as { stderr?: string; message?: string };
    throw new Error(`git ${args[0] ?? "command"} failed: ${(failure.stderr || failure.message || "unknown error").trim()}`);
  }
}

export class WorktreeManager {
  readonly sourceRoot: string;

  constructor(sourceRoot: string) {
    this.sourceRoot = realpathSync(resolve(sourceRoot));
  }

  async inspect(): Promise<{ baseCommit: string; dirty: boolean; status: string; sensitivePaths: string[] }> {
    const root = await git(this.sourceRoot, ["rev-parse", "--show-toplevel"]);
    const prefix = await git(this.sourceRoot, ["rev-parse", "--show-prefix"]);
    if (prefix) throw new Error(`Runtime source root must be the Git repository root: ${root}`);
    const baseCommit = await git(this.sourceRoot, ["rev-parse", "HEAD"]);
    const status = await git(this.sourceRoot, ["status", "--porcelain=v1", "--untracked-files=all"]);
    const tracked = await git(this.sourceRoot, ["ls-files"]);
    const sensitivePaths = tracked.split(/\r?\n/).filter(Boolean).filter(isSensitiveRelativePath).sort();
    return { baseCommit, dirty: Boolean(status), status, sensitivePaths };
  }

  async create(runId: string, options: { acknowledgeDirtyBase?: boolean } = {}): Promise<WorktreeRecord> {
    if (!/^[a-zA-Z0-9_-]+$/.test(runId)) throw new Error(`Invalid run id: ${runId}`);
    const inspection = await this.inspect();
    if (inspection.sensitivePaths.length > 0) {
      throw new Error(`Tracked sensitive paths cannot enter an orchestrator worktree: ${inspection.sensitivePaths.slice(0, 10).join(", ")}`);
    }
    if (inspection.dirty && !options.acknowledgeDirtyBase) {
      throw new Error("The source checkout has local changes. Re-run with explicit dirty-base acknowledgement; those changes will not be copied.");
    }
    const repoKey = basename(this.sourceRoot).replace(/[^a-zA-Z0-9_.-]/g, "-");
    const path = join(cacheRoot(), repoKey, runId);
    const branchName = `agent-kit/${runId}`;
    if (existsSync(path)) throw new Error(`Worktree path already exists: ${path}`);
    mkdirSync(join(path, ".."), { recursive: true });
    await git(this.sourceRoot, ["worktree", "add", "--no-track", "-b", branchName, path, inspection.baseCommit]);
    return {
      sourceRoot: this.sourceRoot,
      path,
      branchName,
      baseCommit: inspection.baseCommit,
      excludedDirtyChanges: inspection.dirty
    };
  }

  async changes(path: string): Promise<string> {
    return git(path, ["status", "--short"]);
  }

  async head(path: string): Promise<string> {
    return git(path, ["rev-parse", "HEAD"]);
  }

  async commit(path: string, runId: string, title: string): Promise<{ commit: string; changed: string }> {
    const changed = await this.changes(path);
    if (!changed) throw new Error("The run produced no changes to commit.");
    await git(path, ["add", "--all"]);
    const message = `${title.trim().slice(0, 72) || "Apply Agent Kit run"}\n\nAgent-Kit-Run: ${runId}`;
    await git(path, ["commit", "-m", message]);
    const commit = await git(path, ["rev-parse", "HEAD"]);
    return { commit, changed };
  }

  async remove(path: string, options: { deleteBranch?: boolean; force?: boolean } = {}): Promise<void> {
    const branch = options.deleteBranch ? await git(path, ["branch", "--show-current"]).catch(() => "") : "";
    await git(this.sourceRoot, ["worktree", "remove", ...(options.force ? ["--force"] : []), path]);
    if (branch.startsWith("agent-kit/")) await git(this.sourceRoot, ["branch", "-D", branch]);
    rmSync(path, { recursive: true, force: true });
  }
}
