import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { ApprovalRequest, ApprovalRisk, ModelToolDefinition } from "./types.js";
import { DockerSandbox } from "./sandbox/docker.js";
import { assertSafeToolPath, canonicalPath, isPathWithin, isSensitiveRelativePath, pathsEqual } from "./security/paths.js";

export interface ToolApprovalHandler {
  (request: Omit<ApprovalRequest, "approvalId" | "requestedAt">): Promise<boolean>;
}

export interface ToolExecutionContext {
  runId: string;
  root: string;
  mutationAllowed: boolean;
  approve: ToolApprovalHandler;
  signal?: AbortSignal;
}

export interface ToolExecutionResult {
  output: string;
  data?: Record<string, unknown>;
}

const READ_TOOLS: ModelToolDefinition[] = [
  {
    name: "read_file",
    description: "Read a UTF-8 text file inside the isolated worktree.",
    inputSchema: { type: "object", additionalProperties: false, required: ["path"], properties: { path: { type: "string" } } },
    risk: "read"
  },
  {
    name: "list_files",
    description: "List files under a directory inside the isolated worktree.",
    inputSchema: { type: "object", additionalProperties: false, properties: { path: { type: "string" }, limit: { type: "integer" } } },
    risk: "read"
  },
  {
    name: "search",
    description: "Search text files for a literal string inside the isolated worktree.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["query"],
      properties: { query: { type: "string" }, path: { type: "string" }, limit: { type: "integer" } }
    },
    risk: "read"
  }
];

const MUTATION_TOOLS: ModelToolDefinition[] = [
  {
    name: "write_file",
    description: "Write a complete UTF-8 file inside the approved isolated worktree.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["path", "content"],
      properties: { path: { type: "string" }, content: { type: "string" } }
    },
    risk: "write"
  },
  {
    name: "run_command",
    description: "Run an argv command in the Docker sandbox. Shell strings are not accepted.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["argv"],
      properties: { argv: { type: "array", minItems: 1, items: { type: "string" } }, cwd: { type: "string" }, network: { type: "boolean" } }
    },
    risk: "write"
  }
];

export class ToolBroker {
  constructor(private readonly sandbox?: DockerSandbox) {}

  definitions(mutationAllowed: boolean): ModelToolDefinition[] {
    return mutationAllowed ? [...READ_TOOLS, ...MUTATION_TOOLS] : [...READ_TOOLS];
  }

  async execute(name: string, args: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    if (name === "read_file") return this.readFile(context.root, stringArg(args, "path"));
    if (name === "list_files") return this.listFiles(context.root, optionalStringArg(args, "path") ?? ".", numberArg(args, "limit", 500));
    if (name === "search") {
      return this.search(context.root, stringArg(args, "query"), optionalStringArg(args, "path") ?? ".", numberArg(args, "limit", 100));
    }
    if (!context.mutationAllowed) throw new Error(`Tool ${name} is not available to a read-only agent node.`);
    if (name === "write_file") {
      await this.requireApproval(context, "write", `Write ${stringArg(args, "path")}`, "The model requested a worktree file mutation.");
      return this.writeFile(context.root, stringArg(args, "path"), stringArg(args, "content"));
    }
    if (name === "run_command") {
      if (!this.sandbox) throw new Error("No Docker sandbox is configured for command execution.");
      const argv = stringArrayArg(args, "argv");
      const network = args.network === true;
      const risk = commandRisk(argv, network);
      await this.requireApproval(context, risk, `Run ${argv.join(" ").slice(0, 180)}`, `Docker command requested in ${optionalStringArg(args, "cwd") ?? "."}.`);
      const cwd = optionalStringArg(args, "cwd");
      const result = await this.sandbox.run({
        argv,
        ...(cwd ? { cwd } : {}),
        networkApproved: network,
        ...(context.signal ? { signal: context.signal } : {})
      });
      return {
        output: `${result.stdout}${result.stderr ? `\n[stderr]\n${result.stderr}` : ""}`.trim(),
        data: { exitCode: result.exitCode, durationMs: result.durationMs, imageId: result.imageId }
      };
    }
    throw new Error(`Unknown or disallowed tool: ${name}`);
  }

  private readFile(root: string, requested: string): ToolExecutionResult {
    const path = safeExistingPath(root, requested);
    const stats = lstatSync(path);
    if (!stats.isFile()) throw new Error(`Not a file: ${requested}`);
    if (stats.size > 1_000_000) throw new Error(`File exceeds the 1 MB read limit: ${requested}`);
    const content = readFileSync(path, "utf8");
    if (content.includes("\0")) throw new Error(`Binary files cannot be read through this tool: ${requested}`);
    return { output: content, data: { path: normalizedRelative(root, path), bytes: stats.size } };
  }

  private listFiles(root: string, requested: string, limit: number): ToolExecutionResult {
    const start = safeExistingPath(root, requested);
    const results: string[] = [];
    const visit = (path: string) => {
      if (results.length >= limit) return;
      const stats = lstatSync(path);
      if (stats.isSymbolicLink()) return;
      if (stats.isFile()) {
        results.push(normalizedRelative(root, path));
        return;
      }
      if (!stats.isDirectory()) return;
      for (const entry of readdirSync(path).sort()) {
        if (entry === ".git" || entry === "node_modules") continue;
        const relativeEntry = normalizedRelative(root, join(path, entry));
        if (isSensitiveRelativePath(relativeEntry)) continue;
        visit(join(path, entry));
        if (results.length >= limit) return;
      }
    };
    visit(start);
    return { output: results.join("\n"), data: { count: results.length, truncated: results.length >= limit } };
  }

  private search(root: string, query: string, requested: string, limit: number): ToolExecutionResult {
    if (!query || query.length > 500) throw new Error("Search query must be between 1 and 500 characters.");
    const files = this.listFiles(root, requested, 5_000).output.split("\n").filter(Boolean);
    const matches: string[] = [];
    for (const file of files) {
      if (matches.length >= limit) break;
      const path = safeExistingPath(root, file);
      const stats = lstatSync(path);
      if (stats.size > 1_000_000) continue;
      let content: string;
      try {
        content = readFileSync(path, "utf8");
      } catch {
        continue;
      }
      if (content.includes("\0")) continue;
      content.split(/\r?\n/).forEach((line, index) => {
        if (matches.length < limit && line.includes(query)) matches.push(`${file}:${index + 1}:${line.slice(0, 500)}`);
      });
    }
    return { output: matches.join("\n"), data: { count: matches.length, truncated: matches.length >= limit } };
  }

  private writeFile(root: string, requested: string, content: string): ToolExecutionResult {
    if (Buffer.byteLength(content) > 2_000_000) throw new Error("Write exceeds the 2 MB file limit.");
    const path = safeNewPath(root, requested);
    mkdirSync(dirname(path), { recursive: true });
    const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporary, content);
      renameSync(temporary, path);
    } finally {
      rmSync(temporary, { force: true });
    }
    return { output: `Wrote ${normalizedRelative(root, path)}.`, data: { path: normalizedRelative(root, path), bytes: Buffer.byteLength(content) } };
  }

  private async requireApproval(context: ToolExecutionContext, risk: ApprovalRisk, title: string, detail: string): Promise<void> {
    const approved = await context.approve({ runId: context.runId, risk, title, detail });
    if (!approved) throw new Error(`Approval rejected for ${risk} action: ${title}`);
  }
}

function safeRoot(root: string): string {
  return canonicalPath(root);
}

function safeExistingPath(root: string, requested: string): string {
  if (!requested || isAbsolute(requested)) throw new Error("Tool paths must be non-empty and relative.");
  assertSafeToolPath(requested);
  const rootPath = safeRoot(root);
  const candidate = canonicalPath(resolve(rootPath, requested));
  if (!isPathWithin(rootPath, candidate)) throw new Error(`Path escapes the worktree: ${requested}`);
  return candidate;
}

function safeNewPath(root: string, requested: string): string {
  if (!requested || isAbsolute(requested)) throw new Error("Tool paths must be non-empty and relative.");
  assertSafeToolPath(requested);
  const rootPath = safeRoot(root);
  const candidate = resolve(rootPath, requested);
  if (!isPathWithin(rootPath, candidate)) throw new Error(`Path escapes the worktree: ${requested}`);
  let parent = dirname(candidate);
  while (!existsSync(parent) && !pathsEqual(parent, rootPath)) parent = dirname(parent);
  const realParent = canonicalPath(parent);
  if (!isPathWithin(rootPath, realParent)) throw new Error(`Path parent escapes the worktree: ${requested}`);
  return candidate;
}

function normalizedRelative(root: string, path: string): string {
  return relative(safeRoot(root), path).replace(/\\/g, "/");
}

function stringArg(args: Record<string, unknown>, name: string): string {
  const value = args[name];
  if (typeof value !== "string" || !value) throw new Error(`${name} must be a non-empty string.`);
  return value;
}

function optionalStringArg(args: Record<string, unknown>, name: string): string | undefined {
  const value = args[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`${name} must be a string.`);
  return value;
}

function numberArg(args: Record<string, unknown>, name: string, fallback: number): number {
  const value = args[name];
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5_000) throw new Error(`${name} must be an integer from 1 to 5000.`);
  return value;
}

function stringArrayArg(args: Record<string, unknown>, name: string): string[] {
  const value = args[name];
  if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === "string" && item.length > 0)) {
    throw new Error(`${name} must be a non-empty string array.`);
  }
  if (value.length > 100) throw new Error(`${name} contains too many arguments.`);
  return value as string[];
}

function commandRisk(argv: string[], network: boolean): ApprovalRisk {
  if (network) return "network";
  const executable = argv[0]?.toLowerCase() ?? "";
  if (["rm", "rmdir", "shred", "mkfs", "dd"].includes(executable)) return "destructive";
  if (executable === "git" && ["reset", "clean", "checkout", "restore"].includes(argv[1]?.toLowerCase() ?? "")) return "destructive";
  return "write";
}
