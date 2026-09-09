import { Command } from "commander";
import { addAgent, listAgents } from "../install/add-agent.js";
import { addSkill, listSkills } from "../install/add-skill.js";
import { validateAdapter, validatePackage, type AdapterValidationTarget } from "../install/adapter-validate.js";
import { createDoctorReport } from "../install/doctor.js";
import { resolveUserGuideHtml } from "../install/guide.js";
import { initProject } from "../install/install.js";
import { updateProject } from "../install/update.js";
import { PACKAGE_VERSION } from "../config/defaults.js";
import { detail, fail, heading, levelLabel, line, printJson } from "./output.js";

const program = new Command();

program.name("agent-kit").description("Install agents, skills, and a user guide. QA must review screenshots, not code alone.").version(PACKAGE_VERSION);

program
  .command("init")
  .description("Install AGENTS.md, USER_GUIDE.md, USER_GUIDE.html, and native IDE agents/skills.")
  .option("--stack <stack>", "Stack profile", "next-supabase")
  .option("--activate <targets...>", "IDE surfaces: cursor, claude, codex, copilot, antigravity, all")
  .option("--legacy-docs", "Also copy leftover living-doc templates")
  .option("--force", "Overwrite customized files")
  .option("--json", "Machine-readable output")
  .option("--dry-run", "Show what would be written")
  .action((options: { stack: "next-supabase"; activate?: string[]; legacyDocs?: boolean; force?: boolean; json?: boolean; dryRun?: boolean }) => {
    if (options.dryRun) {
      if (options.json) {
        printJson({ dryRun: true, wouldWrite: ["AGENTS.md", "USER_GUIDE.md", "USER_GUIDE.html", ".cursor/agents/", ".cursor/skills/"] });
        return;
      }
      heading("init dry-run");
      line("Would write AGENTS.md, USER_GUIDE.md, USER_GUIDE.html, and native IDE agent/skill files.");
      return;
    }

    const result = initProject({
      cwd: process.cwd(),
      stack: options.stack,
      ...(options.activate ? { activate: options.activate } : {}),
      ...(options.legacyDocs ? { legacyDocs: true } : {}),
      force: Boolean(options.force)
    });
    if (options.json) {
      printJson(result);
      return;
    }
    heading("Installed agents and skills");
    line(`copied: ${result.copied.length}`);
    line(`unchanged: ${result.unchanged.length}`);
    line(`conflicts: ${result.conflicts.length}`);
    detail("Open USER_GUIDE.html next.");
  });

program
  .command("update")
  .description("Refresh pristine installed files. Local edits win or become conflicts.")
  .option("--force", "Overwrite customized files")
  .option("--dry-run", "Preview only")
  .option("--json", "Machine-readable output")
  .action((options: { force?: boolean; dryRun?: boolean; json?: boolean }) => {
    const result = updateProject({ cwd: process.cwd(), force: Boolean(options.force), dryRun: Boolean(options.dryRun) });
    if (options.json) {
      printJson(result);
      return;
    }
    heading(options.dryRun ? "update preview" : "update");
    line(
      `created ${result.summary.created}, updated ${result.summary.updated}, kept-local ${result.summary["kept-local"]}, conflicts ${result.summary.conflict}`
    );
    if (result.leftoverDocs.length > 0) {
      detail(`Left in place (not deleted): ${result.leftoverDocs.join(", ")}. Run doctor for the 0.4 layout.`);
    }
  });

const add = program.command("add").description("Add an optional agent or skill.");

add
  .command("skill <name>")
  .description("Install one skill into .cursor/skills")
  .option("--force", "Overwrite")
  .option("--dry-run", "Preview")
  .option("--json", "Machine-readable output")
  .action((name: string, options: { force?: boolean; dryRun?: boolean; json?: boolean }) => {
    const result = addSkill(process.cwd(), name, { force: Boolean(options.force), dryRun: Boolean(options.dryRun) });
    if (options.json) {
      printJson(result);
      return;
    }
    line(`${result.action} ${result.target}`);
    if (result.action === "created" && !options.dryRun) detail(`Available skills: ${listSkills().join(", ")}`);
  });

add
  .command("agent <name>")
  .description("Install one agent into .cursor/agents and .claude/agents")
  .option("--force", "Overwrite")
  .option("--dry-run", "Preview")
  .option("--json", "Machine-readable output")
  .action((name: string, options: { force?: boolean; dryRun?: boolean; json?: boolean }) => {
    const result = addAgent(process.cwd(), name, { force: Boolean(options.force), dryRun: Boolean(options.dryRun) });
    if (options.json) {
      printJson(result);
      return;
    }
    line(`${result.action} ${result.target}`);
    if (!options.dryRun) detail(`Available agents: ${listAgents().join(", ")}`);
  });

program
  .command("doctor")
  .description("Check agents, required tools, the screenshot QA rule, and leftover 0.3 council files.")
  .option("--json", "Machine-readable output")
  .action((options: { json?: boolean }) => {
    const report = createDoctorReport(process.cwd());
    if (options.json) {
      printJson(report);
      if (!report.ok) process.exitCode = 1;
      return;
    }
    heading("doctor");
    for (const finding of report.findings) {
      line(`${levelLabel(finding.level)} ${finding.area}  ${finding.message}`);
    }
    if (!report.ok) {
      fail("doctor found failures");
      process.exitCode = 1;
    } else {
      detail("Open USER_GUIDE.html in a browser. GitHub shows source, not the layout. Run agent-kit guide for the path.");
    }
  });

program
  .command("guide")
  .description("Print the path to USER_GUIDE.html. Open it in a browser; GitHub shows source.")
  .option("--json", "Machine-readable output")
  .action((options: { json?: boolean }) => {
    const location = resolveUserGuideHtml(process.cwd());
    if (options.json) {
      printJson(location);
      return;
    }
    heading("user guide");
    line(location.path);
    detail("Open that file in a browser. GitHub shows HTML as source, not the layout.");
  });

const adapter = program.command("adapter").description("Validate IDE adapter files.");
adapter
  .command("validate [target]")
  .description("Validate activated IDEs, or one of cursor, claude, codex, copilot, antigravity")
  .option("--json", "Machine-readable output")
  .action((rawTarget: string | undefined, options: { json?: boolean }) => {
    const target = rawTarget ?? "all";
    const allowed = ["cursor", "claude", "codex", "copilot", "antigravity", "all"];
    if (!allowed.includes(target)) {
      throw new Error(`Unknown adapter target "${target}".`);
    }
    const report = validateAdapter(process.cwd(), target as AdapterValidationTarget);
    if (options.json) {
      printJson(report);
    } else {
      heading(`adapter validate ${report.target}`);
      for (const finding of report.findings) {
        line(`${levelLabel(finding.level)} ${finding.area}  ${finding.message}`);
      }
    }
    if (report.summary.fail > 0) process.exitCode = 1;
  });

const packageCommand = program.command("package").description("Validate this source package.");
packageCommand
  .command("validate")
  .option("--json", "Machine-readable output")
  .action((options: { json?: boolean }) => {
    const report = validatePackage();
    if (options.json) printJson(report);
    else {
      heading("package validate");
      for (const finding of report.findings) line(`${levelLabel(finding.level)} ${finding.area}  ${finding.message}`);
    }
    if (report.summary.fail > 0) process.exitCode = 1;
  });

program.configureOutput({
  outputError: (str, write) => {
    const message = str.replace(/^error: /i, "").trim();
    write(`error: ${message}\n`);
  }
});

async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: ${message}`);
    process.exitCode = 1;
  }
}

void main();
