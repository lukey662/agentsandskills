import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Command, isInterrupted } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { RuntimeConfigContract } from "../packages/runtime/src/config.js";
import { FileRunEventStore } from "../packages/runtime/src/events.js";
import { loadAgentRoster, selectWorkflow } from "../packages/runtime/src/roster.js";
import type { AgentNodeExecutor } from "../packages/runtime/src/types.js";
import { compileCouncilGraph, initialCouncilState } from "../packages/runtime/src/workflow.js";
import { WorktreeManager } from "../packages/runtime/src/worktree.js";

const roots: string[] = [];
const originalCache = process.env.XDG_CACHE_HOME;

afterEach(() => {
  if (originalCache === undefined) delete process.env.XDG_CACHE_HOME;
  else process.env.XDG_CACHE_HOME = originalCache;
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function project(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-graph-"));
  roots.push(root);
  process.env.XDG_CACHE_HOME = join(root, ".cache");
  mkdirSync(join(root, ".agent-kit", "agents"), { recursive: true });
  writeFileSync(join(root, ".agent-kit", "agents", "docs.md"), "Maintain project documentation.\n");
  writeFileSync(
    join(root, ".agent-kit", "agent-roster.json"),
    JSON.stringify({
      schemaVersion: 1,
      id: "test-roster",
      stack: "test",
      required: true,
      defaultWorkflow: "docs",
      agents: [{ id: "docs-maintainer", file: ".agent-kit/agents/docs.md", skills: ["docs"], handsOffTo: [] }],
      workflows: [{ id: "docs", sequence: ["docs-maintainer"], council: ["docs-maintainer"], requiredOutputs: ["doc update"] }],
      handoffRules: ["Record evidence."]
    })
  );
  git(root, "init", "-q");
  git(root, "config", "user.name", "Agent Kit Test");
  git(root, "config", "user.email", "agent-kit@example.invalid");
  git(root, "add", ".");
  git(root, "commit", "-qm", "initial");
  return root;
}

describe("runtime workflow graph", () => {
  it("rejects a source directory below the Git repository root", async () => {
    const root = project();
    const nested = join(root, "nested");
    mkdirSync(nested);

    await expect(new WorktreeManager(nested).inspect()).rejects.toThrow(/must be the Git repository root/);
  });

  it("resumes approval gates without replaying a mutating agent", async () => {
    const root = project();
    const config = RuntimeConfigContract.parse({
      schemaVersion: 1,
      enabled: true,
      providers: {},
      modelAliases: {},
      mutationAgents: ["docs-maintainer"]
    });
    const roster = loadAgentRoster(root);
    const workflow = selectWorkflow(roster, "docs", "Update docs");
    const worktrees = new WorktreeManager(root);
    const created = await worktrees.create("runtime-test");
    const events = new FileRunEventStore(root);
    const now = new Date().toISOString();
    events.create({
      schemaVersion: 1,
      runId: "runtime-test",
      workflowId: workflow.id,
      goal: "Update docs",
      status: "planned",
      createdAt: now,
      updatedAt: now,
      sourceRoot: root,
      baseCommit: created.baseCommit,
      worktreePath: created.path,
      branchName: created.branchName,
      results: []
    });
    const saver = SqliteSaver.fromConnString(join(root, ".agent-kit", "runtime", "test.sqlite"));
    let executions = 0;
    const executor: AgentNodeExecutor = {
      execute(input) {
        executions += 1;
        writeFileSync(join(input.worktreePath!, "RUNTIME.md"), "checkpointed\n");
        return Promise.resolve({
          agentId: input.agentId,
          summary: "Updated runtime docs.",
          decision: "Keep the checkpointed update.",
          risk: "None.",
          artifacts: ["RUNTIME.md"],
          verification: ["file written"]
        });
      }
    };
    const graph = compileCouncilGraph({
      cwd: root,
      config,
      roster,
      workflow,
      events,
      worktrees,
      checkpointer: saver,
      executorFor: () => executor
    });
    const graphConfig = { configurable: { thread_id: "runtime-test" }, recursionLimit: 20 };
    let output = await graph.invoke(
      initialCouncilState({
        runId: "runtime-test",
        workflowId: workflow.id,
        goal: "Update docs",
        sourceRoot: root,
        baseCommit: created.baseCommit,
        worktreePath: created.path
      }),
      graphConfig
    );
    expect(isInterrupted(output)).toBe(true);
    expect(events.read("runtime-test").pendingApproval?.risk).toBe("plan");

    const approvePending = async () => {
      const pending = events.read("runtime-test").pendingApproval!;
      output = await graph.invoke(new Command({ resume: { approvalId: pending.approvalId, decision: "approve", actor: "test" } }), graphConfig);
    };
    await approvePending();
    expect(events.read("runtime-test").pendingApproval?.risk).toBe("write");
    await approvePending();
    expect(executions).toBe(1);
    expect(events.read("runtime-test").pendingApproval?.risk).toBe("final-commit");
    await approvePending();

    expect(isInterrupted(output)).toBe(false);
    expect(executions).toBe(1);
    expect(output.commit).toMatch(/^[a-f0-9]{40}$/);
    expect(git(created.path, "rev-list", "--count", created.baseCommit + "..HEAD")).toBe("1");
    expect(events.events("runtime-test").filter((event) => event.type === "approval_requested")).toHaveLength(3);

    const checkpointDatabase: unknown = saver.db;
    if (!isCloseable(checkpointDatabase)) {
      throw new Error("SQLite test database does not expose close().");
    }
    checkpointDatabase.close();
    await worktrees.remove(created.path, { deleteBranch: true, force: true });
  });
});

function isCloseable(value: unknown): value is { close(): void } {
  return Boolean(value && typeof value === "object" && "close" in value && typeof value.close === "function");
}
