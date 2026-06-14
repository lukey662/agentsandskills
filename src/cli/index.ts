import { Command } from "commander";
import type { AuditReadinessLevel } from "../config/types.js";
import { addSkill, listSkills } from "../install/add-skill.js";
import { validateAdapter, validatePackage, type AdapterValidationTarget, type ValidationReport } from "../install/adapter-validate.js";
import { READINESS_ORDER, createAuditReport, isAuditReadinessLevel, meetsMinimumReadiness } from "../install/audit.js";
import { diffProject } from "../install/diff.js";
import { initProject } from "../install/install.js";
import { discoverRepos } from "../research/discover.js";
import { scanRepos } from "../research/scan.js";
import { proposeUpdates, summarizeFindings } from "../research/summarize.js";
import { addCorrection, applyCorrection, listCorrections, proposeCorrectionUpstream, retireCorrection } from "../studio/corrections.js";
import { initProjectContext, renderProjectContext, scanProjectContext, validateProjectContext } from "../studio/context.js";
import { exportStaticStudio } from "../studio/export.js";
import { getSetupProgress, onboardingStateExists } from "../studio/onboarding-state.js";
import { openBrowser } from "../studio/setup-browser.js";
import { formatInitSummary, promptStartSetup } from "../studio/setup-init.js";
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

const program = new Command();
const requiredOutputStatuses = ["missing", "partial", "complete", "not-applicable"] as const;
type RequiredOutputStatus = (typeof requiredOutputStatuses)[number];

function isRequiredOutputStatus(value: string): value is RequiredOutputStatus {
  return requiredOutputStatuses.includes(value as RequiredOutputStatus);
}

program
  .name("agent-kit")
  .description("Next.js + Supabase agent, skill, docs, design, and research kit.")
  .version(PACKAGE_VERSION);

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
  .option("--guided", "Deprecated alias for default project context scan (always runs on init).")
  .option("--json", "Print machine-readable JSON output.")
  .option("--setup", "Start the setup wizard after install.")
  .option("--no-setup", "Skip the post-install setup wizard prompt.")
  .option("--open", "Open the setup wizard in your default browser.")
  .action(async (options: {
    stack: "next-supabase";
    force?: boolean;
    guided?: boolean;
    activate?: string[];
    json?: boolean;
    setup?: boolean;
    noSetup?: boolean;
    open?: boolean;
  }) => {
    const cwd = process.cwd();
    const result = initProject({
      cwd,
      stack: options.stack,
      force: Boolean(options.force),
      ...(options.activate ? { activate: options.activate } : {})
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatInitSummary(result));
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
        console.error(`Invalid --min-readiness value "${options.minReadiness}". Expected one of: ${READINESS_ORDER.join(", ")}.`);
        process.exitCode = 1;
        return;
      }
      minimumReadiness = options.minReadiness;
    }

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`READINESS ${report.readiness.level}: ${report.readiness.summary}`);
      console.log(`SUMMARY pass=${report.summary.pass} warn=${report.summary.warn} fail=${report.summary.fail}`);
      if (report.readiness.nextActions.length > 0) {
        console.log("NEXT ACTIONS");
        for (const action of report.readiness.nextActions) console.log(`- ${action}`);
      }
      console.log("");
      for (const finding of report.findings) {
        const prefix = finding.level.toUpperCase().padEnd(4);
        console.log(`${prefix} ${finding.area}: ${finding.message}`);
        if (finding.remediation) console.log(`     remediation: ${finding.remediation}`);
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
  .action(() => {
    console.log(JSON.stringify(diffProject(process.cwd()), null, 2));
  });

program
  .command("update")
  .description("Update installed templates, preserving local conflicts by default.")
  .option("--force", "Overwrite local docs.")
  .action((options: { force?: boolean }) => {
    const result = initProject({ cwd: process.cwd(), force: Boolean(options.force) });
    console.log(JSON.stringify(result, null, 2));
  });

const addCommand = program.command("add").description("Add one agent-kit asset.");
addCommand
  .command("skill <name>")
  .description("Add a single skill into .agent-kit/skills.")
  .option("--force", "Overwrite existing skill.")
  .action((name: string, options: { force?: boolean }) => {
    console.log(addSkill(process.cwd(), name, { force: Boolean(options.force) }));
  });

program
  .command("doctor")
  .description("Validate local CLI runtime prerequisites.")
  .action(() => {
    const cwd = process.cwd();
    console.log("agent-kit doctor");
    console.log(`node: ${process.version}`);
    console.log(`available skills: ${listSkills().length}`);
    if (onboardingStateExists(cwd)) {
      const progress = getSetupProgress(cwd);
      console.log(`setup progress: ${progress.percent}% (depth: ${progress.depth})`);
      if (!progress.quickComplete) {
        console.log("tip: run agent-kit setup --open to finish project context onboarding.");
      }
    } else {
      console.log("tip: run agent-kit init then agent-kit setup to onboard this project.");
    }
    console.log("status: ok");
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
  .action(() => {
    console.log(JSON.stringify(initProjectContext(process.cwd()), null, 2));
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
  .action(() => {
    console.log(JSON.stringify(initProjectContext(process.cwd()), null, 2));
  });

context
  .command("scan")
  .description("Print inferred project context without writing it.")
  .action(() => {
    console.log(JSON.stringify(scanProjectContext(process.cwd()), null, 2));
  });

context
  .command("ask")
  .description("Print unanswered high-value project context questions.")
  .action(() => {
    const result = initProjectContext(process.cwd());
    if (result.openQuestions.length === 0) {
      console.log("No open project-context questions.");
      return;
    }
    console.log("Answer these in the web setup wizard with: agent-kit setup --open");
    console.log("Check progress with: agent-kit setup --status");
    for (const question of result.openQuestions) console.log(`- ${question}`);
  });

context
  .command("render")
  .description("Render .agent-kit/project-context.md from project-context.json.")
  .action(() => {
    console.log(JSON.stringify(renderProjectContext(process.cwd()), null, 2));
  });

context
  .command("validate")
  .description("Validate .agent-kit/project-context.json.")
  .action(() => {
    console.log(JSON.stringify(validateProjectContext(process.cwd()), null, 2));
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
  .action((titleParts: string[], options: { workflow: string; request?: string }) => {
    const title = titleParts.join(" ");
    console.log(
      JSON.stringify(
        startSession(process.cwd(), {
          title,
          workflowId: options.workflow,
          ...(options.request ? { request: options.request } : {})
        }),
        null,
        2
      )
    );
  });

session
  .command("list")
  .description("List local council sessions.")
  .action(() => {
    console.log(JSON.stringify(listSessions(process.cwd()), null, 2));
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
  .action((textParts: string[], options: { agent: string }) => {
    console.log(JSON.stringify(recordNote(process.cwd(), options.agent, textParts.join(" ")), null, 2));
  });

session
  .command("decision <text...>")
  .description("Record an agent decision.")
  .requiredOption("--agent <agent>", "Agent id.")
  .option("--risk <risk>", "Risk associated with the decision.")
  .action((textParts: string[], options: { agent: string; risk?: string }) => {
    console.log(JSON.stringify(recordDecision(process.cwd(), options.agent, textParts.join(" "), options.risk), null, 2));
  });

session
  .command("handoff")
  .description("Record an agent handoff.")
  .requiredOption("--from <agent>", "Source agent id.")
  .requiredOption("--to <agent>", "Target agent id.")
  .requiredOption("--decision <decision>", "Decision being handed off.")
  .requiredOption("--risk <risk>", "Risk that remains.")
  .option("--evidence <evidence...>", "Evidence paths or notes.")
  .action((options: { from: string; to: string; decision: string; risk: string; evidence?: string[] }) => {
    console.log(
      JSON.stringify(
        recordHandoff(process.cwd(), {
          fromAgentId: options.from,
          toAgentId: options.to,
          decision: options.decision,
          risk: options.risk,
          ...(options.evidence ? { evidence: options.evidence } : {})
        }),
        null,
        2
      )
    );
  });

session
  .command("correct <text...>")
  .description("Record a human correction and optionally promote it to durable rules.")
  .option("--agent <agent>", "Agent id.")
  .option("--scope <scope>", "Correction scope: session, project, agent, upstream-proposal.", "session")
  .action((textParts: string[], options: { agent?: string; scope: "session" | "project" | "agent" | "upstream-proposal" }) => {
    console.log(
      JSON.stringify(
        recordCorrection(process.cwd(), {
          ...(options.agent ? { agentId: options.agent } : {}),
          scope: options.scope,
          text: textParts.join(" ")
        }),
        null,
        2
      )
    );
  });

session
  .command("artifact")
  .description("Record a changed or relevant artifact path.")
  .requiredOption("--file <file>", "Artifact file path.")
  .option("--note <note>", "Artifact note.")
  .action((options: { file: string; note?: string }) => {
    console.log(JSON.stringify(recordArtifact(process.cwd(), options.file, options.note), null, 2));
  });

session
  .command("verify")
  .description("Record verification evidence.")
  .requiredOption("--command <command>", "Command or review performed.")
  .requiredOption("--result <result>", "pass, fail, or skipped.")
  .option("--notes <notes>", "Verification notes.")
  .action((options: { command: string; result: "pass" | "fail" | "skipped"; notes?: string }) => {
    console.log(JSON.stringify(recordVerification(process.cwd(), options.command, options.result, options.notes), null, 2));
  });

session
  .command("output <name...>")
  .description("Mark a required session output status.")
  .requiredOption("--status <status>", "missing, partial, complete, or not-applicable.")
  .option("--evidence <evidence>", "Evidence path, command, or note.")
  .action((nameParts: string[], options: { status: string; evidence?: string }) => {
    if (!isRequiredOutputStatus(options.status)) {
      console.error(`Invalid --status value "${options.status}". Expected one of: ${requiredOutputStatuses.join(", ")}.`);
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify(recordRequiredOutput(process.cwd(), nameParts.join(" "), options.status, options.evidence), null, 2));
  });

session
  .command("render")
  .description("Render active session Markdown files.")
  .action(() => {
    console.log(JSON.stringify(renderActiveSession(process.cwd()), null, 2));
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
  .action((options: { status: "planned" | "in-progress" | "blocked" | "complete" }) => {
    console.log(JSON.stringify(closeSession(process.cwd(), options.status), null, 2));
  });

const correction = program.command("correction").description("Manage durable Agent Studio correction rules.");

correction
  .command("list")
  .description("List correction rules.")
  .action(() => {
    console.log(JSON.stringify(listCorrections(process.cwd()), null, 2));
  });

correction
  .command("add <text...>")
  .description("Add a durable correction rule.")
  .option("--scope <scope>", "Correction scope: project, agent, or upstream-proposal.", "project")
  .option("--agent <agent>", "Agent id for agent-scoped corrections.")
  .action((textParts: string[], options: { scope: "project" | "agent" | "upstream-proposal"; agent?: string }) => {
    console.log(
      JSON.stringify(
        addCorrection(process.cwd(), {
          scope: options.scope,
          ...(options.agent ? { agentId: options.agent } : {}),
          text: textParts.join(" ")
        }),
        null,
        2
      )
    );
  });

correction
  .command("apply [id]")
  .description("Mark a correction rule active and reviewed.")
  .option("--id <id>", "Correction id.")
  .action((idArgument: string | undefined, options: { id?: string }) => {
    const id = idArgument ?? options.id;
    if (!id) {
      console.error("Missing correction id. Use agent-kit correction apply <id> or --id <id>.");
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify(applyCorrection(process.cwd(), id), null, 2));
  });

correction
  .command("retire <id>")
  .description("Retire a correction rule.")
  .requiredOption("--reason <reason>", "Reason for retirement.")
  .action((id: string, options: { reason: string }) => {
    console.log(JSON.stringify(retireCorrection(process.cwd(), id, options.reason), null, 2));
  });

correction
  .command("propose-upstream <id>")
  .description("Create an upstream proposal from a project or agent correction.")
  .action((id: string) => {
    console.log(JSON.stringify(proposeCorrectionUpstream(process.cwd(), id), null, 2));
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
  .action(() => {
    console.log(JSON.stringify(exportStaticStudio(process.cwd()), null, 2));
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
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
