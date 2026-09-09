import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = join(__dirname, "..");
const tsxCli = join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const cliEntry = join(repoRoot, "src", "cli", "index.ts");

let tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
  tempRoots = [];
});

function makeTempProject(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-cli-"));
  tempRoots.push(root);
  return root;
}

function runCli(args: string[], cwd: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execFileSync(process.execPath, [tsxCli, cliEntry, ...args], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60_000
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string | Buffer; stderr?: string | Buffer };
    return {
      stdout: String(failure.stdout ?? ""),
      stderr: String(failure.stderr ?? ""),
      exitCode: failure.status ?? 1
    };
  }
}

describe("agent-kit CLI", () => {
  it("prints help for the slim command set", () => {
    const result = runCli(["--help"], makeTempProject());
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("init");
    expect(result.stdout).toContain("doctor");
    expect(result.stdout).toContain("guide");
    expect(result.stdout).toContain("update");
    expect(result.stdout).not.toContain("orchestrate");
    expect(result.stdout).not.toMatch(/^\s+audit\b/m);
  });

  it("init writes agents, skills, and the user guide", () => {
    const root = makeTempProject();
    const result = runCli(["init", "--activate", "all", "--json"], root);
    expect(result.exitCode).toBe(0);
    expect(existsSync(join(root, "AGENTS.md"))).toBe(true);
    expect(existsSync(join(root, "USER_GUIDE.md"))).toBe(true);
    expect(existsSync(join(root, "USER_GUIDE.html"))).toBe(true);
    expect(existsSync(join(root, ".cursor/agents/qa.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/skills/browser-qa/SKILL.md"))).toBe(true);
    expect(readFileSync(join(root, "USER_GUIDE.md"), "utf8")).toContain("Do not review code alone");
  });

  it("doctor passes after init", () => {
    const root = makeTempProject();
    runCli(["init", "--activate", "cursor"], root);
    const result = runCli(["doctor", "--json"], root);
    expect(result.exitCode).toBe(0);
    const report = JSON.parse(result.stdout) as { ok: boolean };
    expect(report.ok).toBe(true);
  });

  it("guide prints the installed USER_GUIDE.html path", () => {
    const root = makeTempProject();
    runCli(["init", "--activate", "cursor"], root);
    const result = runCli(["guide", "--json"], root);
    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout) as { path: string; source: string };
    expect(payload.source).toBe("cwd");
    expect(payload.path).toContain("USER_GUIDE.html");
    expect(existsSync(payload.path)).toBe(true);
  });

  it("rejects unknown --activate targets", () => {
    const root = makeTempProject();
    const result = runCli(["init", "--activate", "not-an-ide"], root);
    expect(result.exitCode).not.toBe(0);
    expect(result.stdout + result.stderr).toMatch(/Unknown --activate target/i);
  });
});
