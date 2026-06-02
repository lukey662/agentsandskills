import { Command } from "commander";
import { addSkill, listSkills } from "../install/add-skill.js";
import { auditProject } from "../install/audit.js";
import { diffProject } from "../install/diff.js";
import { initProject } from "../install/install.js";
import { discoverRepos } from "../research/discover.js";
import { scanRepos } from "../research/scan.js";
import { proposeUpdates, summarizeFindings } from "../research/summarize.js";

const program = new Command();

program
  .name("agent-kit")
  .description("AFG Next.js + Supabase agent, skill, docs, design, and research kit.")
  .version("0.1.0");

program
  .command("init")
  .description("Install agent-kit docs and library files into a project.")
  .option("--stack <stack>", "Stack profile to install.", "next-supabase")
  .option("--force", "Overwrite existing docs instead of writing conflicts.")
  .action((options: { stack: "next-supabase"; force?: boolean }) => {
    const result = initProject({
      cwd: process.cwd(),
      stack: options.stack,
      force: Boolean(options.force)
    });
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command("audit")
  .description("Audit an existing project for agent-kit coverage gaps.")
  .action(() => {
    const findings = auditProject(process.cwd());
    for (const finding of findings) {
      const prefix = finding.level.toUpperCase().padEnd(4);
      console.log(`${prefix} ${finding.area}: ${finding.message}`);
      if (finding.remediation) console.log(`     remediation: ${finding.remediation}`);
    }

    if (findings.some((finding) => finding.level === "fail")) {
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
    console.log("agent-kit doctor");
    console.log(`node: ${process.version}`);
    console.log(`available skills: ${listSkills().length}`);
    console.log("status: ok");
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
