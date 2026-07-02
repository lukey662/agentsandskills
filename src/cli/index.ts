import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import type { AuditReadinessLevel } from "../config/types.js";
import { addSkill, listSkills } from "../install/add-skill.js";
import { validateAdapter, validatePackage, type AdapterValidationTarget, type ValidationReport } from "../install/adapter-validate.js";
import { READINESS_ORDER, createAuditReport, isAuditReadinessLevel, meetsMinimumReadiness } from "../install/audit.js";
import { diffProject } from "../install/diff.js";
import { initProject } from "../install/install.js";
import { updateProject } from "../install/update.js";
import { discoverRepos } from "../research/discover.js";
import { scanRepos } from "../research/scan.js";
import { proposeUpdates, summarizeFindings } from "../research/summarize.js";
import { addCorrection, applyCorrection, listCorrections, proposeCorrectionUpstream, retireCorrection } from "../studio/corrections.js";
import { initProjectContext, renderProjectContext, scanProjectContext, validateProjectContext } from "../studio/context.js";
import { exportStaticStudio } from "../studio/export.js";
import { getSetupProgress, onboardingStateExists } from "../studio/onboarding-state.js";
import { openBrowser } from "../studio/setup-browser.js";
import { promptStartSetup } from "../studio/setup-init.js";
import { startSetupServer } from "../studio/setup-server.js";
import { startStudioServer } from "../studio/studio-server.js";
import {
  closeSession,
  getActiveSessionId,
  listSessions,
  recordArtifact,
  recordCorrection,
  recordDecision,
  recordHandoff,
  recordNote,
  recordRequiredOutput,
  recordVerification,
  renderActiveSession,
  startSession
} from "../studio/session.js";
import { checkpointSessionFromFile } from "../studio/session-checkpoint.js";
import { readTextFile } from "../studio/shared.js";
import { PACKAGE_VERSION } from "../config/defaults.js";
import { detail, fail, fileGroup, heading, levelLabel, line, listItem, printJson, style } from "./output.js";

const program = new Command();
const requiredOutputStatuses = ["missing", "partial", "complete", "not-applicable"] as const;
type RequiredOutputStatus = (typeof requiredOutputStatuses)[number];

function isRequiredOutputStatus(value: string): value is RequiredOutputStatus {
  return requiredOutputStatuses.includes(value as RequiredOutputStatus);
}

program.name("agent-kit").description("Next.js + Supabase agent, skill, docs, design, and research kit.").version(PACKAGE_VERSION);

interface InitCommandOptions {
  stack: "next-supabase";
  force?: boolean;
  guided?: boolean;
  json?: boolean;
  dryRun?: boolean;
  activate?: string[];
  setup?: boolean;
  noSetup?: boolean;
  open?: boolean;
}

async function runGuidedContextPrompts(cwd: string): Promise<void> {
  // Interactive prompts only make sense on a TTY; CI and scripts get the scan-based fallback.
  if (!process.stdin.isTTY || !process.stdout.isTTY) return;

  const clack = await import("@clack/prompts");
  clack.intro("agent-kit guided setup");

  const questions = [
    { key: "productSummary", message: "What does this product do, in one concrete paragraph?" },
    { key: "primaryAudience", message: "Who is the primary user or buyer?" },
    { key: "authModel", message: "What authentication model should agents preserve?" },
    { key: "tenantModel", message: "Is this single-user, team, tenant, marketplace, admin, or public content?" }
  ] as const;

  const answers: Record<string, string> = {};
  for (const question of questions) {
    const answer = await clack.text({ message: question.message, placeholder: "Leave empty to answer later" });
    if (clack.isCancel(answer)) {
      clack.cancel("Guided setup cancelled. Context files were still created; answer later with agent-kit context ask.");
      return;
    }
    if (typeof answer === "string" && answer.trim()) answers[question.key] = answer.trim();
  }

  if (Object.keys(answers).length > 0) {
    const contextPath = join(cwd, ".agent-kit", "project-context.json");
    if (existsSync(contextPath)) {
      const context = JSON.parse(readFileSync(contextPath, "utf8")) as Record<string, unknown>;
      Object.assign(context, answers);
      writeFileSync(contextPath, `${JSON.stringify(context, null, 2)}\n`);
      renderProjectContext(cwd);
    }
  }

  clack.outro("Project context saved. Run agent-kit audit next.");
}

async function runSetupServer(options: { port: number; host: string; open?: boolean }): Promise<void> {
  const handle = await startSetupServer({
    cwd: process.cwd(),
    port: options.port,
    host: options.host
  });
  if (handle.portFallback) {
    console.warn(
      `Port ${handle.requestedPort} is in use — an old setup server may still be running. Kill it and restart to load the latest Agent Office.`
    );
    console.warn(`Using fallback port ${handle.port} instead.`);
  }
  console.log(`Agent Kit v${PACKAGE_VERSION} — ${handle.defaultView} view at ${handle.url}/`);
  console.log(`Pixel office (default): ${handle.url}/  |  Form fallback: ${handle.url}/wizard`);
  console.log("Pick Quick, Standard, or Complete on first visit. Press Ctrl+C to stop.");
  if (options.open) openBrowser(`${handle.url}/`);
  await new Promise<void>((resolve) => {
    const shutdown = () => {
      handle.close().finally(resolve);
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}

program
  .command("init")
  .description("Install agent-kit docs and library files into a project.")
  .option("--stack <stack>", "Stack profile to install.", "next-supabase")
  .option("--force", "Overwrite existing docs instead of writing conflicts.")
  .option("--activate <targets...>", "Promote IDE/runtime adapters: cursor, claude, codex, copilot, antigravity, or all.")
  .option("--guided", "Also create local project context files (interactive on a terminal, scan-based otherwise).")
  .option("--dry-run", "Preview what init would create or conflict on without writing files.")
  .option("--json", "Print machine-readable JSON output.")
  .option("--setup", "Start the setup wizard after install.")
  .option("--no-setup", "Skip the post-install setup wizard prompt.")
  .option("--open", "Open the setup wizard in your default browser.")
  .action(async (options: InitCommandOptions) => {
    const cwd = process.cwd();

    if (options.dryRun) {
      const preview = diffProject(cwd, options.stack);
      if (options.json) {
        printJson({ dryRun: true, preview: preview.preview, missing: preview.missing, changed: preview.changed, unchanged: preview.unchanged });
        return;
      }
      heading("agent-kit init --dry-run");
      fileGroup("Would create", preview.preview.wouldCreate);
      fileGroup("Would write conflicts for", preview.preview.wouldWriteConflicts);
      fileGroup("Already up to date", preview.unchanged);
      line();
      line(`Run ${style.bold("agent-kit init")} to apply.`);
      return;
    }

    const result = initProject({
      cwd,
      stack: options.stack,
      force: Boolean(options.force),
      ...(options.activate ? { activate: options.activate } : {})
    });
    const context = options.guided ? initProjectContext(cwd) : null;

    if (options.json) {
      printJson(context ? { install: result, context } : result);
    } else {
      heading(`agent-kit ${PACKAGE_VERSION} installed (stack: ${options.stack})`);
      fileGroup("Created", result.copied);
      fileGroup("Unchanged", result.unchanged);
      fileGroup("Overwritten", result.overwritten);
      if (result.conflicts.length > 0) {
        fileGroup("Conflicts (local file kept, template saved for review)", result.conflicts);
        detail("Review .agent-kit/conflicts/ before adopting template changes.");
      }
      line();
      line(`Manifest: ${result.manifestPath}`);
    }

    if (options.guided && context) {
      if (!options.json) {
        line();
        heading("Project context");
        line(`Context: ${context.contextPath}`);
        if (context.openQuestions.length > 0) {
          line("Open questions:");
          for (const question of context.openQuestions) listItem(question);
        }
      }
      await runGuidedContextPrompts(cwd);
    }

    if (!options.json) {
      line();
      line(`Next: run ${style.bold("agent-kit audit")} to check readiness.`);
    }

    const shouldPrompt = !options.noSetup && !options.json;
    const startWizard = Boolean(options.setup) || (shouldPrompt && (await promptStartSetup(true)));
    if (startWizard) {
      await runSetupServer({ port: 9321, host: "127.0.0.1", open: Boolean(options.open) });
    }
  });

program
  .command("audit")
  .description("Audit an existing project for agent-kit coverage gaps.")
  .option("--json", "Print machine-readable JSON output.")
  .option("--min-readiness <level>", `Exit non-zero unless readiness is at least this level: ${READINESS_ORDER.join(", ")}.`)
  .action((options: { json?: boolean; minReadiness?: string }) => {
    const report = createAuditReport(process.cwd());
    let minimumReadiness: AuditReadinessLevel | undefined;
    if (options.minReadiness) {
      if (!isAuditReadinessLevel(options.minReadiness)) {
        fail(`Invalid --min-readiness value "${options.minReadiness}". Expected one of: ${READINESS_ORDER.join(", ")}.`);
        process.exitCode = 1;
        return;
      }
      minimumReadiness = options.minReadiness;
    }

    if (options.json) {
      printJson(report);
    } else {
      const readinessStyle = report.summary.fail > 0 ? style.fail : report.summary.warn > 0 ? style.warn : style.pass;
      line(`${style.bold("READINESS")} ${readinessStyle(report.readiness.level)}: ${report.readiness.summary}`);
      line(`${style.bold("SUMMARY")} pass=${report.summary.pass} warn=${report.summary.warn} fail=${report.summary.fail}`);
      if (report.readiness.nextActions.length > 0) {
        line(style.bold("NEXT ACTIONS"));
        for (const action of report.readiness.nextActions) listItem(action);
      }
      line();
      for (const finding of report.findings) {
        line(`${levelLabel(finding.level)} ${finding.area}: ${finding.message}`);
        if (finding.remediation) detail(`remediation: ${finding.remediation}`);
      }
    }

    if (report.summary.fail > 0) {
      process.exitCode = 1;
    }
    if (minimumReadiness && !meetsMinimumReadiness(report.readiness.level, minimumReadiness)) {
      console.error(`Audit readiness ${report.readiness.level} is below required minimum ${minimumReadiness}.`);
      process.exitCode = 1;
    }
  });

program
  .command("diff")
  .description("Compare project docs against bundled templates.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const result = diffProject(process.cwd());
    if (options.json) {
      printJson(result);
      return;
    }
    heading("agent-kit diff");
    fileGroup("Missing (update would create)", result.missing);
    fileGroup("Changed locally (update would write conflicts)", result.changed);
    fileGroup("Unchanged", result.unchanged);
    line();
    line(`Agent roster: ${result.agentRoster}`);
    line(`Model routing: ${result.modelRouting}`);
    if (result.libraryFolders.missing.length > 0) {
      line(`Missing library folders: ${result.libraryFolders.missing.join(", ")}`);
    }
    line();
    line(`Next: run ${style.bold("agent-kit update --dry-run")} to preview the exact per-file plan.`);
  });

program
  .command("update")
  .description("Update installed templates: pristine docs are refreshed, local edits are preserved, and template conflicts are written for review.")
  .option("--force", "Overwrite locally customized docs with the current templates.")
  .option("--dry-run", "Report what would change without writing any files.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { force?: boolean; dryRun?: boolean; json?: boolean }) => {
    const result = updateProject({ cwd: process.cwd(), force: Boolean(options.force), dryRun: Boolean(options.dryRun) });
    if (options.json) {
      printJson(result);
      return;
    }

    heading(result.dryRun ? "agent-kit update --dry-run" : "agent-kit update");
    const byAction = (action: string) => result.files.filter((file) => file.action === action).map((file) => file.target);
    fileGroup(result.dryRun ? "Would create" : "Created", byAction("created"));
    fileGroup(result.dryRun ? "Would update (pristine)" : "Updated (pristine)", byAction("updated"));
    fileGroup("Kept local customizations", byAction("kept-local"));
    fileGroup(result.dryRun ? "Would overwrite" : "Overwritten", byAction("overwritten"));
    const conflicts = result.files.filter((file) => file.action === "conflict");
    if (conflicts.length > 0) {
      line(`${style.bold("Conflicts")} (${conflicts.length})`);
      for (const file of conflicts) {
        line(`  ${file.target}${file.conflictPath ? ` -> ${file.conflictPath}` : ""}`);
      }
      detail("Local files were kept. Review the conflict copies before adopting template changes.");
    }
    detail(`unchanged: ${result.summary.unchanged} file(s) already match the current templates`);
    if (!result.dryRun) {
      line();
      line(`Library folders refreshed: ${result.libraryFoldersRefreshed.length}`);
      line(`Manifest: ${result.manifestPath}`);
    }
  });

const addCommand = program.command("add").description("Add one agent-kit asset.");
addCommand
  .command("skill <name>")
  .description("Add a single skill into .agent-kit/skills.")
  .option("--force", "Overwrite existing skill.")
  .option("--dry-run", "Report what would happen without writing.")
  .option("--json", "Print machine-readable JSON output.")
  .action((name: string, options: { force?: boolean; dryRun?: boolean; json?: boolean }) => {
    const result = addSkill(process.cwd(), name, { force: Boolean(options.force), dryRun: Boolean(options.dryRun) });
    if (options.json) {
      printJson(result);
      return;
    }
    line(`${result.action}: ${result.target}${result.conflictPath ? ` -> ${result.conflictPath}` : ""}`);
    if (options.dryRun) detail("dry run: no files were written");
  });

program
  .command("doctor")
  .description("Validate local CLI runtime prerequisites.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const cwd = process.cwd();
    const report = {
      version: PACKAGE_VERSION,
      node: process.version,
      availableSkills: listSkills().length,
      setupProgress: onboardingStateExists(cwd) ? getSetupProgress(cwd) : null,
      status: "ok" as const
    };
    if (options.json) {
      printJson(report);
      return;
    }
    heading("agent-kit doctor");
    line(`version: ${report.version}`);
    line(`node: ${report.node}`);
    line(`available skills: ${report.availableSkills}`);
    if (report.setupProgress) {
      line(`setup progress: ${report.setupProgress.percent}% (depth: ${report.setupProgress.depth})`);
      if (!report.setupProgress.quickComplete) {
        detail("run agent-kit setup --open to finish project context onboarding.");
      }
    } else {
      detail("run agent-kit init then agent-kit setup to onboard this project.");
    }
    line(`status: ${style.pass(report.status)}`);
  });

function printValidationReport(report: ValidationReport, json?: boolean): void {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`SUMMARY pass=${report.summary.pass} warn=${report.summary.warn} fail=${report.summary.fail}`);
  for (const finding of report.findings) {
    const prefix = finding.level.toUpperCase().padEnd(4);
    console.log(`${prefix} ${finding.area}: ${finding.message}`);
    if (finding.remediation) console.log(`     remediation: ${finding.remediation}`);
  }
}

const adapter = program.command("adapter").description("Validate runtime and IDE adapter assets.");

adapter
  .command("validate [target]")
  .description("Validate adapter assets. Targets: antigravity, cursor, claude, codex, copilot, all.")
  .option("--json", "Print machine-readable JSON output.")
  .action((target: AdapterValidationTarget | undefined, options: { json?: boolean }) => {
    const selected = target ?? "antigravity";
    const allowed = new Set(["antigravity", "cursor", "claude", "codex", "copilot", "all"]);
    if (!allowed.has(selected)) {
      console.error(`Invalid adapter target "${selected}". Expected one of: ${[...allowed].join(", ")}.`);
      process.exitCode = 1;
      return;
    }
    const report = validateAdapter(process.cwd(), selected);
    printValidationReport(report, Boolean(options.json));
    if (report.summary.fail > 0) process.exitCode = 1;
  });

const packageCommand = program.command("package").description("Validate package-source release assets.");

packageCommand
  .command("validate")
  .description("Validate package assets, runtime adapters, docs, examples, and source audit behavior.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const report = validatePackage(process.cwd());
    printValidationReport(report, Boolean(options.json));
    if (report.summary.fail > 0) process.exitCode = 1;
  });

program
  .command("onboard")
  .description("Create or refresh local project context files for installed agents.")
  .option("--refresh", "Refresh inferred context from the current project state.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const result = initProjectContext(process.cwd());
    if (options.json) {
      printJson(result);
      return;
    }
    heading("agent-kit onboard");
    line(`Context: ${result.contextPath}`);
    line(`Markdown: ${result.markdownPath}`);
    if (result.openQuestions.length > 0) {
      line("Open questions:");
      for (const question of result.openQuestions) listItem(question);
    }
  });

program
  .command("setup")
  .description("Start the local Agent Office setup view for project context.")
  .option("--port <number>", "Port to listen on.", (value) => Number.parseInt(value, 10), 9321)
  .option("--host <host>", "Host to bind.", "127.0.0.1")
  .option("--open", "Open the wizard in your default browser.")
  .option("--status", "Print setup progress and exit.")
  .action(async (options: { port: number; host: string; open?: boolean; status?: boolean }) => {
    const cwd = process.cwd();
    if (options.status) {
      const progress = getSetupProgress(cwd);
      console.log(JSON.stringify(progress, null, 2));
      process.exitCode = progress.quickComplete ? 0 : 1;
      return;
    }
    await runSetupServer({ port: options.port, host: options.host, open: Boolean(options.open) });
  });

const context = program.command("context").description("Manage local project context for Agent Studio.");

context
  .command("init")
  .description("Create project context from a local scan.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const result = initProjectContext(process.cwd());
    if (options.json) {
      printJson(result);
      return;
    }
    line(`Context written: ${result.contextPath}`);
    if (result.openQuestions.length > 0) {
      line("Open questions:");
      for (const question of result.openQuestions) listItem(question);
    }
  });

context
  .command("scan")
  .description("Print inferred project context without writing it.")
  .action(() => {
    printJson(scanProjectContext(process.cwd()));
  });

context
  .command("ask")
  .description("Print unanswered high-value project context questions.")
  .action(() => {
    const result = initProjectContext(process.cwd());
    if (result.openQuestions.length === 0) {
      line("No open project-context questions.");
      return;
    }
    line("Answer these in the web setup wizard with: agent-kit setup --open");
    detail("Check progress with: agent-kit setup --status");
    for (const question of result.openQuestions) listItem(question);
  });

context
  .command("render")
  .description("Render .agent-kit/project-context.md from project-context.json.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const result = renderProjectContext(process.cwd());
    if (options.json) {
      printJson(result);
      return;
    }
    line(`Rendered: ${result.markdownPath}`);
  });

context
  .command("validate")
  .description("Validate .agent-kit/project-context.json.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const result = validateProjectContext(process.cwd());
    if (options.json) {
      printJson(result);
      return;
    }
    line(`Valid: ${result.contextPath}`);
    if (result.openQuestions.length > 0) {
      line("Open questions:");
      for (const question of result.openQuestions) listItem(question);
    }
  });

context
  .command("show")
  .description("Print rendered project context markdown.")
  .action(() => {
    console.log(readTextFile(process.cwd(), ".agent-kit/project-context.md") ?? "");
  });

const session = program.command("session").description("Record and render local Agent Studio council sessions.");

session
  .command("start <title...>")
  .description("Start a local council session.")
  .option("--workflow <workflow>", "Workflow id.", "planning")
  .option("--request <request>", "Original user request.")
  .option("--json", "Print machine-readable JSON output.")
  .action((titleParts: string[], options: { workflow: string; request?: string; json?: boolean }) => {
    const title = titleParts.join(" ");
    const result = startSession(process.cwd(), {
      title,
      workflowId: options.workflow,
      ...(options.request ? { request: options.request } : {})
    });
    if (options.json) {
      printJson(result);
      return;
    }
    line(`Session started: ${result.sessionId}`);
    line(`Path: ${result.sessionPath}`);
  });

session
  .command("list")
  .description("List local council sessions.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const sessions = listSessions(process.cwd());
    if (options.json) {
      printJson(sessions);
      return;
    }
    if (sessions.length === 0) {
      line("No sessions yet. Start one with agent-kit session start <title>.");
      return;
    }
    for (const item of sessions) {
      line(`${item.sessionId} [${item.status}] ${item.title}`);
    }
  });

session
  .command("active")
  .description("Print the active council session id.")
  .action(() => {
    console.log(getActiveSessionId(process.cwd()));
  });

session
  .command("note <text...>")
  .description("Record a visible agent message.")
  .requiredOption("--agent <agent>", "Agent id.")
  .option("--json", "Print machine-readable JSON output.")
  .action((textParts: string[], options: { agent: string; json?: boolean }) => {
    const result = recordNote(process.cwd(), options.agent, textParts.join(" "));
    if (options.json) printJson(result);
    else line(`Recorded note from ${options.agent}.`);
  });

session
  .command("decision <text...>")
  .description("Record an agent decision.")
  .requiredOption("--agent <agent>", "Agent id.")
  .option("--risk <risk>", "Risk associated with the decision.")
  .option("--json", "Print machine-readable JSON output.")
  .action((textParts: string[], options: { agent: string; risk?: string; json?: boolean }) => {
    const result = recordDecision(process.cwd(), options.agent, textParts.join(" "), options.risk);
    if (options.json) printJson(result);
    else line(`Recorded decision from ${options.agent}.`);
  });

session
  .command("handoff")
  .description("Record an agent handoff.")
  .requiredOption("--from <agent>", "Source agent id.")
  .requiredOption("--to <agent>", "Target agent id.")
  .requiredOption("--decision <decision>", "Decision being handed off.")
  .requiredOption("--risk <risk>", "Risk that remains.")
  .option("--evidence <evidence...>", "Evidence paths or notes.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { from: string; to: string; decision: string; risk: string; evidence?: string[]; json?: boolean }) => {
    const result = recordHandoff(process.cwd(), {
      fromAgentId: options.from,
      toAgentId: options.to,
      decision: options.decision,
      risk: options.risk,
      ...(options.evidence ? { evidence: options.evidence } : {})
    });
    if (options.json) printJson(result);
    else line(`Recorded handoff ${options.from} -> ${options.to}.`);
  });

session
  .command("correct <text...>")
  .description("Record a human correction and optionally promote it to durable rules.")
  .option("--agent <agent>", "Agent id.")
  .option("--scope <scope>", "Correction scope: session, project, agent, upstream-proposal.", "session")
  .option("--json", "Print machine-readable JSON output.")
  .action((textParts: string[], options: { agent?: string; scope: "session" | "project" | "agent" | "upstream-proposal"; json?: boolean }) => {
    const result = recordCorrection(process.cwd(), {
      ...(options.agent ? { agentId: options.agent } : {}),
      scope: options.scope,
      text: textParts.join(" ")
    });
    if (options.json) printJson(result);
    else line(`Recorded ${options.scope}-scoped correction.`);
  });

session
  .command("artifact")
  .description("Record a changed or relevant artifact path.")
  .requiredOption("--file <file>", "Artifact file path.")
  .option("--note <note>", "Artifact note.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { file: string; note?: string; json?: boolean }) => {
    const result = recordArtifact(process.cwd(), options.file, options.note);
    if (options.json) printJson(result);
    else line(`Recorded artifact ${options.file}.`);
  });

session
  .command("verify")
  .description("Record verification evidence.")
  .requiredOption("--command <command>", "Command or review performed.")
  .requiredOption("--result <result>", "pass, fail, or skipped.")
  .option("--notes <notes>", "Verification notes.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { command: string; result: "pass" | "fail" | "skipped"; notes?: string; json?: boolean }) => {
    const result = recordVerification(process.cwd(), options.command, options.result, options.notes);
    if (options.json) printJson(result);
    else line(`Recorded verification (${options.result}): ${options.command}`);
  });

session
  .command("output <name...>")
  .description("Mark a required session output status.")
  .requiredOption("--status <status>", "missing, partial, complete, or not-applicable.")
  .option("--evidence <evidence>", "Evidence path, command, or note.")
  .option("--json", "Print machine-readable JSON output.")
  .action((nameParts: string[], options: { status: string; evidence?: string; json?: boolean }) => {
    if (!isRequiredOutputStatus(options.status)) {
      fail(`Invalid --status value "${options.status}". Expected one of: ${requiredOutputStatuses.join(", ")}.`);
      process.exitCode = 1;
      return;
    }
    const result = recordRequiredOutput(process.cwd(), nameParts.join(" "), options.status, options.evidence);
    if (options.json) printJson(result);
    else line(`Marked "${nameParts.join(" ")}" as ${options.status}.`);
  });

session
  .command("render")
  .description("Render active session Markdown files.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const result = renderActiveSession(process.cwd());
    if (options.json) printJson(result);
    else line(`Rendered session ${result.sessionId} at ${result.sessionPath}.`);
  });

session
  .command("checkpoint")
  .description("Apply a batch of session events from a JSON or Markdown checkpoint file.")
  .requiredOption("--file <file>", "Checkpoint file (.json or .md) relative to the project root.")
  .action((options: { file: string }) => {
    console.log(JSON.stringify(checkpointSessionFromFile(process.cwd(), options.file), null, 2));
  });

session
  .command("close")
  .description("Close the active session.")
  .option("--status <status>", "planned, in-progress, blocked, or complete.", "complete")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { status: "planned" | "in-progress" | "blocked" | "complete"; json?: boolean }) => {
    const result = closeSession(process.cwd(), options.status);
    if (options.json) printJson(result);
    else line(`Closed session ${result.sessionId} with status ${options.status}.`);
  });

const correction = program.command("correction").description("Manage durable Agent Studio correction rules.");

correction
  .command("list")
  .description("List correction rules.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const corrections = listCorrections(process.cwd());
    if (options.json) {
      printJson(corrections);
      return;
    }
    const rules = [...corrections.project, ...corrections.agent, ...corrections.upstream];
    if (rules.length === 0) {
      line("No correction rules yet. Add one with agent-kit correction add <text>.");
      return;
    }
    for (const rule of rules) {
      line(`${rule.id} [${rule.status}] (${rule.scope}) ${rule.text}`);
    }
  });

correction
  .command("add <text...>")
  .description("Add a durable correction rule.")
  .option("--scope <scope>", "Correction scope: project, agent, or upstream-proposal.", "project")
  .option("--agent <agent>", "Agent id for agent-scoped corrections.")
  .option("--json", "Print machine-readable JSON output.")
  .action((textParts: string[], options: { scope: "project" | "agent" | "upstream-proposal"; agent?: string; json?: boolean }) => {
    const result = addCorrection(process.cwd(), {
      scope: options.scope,
      ...(options.agent ? { agentId: options.agent } : {}),
      text: textParts.join(" ")
    });
    if (options.json) printJson(result);
    else line(`Added ${options.scope}-scoped correction ${result.id}.`);
  });

correction
  .command("apply [id]")
  .description("Mark a correction rule active and reviewed.")
  .option("--id <id>", "Correction id.")
  .option("--json", "Print machine-readable JSON output.")
  .action((idArgument: string | undefined, options: { id?: string; json?: boolean }) => {
    const id = idArgument ?? options.id;
    if (!id) {
      fail("Missing correction id. Use agent-kit correction apply <id> or --id <id>.");
      process.exitCode = 1;
      return;
    }
    const result = applyCorrection(process.cwd(), id);
    if (options.json) printJson(result);
    else line(`Applied correction ${id}.`);
  });

correction
  .command("retire <id>")
  .description("Retire a correction rule.")
  .requiredOption("--reason <reason>", "Reason for retirement.")
  .option("--json", "Print machine-readable JSON output.")
  .action((id: string, options: { reason: string; json?: boolean }) => {
    const result = retireCorrection(process.cwd(), id, options.reason);
    if (options.json) printJson(result);
    else line(`Retired correction ${id}: ${options.reason}`);
  });

correction
  .command("propose-upstream <id>")
  .description("Create an upstream proposal from a project or agent correction.")
  .option("--json", "Print machine-readable JSON output.")
  .action((id: string, options: { json?: boolean }) => {
    const result = proposeCorrectionUpstream(process.cwd(), id);
    if (options.json) printJson(result);
    else line(`Created upstream proposal from correction ${id}.`);
  });

const studio = program.command("studio").description("Export and serve local Agent Studio views.");

async function runStudioServer(options: { port: number; host: string; open?: boolean }): Promise<void> {
  const handle = await startStudioServer({
    cwd: process.cwd(),
    port: options.port,
    host: options.host
  });
  if (handle.portFallback) {
    console.warn(
      `Port ${handle.requestedPort} is in use — using fallback port ${handle.port}. Kill the old process to avoid confusion.`
    );
  }
  console.log(`Agent Kit v${PACKAGE_VERSION} — live studio at ${handle.url}/`);
  console.log("SSE: GET /api/events/stream  |  Press Ctrl+C to stop.");
  if (options.open) openBrowser(`${handle.url}/`);
  await new Promise<void>((resolve) => {
    const shutdown = () => {
      handle.close().finally(resolve);
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}

studio
  .command("serve")
  .description("Start localhost live Agent Studio viewer with SSE session events.")
  .option("--port <number>", "Port to listen on.", (value) => Number.parseInt(value, 10), 9331)
  .option("--host <host>", "Host to bind.", "127.0.0.1")
  .option("--open", "Open the studio in your default browser.")
  .action(async (options: { port: number; host: string; open?: boolean }) => {
    await runStudioServer(options);
  });

studio
  .command("export")
  .description("Generate a self-contained static Agent Studio HTML file.")
  .option("--json", "Print machine-readable JSON output.")
  .action((options: { json?: boolean }) => {
    const result = exportStaticStudio(process.cwd());
    if (options.json) {
      printJson(result);
      return;
    }
    line(`Exported ${result.sessionCount} session(s) to ${result.studioPath}.`);
  });

const research = program.command("research").description("Research high-quality open-source repositories.");

research
  .command("discover")
  .description("Discover GitHub repo candidates using configured queries.")
  .option("--limit <number>", "Maximum repositories to write.", (value) => Number.parseInt(value, 10))
  .action(async (options: { limit?: number }) => {
    const repos = await discoverRepos({
      cwd: process.cwd(),
      ...(options.limit === undefined ? {} : { limit: options.limit })
    });
    console.log(`Wrote ${repos.length} candidates to research/repo-candidates.json`);
  });

research
  .command("scan")
  .description("Shallow clone candidate repos and write repo findings.")
  .option("--keep-clones", "Keep cloned repositories in research/workdir.")
  .action(async (options: { keepClones?: boolean }) => {
    const findings = await scanRepos({ cwd: process.cwd(), keepClones: Boolean(options.keepClones) });
    console.log(`Wrote ${findings.length} findings to research/findings`);
  });

research
  .command("summarize")
  .description("Generate category summaries from repo findings.")
  .action(() => {
    const outputs = summarizeFindings(process.cwd());
    for (const output of outputs) console.log(output);
  });

research
  .command("propose-updates")
  .description("Create a research-to-template update brief.")
  .action(() => {
    console.log(proposeUpdates(process.cwd()));
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
