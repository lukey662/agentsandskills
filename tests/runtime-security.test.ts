import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { RuntimeConfigContract, loadRuntimeConfig, requiredCapabilities } from "../packages/runtime/src/config.js";
import { FileRunEventStore } from "../packages/runtime/src/events.js";
import { assertSafeMcpUrl, McpClientBroker } from "../packages/runtime/src/mcp.js";
import { ModelRouter, ProviderRegistry } from "../packages/runtime/src/providers/registry.js";
import { readAgentInstructions } from "../packages/runtime/src/roster.js";
import type { CredentialStore } from "../packages/runtime/src/credentials.js";
import type { ModelProviderAdapter } from "../packages/runtime/src/types.js";
import { DockerSandbox, runSandboxProcess, type SandboxProcessRunner } from "../packages/runtime/src/sandbox/docker.js";
import { assertSafeOutboundUrl } from "../packages/runtime/src/security/network.js";
import { isPathWithin, pathIdentity, pathsEqual } from "../packages/runtime/src/security/paths.js";
import { ToolBroker } from "../packages/runtime/src/tools.js";

const roots: string[] = [];
const testCredentials: CredentialStore = {
  resolve: () => Promise.resolve("test-credential"),
  set: () => Promise.resolve(),
  delete: () => Promise.resolve(false)
};

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("runtime security contracts", () => {
  it("reads project-contained agent instructions and rejects traversal", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-instructions-"));
    roots.push(root);
    mkdirSync(join(root, ".agent-kit", "agents"), { recursive: true });
    writeFileSync(join(root, ".agent-kit", "agents", "docs.md"), "Maintain documentation.\n");
    const agent = { id: "docs", file: ".agent-kit/agents/docs.md", skills: ["docs"] };

    expect(readAgentInstructions(root, agent)).toBe("Maintain documentation.\n");
    expect(() => readAgentInstructions(root, { ...agent, file: "../outside.md" })).toThrow(/escapes the project/);
  });

  it("compares Windows paths by canonical identity without prefix confusion", () => {
    expect(pathIdentity("C:\\Users\\Runner\\repo\\", true)).toBe("c:/users/runner/repo");
    expect(pathsEqual("C:\\Users\\Runner\\repo", "c:/users/runner/repo", true)).toBe(true);
    expect(isPathWithin("C:\\Users\\Runner\\repo", "c:/users/runner/repo/src/a.ts", true)).toBe(true);
    expect(isPathWithin("C:\\Users\\Runner\\repo", "c:/users/runner/repository/a.ts", true)).toBe(false);
  });

  it("loads runtime config with defaults and reports missing or invalid files", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-config-"));
    roots.push(root);
    mkdirSync(join(root, ".agent-kit"));
    expect(() => loadRuntimeConfig(root)).toThrow(/Could not read/);
    writeFileSync(join(root, ".agent-kit", "orchestrator.json"), "{");
    expect(() => loadRuntimeConfig(root)).toThrow(/Could not read/);
    writeFileSync(join(root, ".agent-kit", "orchestrator.json"), JSON.stringify({ schemaVersion: 2 }));
    expect(() => loadRuntimeConfig(root)).toThrow(/Invalid.*schemaVersion/);
    writeFileSync(
      join(root, ".agent-kit", "orchestrator.json"),
      JSON.stringify({
        schemaVersion: 1,
        modelAliases: { coding: { candidates: [{ provider: "mock", model: "model" }], requiredCapabilities: ["text", "tools"] } }
      })
    );
    const config = loadRuntimeConfig(root);
    expect(config.enabled).toBe(false);
    expect(requiredCapabilities(config, "coding")).toEqual(["text", "tools"]);
    expect(requiredCapabilities(config, "missing")).toEqual(["text"]);
  });

  it("rejects inline credentials and accepts references", () => {
    expect(() =>
      RuntimeConfigContract.parse({
        schemaVersion: 1,
        providers: { openai: { kind: "openai", credentialRef: "sk-secret-value" } }
      })
    ).toThrow();
    expect(
      RuntimeConfigContract.parse({
        schemaVersion: 1,
        providers: { openai: { kind: "openai", credentialRef: "env:OPENAI_API_KEY" } }
      }).providers.openai?.credentialRef
    ).toBe("env:OPENAI_API_KEY");
  });

  it("permits explicit loopback MCP HTTP and blocks non-loopback HTTP", async () => {
    const loopback = RuntimeConfigContract.parse({
      schemaVersion: 1,
      mcpServers: {
        local: { transport: "streamable-http", url: "http://127.0.0.1:8787/mcp", allowedHosts: ["127.0.0.1"] }
      }
    }).mcpServers.local!;
    if (loopback.transport !== "streamable-http") throw new Error("Unexpected transport.");
    await expect(assertSafeMcpUrl(new URL(loopback.url), loopback)).resolves.toBeUndefined();

    const remote = { ...loopback, url: "http://example.com/mcp", allowedHosts: ["example.com"] };
    await expect(assertSafeMcpUrl(new URL(remote.url), remote)).rejects.toThrow(/requires HTTPS/);
    await expect(
      assertSafeOutboundUrl(new URL("https://192.0.2.1/mcp"), {
        allowedHosts: ["192.0.2.1"],
        allowPrivateNetwork: false,
        label: "test"
      })
    ).rejects.toThrow(/private or special-use/);
  });

  it("redacts secrets from run evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-events-"));
    roots.push(root);
    const store = new FileRunEventStore(root);
    const now = new Date().toISOString();
    store.create({
      schemaVersion: 1,
      runId: "redaction-test",
      workflowId: "test",
      goal: "Do not retain sk-testsecret1234567890",
      status: "running",
      createdAt: now,
      updatedAt: now,
      sourceRoot: root,
      baseCommit: "a".repeat(40),
      results: []
    });
    store.append("redaction-test", { type: "run_error", text: "Authorization: Bearer top-secret-value" });
    const persisted = readFileSync(join(root, ".agent-kit", "runtime", "runs", "redaction-test", "events.jsonl"), "utf8");
    expect(persisted).not.toContain("top-secret-value");
    expect(persisted).toContain("[REDACTED]");
  });

  it("keeps event records atomic, ordered, bounded by run ids, and tolerant of a partial tail", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-events-"));
    roots.push(root);
    const store = new FileRunEventStore(root);
    expect(store.list()).toEqual([]);
    const now = new Date().toISOString();
    const record = {
      schemaVersion: 1 as const,
      runId: "run-one",
      workflowId: "planning",
      goal: "Inspect",
      status: "planned" as const,
      createdAt: now,
      updatedAt: now,
      sourceRoot: root,
      baseCommit: "a".repeat(40),
      results: []
    };
    store.create(record);
    expect(() => store.create(record)).toThrow(/already exists/);
    expect(() => store.read("missing")).toThrow(/Unknown run/);
    expect(() => store.read("../escape")).toThrow(/Invalid run id/);
    const first = store.append("run-one", { type: "run_started", text: "Started" });
    const second = store.append("run-one", { type: "verification", text: "Checked" });
    expect([first.sequence, second.sequence]).toEqual([1, 2]);
    expect(store.setStatus("run-one", "running").status).toBe("running");
    expect(store.setStatus("run-one", "blocked", "Needs input").status).toBe("blocked");
    const eventPath = join(root, ".agent-kit", "runtime", "runs", "run-one", "events.jsonl");
    appendFileSync(eventPath, '{"partial":');
    expect(store.events("run-one")).toHaveLength(4);
    writeFileSync(eventPath, "not-json\n");
    expect(() => store.events("run-one")).toThrow();
    expect(store.list()).toHaveLength(1);
  });

  it("skips incapable providers before deterministic fallback", async () => {
    const config = RuntimeConfigContract.parse({
      schemaVersion: 1,
      providers: {},
      modelAliases: {
        coding: {
          requiredCapabilities: ["text"],
          candidates: [
            { provider: "text-only", model: "local" },
            { provider: "tool-model", model: "remote" }
          ]
        }
      }
    });
    const credentials: CredentialStore = {
      resolve() {
        return Promise.reject(new Error("unused"));
      },
      set() {
        return Promise.resolve();
      },
      delete() {
        return Promise.resolve(false);
      }
    };
    const registry = new ProviderRegistry(config, credentials);
    const adapter = (id: string, tools: boolean): ModelProviderAdapter => ({
      id,
      capabilities: new Set(tools ? ["text", "tools"] : ["text"]),
      probe() {
        return Promise.resolve({ providerId: id, available: true, capabilities: tools ? ["text", "tools"] : ["text"], latencyMs: 0 });
      },
      invoke() {
        return Promise.resolve({ text: id, toolCalls: [] });
      }
    });
    registry.register(adapter("text-only", false));
    registry.register(adapter("tool-model", true));
    const routed = await new ModelRouter(config, registry).invoke("coding", {
      messages: [{ role: "user", content: "test" }],
      tools: [{ name: "read", description: "read", inputSchema: { type: "object" }, risk: "read" }]
    });
    expect(routed.providerId).toBe("tool-model");
    expect(routed.attempts[0]?.outcome).toBe("capability-mismatch");
  });

  it("blocks sensitive paths from model file tools", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-tools-"));
    roots.push(root);
    writeFileSync(join(root, ".env"), "API_KEY=secret\n");
    writeFileSync(join(root, ".env.example"), "API_KEY=example\n");
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src", "index.ts"), "export {};\n");
    const tools = new ToolBroker();
    const context = { runId: "tools", root, mutationAllowed: false, approve: () => Promise.resolve(false) };
    await expect(tools.execute("read_file", { path: ".env" }, context)).rejects.toThrow(/Sensitive path/);
    await expect(tools.execute("read_file", { path: ".env.example" }, context)).resolves.toMatchObject({ output: "API_KEY=example\n" });
    const listed = await tools.execute("list_files", { path: "." }, context);
    expect(listed.output).not.toContain(".env\n");
    expect(listed.output).toContain(".env.example");
  });

  it("executes bounded file and search tools with explicit mutation approvals", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-tools-"));
    roots.push(root);
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src", "a.ts"), "const marker = 'needle';\n");
    writeFileSync(join(root, "src", "b.ts"), "const marker = 'needle';\n");
    writeFileSync(join(root, "binary.bin"), Buffer.from([0, 1, 2]));
    writeFileSync(join(root, "large.txt"), Buffer.alloc(1_000_001, "x"));
    const approvals: string[] = [];
    const context = {
      runId: "tools",
      root,
      mutationAllowed: true,
      approve: (request: { risk: string }) => {
        approvals.push(request.risk);
        return Promise.resolve(true);
      }
    };
    const tools = new ToolBroker();
    await expect(tools.execute("read_file", { path: "src/a.ts" }, context)).resolves.toMatchObject({ data: { bytes: 25 } });
    await expect(tools.execute("read_file", { path: "src" }, context)).rejects.toThrow(/Not a file/);
    await expect(tools.execute("read_file", { path: "binary.bin" }, context)).rejects.toThrow(/Binary files/);
    await expect(tools.execute("read_file", { path: "large.txt" }, context)).rejects.toThrow(/1 MB/);
    await expect(tools.execute("read_file", { path: "/etc/passwd" }, context)).rejects.toThrow(/relative/);
    await expect(tools.execute("read_file", { path: "../escape" }, context)).rejects.toThrow(/Path traversal|escapes/);
    await expect(tools.execute("list_files", { path: "src", limit: 1 }, context)).resolves.toMatchObject({ data: { count: 1, truncated: true } });
    const search = await tools.execute("search", { path: "src", query: "needle", limit: 1 }, context);
    expect(search.output).toContain("needle");
    expect(search.data?.truncated).toBe(true);
    await expect(tools.execute("search", { query: "" }, context)).rejects.toThrow(/non-empty|between 1 and 500/);
    await expect(tools.execute("search", { query: "x".repeat(501) }, context)).rejects.toThrow(/between 1 and 500/);
    await expect(tools.execute("list_files", { limit: 0 }, context)).rejects.toThrow(/integer from 1/);
    await expect(tools.execute("write_file", { path: "generated/output.txt", content: "done\n" }, context)).resolves.toMatchObject({
      output: "Wrote generated/output.txt."
    });
    expect(readFileSync(join(root, "generated", "output.txt"), "utf8")).toBe("done\n");
    await expect(tools.execute("write_file", { path: ".git/config", content: "blocked" }, context)).rejects.toThrow(/Sensitive path/);
    await expect(tools.execute("write_file", { path: "too-large.txt", content: "x".repeat(2_000_001) }, context)).rejects.toThrow(/2 MB/);
    await expect(tools.execute("unknown", {}, context)).rejects.toThrow(/Unknown or disallowed/);
    expect(approvals).toEqual(["write", "write", "write"]);
  });

  it("classifies Docker command risk and enforces tool availability", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-tools-"));
    roots.push(root);
    const imageId = `sha256:${"b".repeat(64)}`;
    const runner: SandboxProcessRunner = (_command, args) =>
      Promise.resolve({ exitCode: 0, stdout: args[0] === "image" ? imageId : "ok", stderr: "warning", imageId: "", durationMs: 1 });
    const config = RuntimeConfigContract.parse({ schemaVersion: 1, sandbox: { network: "approved" } }).sandbox;
    const tools = new ToolBroker(new DockerSandbox(config, root, runner));
    const approvals: string[] = [];
    const context = {
      runId: "commands",
      root,
      mutationAllowed: true,
      approve: (request: { risk: string }) => {
        approvals.push(request.risk);
        return Promise.resolve(true);
      }
    };
    await expect(tools.execute("run_command", { argv: ["npm", "test"] }, context)).resolves.toMatchObject({ data: { exitCode: 0 } });
    await expect(tools.execute("run_command", { argv: ["rm", "file"] }, context)).resolves.toBeDefined();
    await expect(tools.execute("run_command", { argv: ["curl", "https://example.com"], network: true }, context)).resolves.toBeDefined();
    expect(approvals).toEqual(["write", "destructive", "network"]);
    await expect(new ToolBroker().execute("run_command", { argv: ["npm"] }, context)).rejects.toThrow(/No Docker sandbox/);
    await expect(tools.execute("run_command", { argv: [] }, context)).rejects.toThrow(/non-empty string array/);
    await expect(tools.execute("run_command", { argv: new Array(101).fill("x") }, context)).rejects.toThrow(/too many arguments/);
    await expect(tools.execute("write_file", { path: "rejected.txt", content: "x" }, { ...context, approve: () => Promise.resolve(false) })).rejects.toThrow(
      /Approval rejected/
    );
  });

  it("builds Docker commands with immutable image and isolation flags", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-docker-"));
    roots.push(root);
    const calls: Array<{ command: string; args: string[]; signal?: AbortSignal }> = [];
    const imageId = `sha256:${"a".repeat(64)}`;
    const runner: SandboxProcessRunner = (command, args, options) => {
      calls.push({ command, args, ...(options.signal ? { signal: options.signal } : {}) });
      return Promise.resolve({
        exitCode: 0,
        stdout: args[0] === "image" ? `${imageId}\n` : "ok\n",
        stderr: "",
        imageId: "",
        durationMs: 1
      });
    };
    const config = RuntimeConfigContract.parse({ schemaVersion: 1 }).sandbox;
    const sandbox = new DockerSandbox(config, root, runner);
    const controller = new AbortController();
    const result = await sandbox.run({ argv: ["npm", "test"], signal: controller.signal });
    expect(result.imageId).toBe(imageId);
    const run = calls.find((call) => call.args[0] === "run")!;
    expect(run.command).toBe("docker");
    expect(run.args).toContain("--read-only");
    expect(run.args).toContain("--cap-drop=ALL");
    expect(run.args).toContain("--security-opt=no-new-privileges");
    expect(run.args).toContain("--network=none");
    expect(run.args).toContain(imageId);
    expect(run.signal).toBe(controller.signal);
  });

  it("rejects unsafe Docker policy inputs and reports unavailable images", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-docker-"));
    roots.push(root);
    const invalidRunner: SandboxProcessRunner = () => Promise.resolve({ exitCode: 1, stdout: "not-an-image", stderr: "missing", imageId: "", durationMs: 1 });
    const docker = new DockerSandbox(RuntimeConfigContract.parse({ schemaVersion: 1 }).sandbox, root, invalidRunner);
    await expect(docker.probe()).resolves.toMatchObject({ available: false, error: expect.stringContaining("not available locally") });
    await expect(docker.run({ argv: [] })).rejects.toThrow(/argv is required/);
    await expect(docker.run({ argv: ["npm"], networkApproved: true })).rejects.toThrow(/Network execution is disabled/);
    const host = new DockerSandbox(RuntimeConfigContract.parse({ schemaVersion: 1, sandbox: { provider: "host-readonly" } }).sandbox, root, invalidRunner);
    await expect(host.run({ argv: ["npm"] })).rejects.toThrow(/require the Docker sandbox/);

    const imageId = `sha256:${"c".repeat(64)}`;
    const validRunner: SandboxProcessRunner = (_command, args) =>
      Promise.resolve({ exitCode: 0, stdout: args[0] === "image" ? imageId : "", stderr: "", imageId: "", durationMs: 1 });
    const approved = new DockerSandbox(RuntimeConfigContract.parse({ schemaVersion: 1, sandbox: { network: "approved" } }).sandbox, root, validRunner);
    await expect(approved.run({ argv: ["npm"], cwd: "../escape" })).rejects.toThrow(/cwd must stay/);
    await expect(approved.run({ argv: ["npm"], environment: { "bad-key": "value" } })).rejects.toThrow(/Invalid sandbox environment key/);
  });

  it("bounds raw sandbox subprocess output, timeout, and cancellation", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-runtime-process-"));
    roots.push(root);
    await expect(
      runSandboxProcess(process.execPath, ["-e", "process.stdout.write('ok'); process.stderr.write('warn')"], { timeoutMs: 1_000 })
    ).resolves.toMatchObject({ exitCode: 0, stdout: "ok", stderr: "warn" });
    await expect(
      runSandboxProcess(process.execPath, ["-e", "process.stdout.write('x'.repeat(100))"], { timeoutMs: 1_000, maxOutputBytes: 10 })
    ).rejects.toThrow(/output exceeded/);
    await expect(runSandboxProcess(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { timeoutMs: 20 })).rejects.toThrow(/timed out/);
    const alreadyAborted = new AbortController();
    alreadyAborted.abort(new Error("already cancelled"));
    await expect(runSandboxProcess(process.execPath, ["-e", ""], { timeoutMs: 1_000, signal: alreadyAborted.signal })).rejects.toThrow(/already cancelled/);
    const controller = new AbortController();
    const running = runSandboxProcess(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { timeoutMs: 1_000, signal: controller.signal });
    setTimeout(() => controller.abort(new Error("operator cancelled")), 20);
    await expect(running).rejects.toThrow(/operator cancelled/);
    await expect(runSandboxProcess(join(root, "missing-command"), [], { timeoutMs: 1_000 })).rejects.toThrow();
  });

  it("keeps MCP tools deny-by-default before transport connection", async () => {
    const empty = new McpClientBroker({}, testCredentials, process.cwd());
    await expect(empty.definitions()).resolves.toEqual([]);
    await expect(empty.call("mcp__missing__tool", {})).rejects.toThrow(/Unknown or disallowed/);
    await expect(empty.probe("missing")).rejects.toThrow(/Unknown MCP server/);
    await empty.close();

    const localConfig = RuntimeConfigContract.parse({
      schemaVersion: 1,
      mcpServers: { local: { transport: "stdio", command: "node", allowedTools: ["read"] } }
    }).mcpServers;
    const local = new McpClientBroker(localConfig, testCredentials, process.cwd());
    await expect(local.definitions()).resolves.toEqual([]);
    await expect(local.probe("local")).rejects.toThrow(/allowHostExecution/);
    await local.close();

    const remoteConfig = RuntimeConfigContract.parse({
      schemaVersion: 1,
      mcpServers: {
        remote: {
          transport: "streamable-http",
          url: "https://192.0.2.1:9443/mcp",
          allowedHosts: ["192.0.2.1"],
          allowedTools: ["read"]
        }
      }
    }).mcpServers;
    const remote = new McpClientBroker(remoteConfig, testCredentials, process.cwd());
    await expect(remote.definitions()).rejects.toThrow(/private or special-use/);
    await remote.close();
  });
});
