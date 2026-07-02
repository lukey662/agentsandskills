import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

interface CliResult {
  stdout: string;
  exitCode: number;
}

function runCli(args: string[], cwd: string): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [tsxCli, cliEntry, ...args], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120_000
    });
    return { stdout, exitCode: 0 };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string };
    return { stdout: failure.stdout ?? "", exitCode: failure.status ?? 1 };
  }
}

describe("agent-kit CLI contract", () => {
  it("prints help with a zero exit code", () => {
    const result = runCli(["--help"], makeTempProject());
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("agent-kit");
    expect(result.stdout).toContain("init");
    expect(result.stdout).toContain("audit");
    expect(result.stdout).toContain("update");
  });

  it("init then audit --json returns the stable report shape", () => {
    const root = makeTempProject();
    const initResult = runCli(["init", "--stack", "next-supabase", "--json"], root);
    expect(initResult.exitCode).toBe(0);

    const initJson = JSON.parse(initResult.stdout) as Record<string, unknown>;
    expect(Object.keys(initJson).sort()).toEqual(["conflicts", "contextPath", "copied", "manifestPath", "overwritten", "unchanged"]);

    const auditResult = runCli(["audit", "--json"], root);
    expect(auditResult.exitCode).toBe(0);

    const report = JSON.parse(auditResult.stdout) as {
      summary: Record<string, number>;
      readiness: { level: string; summary: string; nextActions: string[] };
      findings: Array<{ level: string; area: string; message: string }>;
    };
    expect(Object.keys(report).sort()).toEqual(["findings", "readiness", "summary"]);
    expect(Object.keys(report.summary).sort()).toEqual(["fail", "pass", "warn"]);
    expect(report.summary.fail).toBe(0);
    expect(["needs-setup", "baseline-setup", "needs-improvement", "best-practice-candidate"]).toContain(report.readiness.level);
    expect(report.findings.length).toBeGreaterThan(0);
    for (const finding of report.findings.slice(0, 5)) {
      expect(["pass", "warn", "fail"]).toContain(finding.level);
      expect(typeof finding.area).toBe("string");
      expect(typeof finding.message).toBe("string");
    }
  });

  it("audit exits non-zero for an invalid --min-readiness value", () => {
    const root = makeTempProject();
    runCli(["init", "--no-setup"], root);
    const result = runCli(["audit", "--min-readiness", "not-a-level"], root);
    expect(result.exitCode).toBe(1);
  });

  it("audit exits non-zero when readiness is below the requested minimum", () => {
    const root = makeTempProject();
    runCli(["init", "--no-setup"], root);
    const result = runCli(["audit", "--min-readiness", "best-practice-candidate"], root);
    expect(result.exitCode).toBe(1);
  });

  it("update --dry-run reports per-file actions without writing", () => {
    const root = makeTempProject();
    runCli(["init", "--no-setup"], root);
    writeFileSync(join(root, "AGENTS.md"), "Locally customized.\n");

    const result = runCli(["update", "--dry-run", "--json"], root);
    expect(result.exitCode).toBe(0);

    const report = JSON.parse(result.stdout) as {
      dryRun: boolean;
      files: Array<{ target: string; action: string }>;
      summary: Record<string, number>;
    };
    expect(report.dryRun).toBe(true);
    const agentsFile = report.files.find((file) => file.target === "AGENTS.md");
    expect(agentsFile?.action).toBe("kept-local");
    expect(report.summary["kept-local"]).toBeGreaterThanOrEqual(1);
    expect(existsSync(join(root, ".agent-kit", "conflicts"))).toBe(true);
  });

  it("diff returns the documented preview shape", () => {
    const root = makeTempProject();
    runCli(["init", "--no-setup"], root);
    const result = runCli(["diff", "--json"], root);
    expect(result.exitCode).toBe(0);

    const diff = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(Object.keys(diff).sort()).toEqual(["agentRoster", "changed", "libraryFolders", "missing", "modelRouting", "preview", "unchanged"]);
  });

  it("doctor reports ok status", () => {
    const result = runCli(["doctor"], makeTempProject());
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("status: ok");
  });
});
