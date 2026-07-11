import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { RuntimeConfig } from "../config.js";

export interface SandboxCommand {
  argv: string[];
  cwd?: string;
  networkApproved?: boolean;
  timeoutMs?: number;
  environment?: Record<string, string>;
  signal?: AbortSignal;
}

export interface SandboxResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  imageId: string;
  durationMs: number;
}

export interface SandboxProcessRunner {
  (command: string, args: string[], options: { cwd?: string; timeoutMs: number; maxOutputBytes?: number; signal?: AbortSignal }): Promise<SandboxResult>;
}

export const runSandboxProcess: SandboxProcessRunner = (command, args, options) => {
  return new Promise((resolve, reject) => {
    options.signal?.throwIfAborted();
    const started = Date.now();
    const child = spawn(command, args, {
      ...(options.cwd ? { cwd: options.cwd } : {}),
      env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "" },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let outputBytes = 0;
    let failure: Error | undefined;
    let settled = false;
    let forceKill: NodeJS.Timeout | undefined;
    const maxOutput = options.maxOutputBytes ?? 1_000_000;
    const stop = (error: Error, graceful: boolean) => {
      if (failure || settled) return;
      failure = error;
      child.kill(graceful ? "SIGINT" : "SIGKILL");
      if (graceful) forceKill = setTimeout(() => child.kill("SIGKILL"), 2_000);
    };
    const collect = (target: Buffer[], chunk: Buffer) => {
      outputBytes += chunk.length;
      if (outputBytes > maxOutput) {
        stop(new Error(`Sandbox output exceeded ${maxOutput} bytes.`), false);
        return;
      }
      target.push(chunk);
    };
    child.stdout.on("data", (chunk: Buffer) => collect(stdout, chunk));
    child.stderr.on("data", (chunk: Buffer) => collect(stderr, chunk));
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
      options.signal?.removeEventListener("abort", abort);
      reject(error);
    });
    const abort = () => {
      const reason = options.signal?.reason;
      stop(reason instanceof Error ? reason : new Error(String(reason ?? "Sandbox command cancelled.")), true);
    };
    options.signal?.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(() => {
      stop(new Error(`Sandbox command timed out after ${options.timeoutMs}ms.`), false);
    }, options.timeoutMs);
    child.once("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
      options.signal?.removeEventListener("abort", abort);
      if (failure) {
        reject(failure);
        return;
      }
      resolve({
        exitCode: code ?? 1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
        imageId: "",
        durationMs: Date.now() - started
      });
    });
  });
};

export class DockerSandbox {
  private imageId: string | undefined;

  constructor(
    private readonly config: RuntimeConfig["sandbox"],
    private readonly worktreePath: string,
    private readonly runner: SandboxProcessRunner = runSandboxProcess
  ) {}

  async probe(): Promise<{ available: boolean; imageId?: string; error?: string }> {
    try {
      const imageId = await this.resolveImageId();
      return { available: true, imageId };
    } catch (error) {
      return { available: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async run(command: SandboxCommand): Promise<SandboxResult> {
    if (this.config.provider !== "docker") throw new Error("Mutation-capable commands require the Docker sandbox provider.");
    if (command.argv.length === 0 || !command.argv[0]) throw new Error("Sandbox command argv is required.");
    if (command.networkApproved && this.config.network !== "approved") {
      throw new Error("Network execution is disabled by the runtime sandbox policy.");
    }
    command.signal?.throwIfAborted();
    const imageId = await this.resolveImageId(command.signal);
    const containerName = `agent-kit-${randomUUID().slice(0, 12)}`;
    const relativeCwd = (command.cwd ?? ".").replace(/^\/+/, "");
    if (relativeCwd.split(/[\\/]/).includes("..")) throw new Error("Sandbox cwd must stay inside the worktree.");
    const args = [
      "run",
      "--rm",
      "--name",
      containerName,
      "--init",
      "--read-only",
      "--cap-drop=ALL",
      "--security-opt=no-new-privileges",
      `--network=${command.networkApproved ? "bridge" : "none"}`,
      `--memory=${this.config.memoryMb}m`,
      `--cpus=${this.config.cpus}`,
      "--pids-limit=256",
      "--tmpfs=/tmp:rw,noexec,nosuid,size=256m",
      "--tmpfs=/home/agent:rw,noexec,nosuid,size=64m",
      "--mount",
      `type=bind,source=${this.worktreePath},target=/workspace`,
      "--workdir",
      `/workspace/${relativeCwd === "." ? "" : relativeCwd}`.replace(/\/$/, ""),
      "--env",
      "HOME=/home/agent",
      ...Object.entries(command.environment ?? {}).flatMap(([key, value]) => {
        if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) throw new Error(`Invalid sandbox environment key: ${key}`);
        return ["--env", `${key}=${value}`];
      }),
      imageId,
      ...command.argv
    ];
    const result = await this.runner("docker", args, {
      timeoutMs: command.timeoutMs ?? this.config.timeoutMs,
      ...(command.signal ? { signal: command.signal } : {})
    });
    return { ...result, imageId };
  }

  private async resolveImageId(signal?: AbortSignal): Promise<string> {
    if (this.imageId) return this.imageId;
    const result = await this.runner("docker", ["image", "inspect", "--format", "{{.Id}}", this.config.image], {
      timeoutMs: 15_000,
      maxOutputBytes: 20_000,
      ...(signal ? { signal } : {})
    });
    const imageId = result.stdout.trim();
    if (result.exitCode !== 0 || !/^sha256:[a-f0-9]{64}$/i.test(imageId)) {
      throw new Error(`Docker image ${this.config.image} is not available locally. Pull and review it explicitly before mutation-capable runs.`);
    }
    this.imageId = imageId;
    return imageId;
  }
}
