import { readFileSync } from "node:fs";
import { join } from "node:path";
import { findPackageRoot } from "../../utils/package-root.js";
import { scanProjectContext } from "../context.js";
import { getSetupFormViewModel, RECOMMENDED_SUPABASE_AUTH } from "../setup-form.js";
import { getIdeSurfaces } from "./checklist.js";
import { buildAgentWizardSteps, loadProjectRosterAgents } from "./roster.js";
import { WIZARD_STEPS, type WizardStepDef } from "./steps.js";

const PRODUCT_CATEGORIES = [
  "content-app",
  "saas",
  "admin",
  "marketplace",
  "tool",
  "ecommerce",
  "portfolio",
  "education",
  "community",
  "ai-workflow",
  "other"
];

const TENANT_MODELS = ["single-user", "team", "tenant", "marketplace", "admin", "public-content"];

function readWizardAsset(name: string): string {
  const root = findPackageRoot();
  const distPath = join(root, "dist", "studio", "wizard", "assets", name);
  const srcPath = join(root, "src", "studio", "wizard", "assets", name);
  try {
    return readFileSync(distPath, "utf8");
  } catch {
    return readFileSync(srcPath, "utf8");
  }
}

export interface WizardBootConfig {
  steps: WizardStepDef[];
  categories: string[];
  tenantModels: string[];
  recommendedSupabaseAuth: string;
  ideSurfaces: ReturnType<typeof getIdeSurfaces>;
  stackSignals: string[];
  hasSupabase: boolean;
  agents: ReturnType<typeof loadProjectRosterAgents>;
}

export function mergeWizardSteps(cwd: string): WizardStepDef[] {
  const agentSteps = buildAgentWizardSteps(cwd) as WizardStepDef[];
  const ideIndex = WIZARD_STEPS.findIndex((step) => step.id === "ide-surface");
  if (ideIndex < 0) return [...WIZARD_STEPS, ...agentSteps];
  return [...WIZARD_STEPS.slice(0, ideIndex + 1), ...agentSteps, ...WIZARD_STEPS.slice(ideIndex + 1)];
}

export function buildWizardBootConfig(cwd: string, viewModel: ReturnType<typeof getSetupFormViewModel>): WizardBootConfig {
  return {
    steps: mergeWizardSteps(cwd),
    categories: PRODUCT_CATEGORIES,
    tenantModels: TENANT_MODELS,
    recommendedSupabaseAuth: RECOMMENDED_SUPABASE_AUTH,
    ideSurfaces: getIdeSurfaces(),
    hasSupabase: viewModel.hasSupabase,
    stackSignals: [],
    agents: loadProjectRosterAgents(cwd)
  };
}

export function renderSetupWizardHtml(boot?: WizardBootConfig): string {
  const css = readWizardAsset("wizard.css");
  const js = readWizardAsset("wizard.js");
  const bootJson = JSON.stringify(boot ?? { steps: WIZARD_STEPS, categories: PRODUCT_CATEGORIES, tenantModels: TENANT_MODELS })
    .replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent Kit Setup Wizard</title>
  <style>${css}</style>
</head>
<body>
  <div class="shell">
    <aside class="rail" aria-label="Setup progress">
      <h1>Agent Kit</h1>
      <p style="margin:0 0 12px"><a href="/" style="color:#99f6e4;font-size:13px">← Back to office</a></p>
      <div class="project" id="project-name">…</div>
      <div class="ring-wrap">
        <div class="ring" id="progress-ring" style="--pct: 0"><span id="ring-pct">0%</span></div>
        <div>
          <div style="font-weight:600;color:#f8fafc">Setup progress</div>
          <div style="font-size:13px;color:#94a3b8">Save anytime — resume with agent-kit setup</div>
        </div>
      </div>
      <ul class="section-nav" id="section-nav"></ul>
    </aside>
    <div class="main">
      <div id="status" class="status" role="status" aria-live="polite"></div>
      <article class="card" id="wizard-card" aria-labelledby="step-title"></article>
      <div class="footer" id="wizard-footer">
        <button type="button" class="btn secondary hidden" id="back-btn">Back</button>
        <div style="display:flex;gap:10px;margin-left:auto">
          <button type="button" class="btn primary" id="next-btn">Next</button>
          <button type="button" class="btn primary hidden" id="save-btn">Save project context</button>
        </div>
      </div>
    </div>
  </div>
  <script>window.WIZARD_BOOT = ${bootJson};</script>
  <script>${js}</script>
</body>
</html>`;
}

export function renderSetupWizardHtmlWithContext(cwd: string): string {
  const viewModel = getSetupFormViewModel(cwd);
  const context = scanProjectContext(cwd);
  const boot = buildWizardBootConfig(cwd, viewModel);
  const stackSignals = [
    ...context.architecture.frameworks,
    ...context.architecture.testTools.slice(0, 2),
    ...(viewModel.hasSupabase ? ["supabase"] : [])
  ].filter(Boolean);
  return renderSetupWizardHtml({ ...boot, stackSignals: [...new Set(stackSignals)] });
}
