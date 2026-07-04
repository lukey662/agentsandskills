import { readFileSync } from "node:fs";
import { join } from "node:path";
import { findPackageRoot } from "../../utils/package-root.js";
import { scanProjectContext } from "../context.js";
import { getSetupFormViewModel, RECOMMENDED_SUPABASE_AUTH } from "../setup-form.js";
import { getActiveSessionId } from "../session.js";
import { getIdeSurfaces } from "../wizard/checklist.js";
import { loadProjectRosterAgents } from "../wizard/roster.js";
import { CANVAS_SCALE, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE, buildOfficeStations } from "./map.js";
import type { OfficeBootConfig } from "./types.js";
import { PACKAGE_VERSION } from "../../config/defaults.js";

const PRODUCT_CATEGORIES = ["content-app", "saas", "admin", "marketplace", "tool", "ecommerce", "portfolio", "education", "community", "ai-workflow", "other"];

const TENANT_MODELS = ["single-user", "team", "tenant", "marketplace", "admin", "public-content"];

function readOfficeAsset(name: string): string {
  const root = findPackageRoot();
  const distPath = join(root, "dist", "studio", "office", "assets", name);
  const srcPath = join(root, "src", "studio", "office", "assets", name);
  try {
    return readFileSync(distPath, "utf8");
  } catch {
    return readFileSync(srcPath, "utf8");
  }
}

export function buildOfficeBootConfig(cwd: string, viewModel: ReturnType<typeof getSetupFormViewModel>): OfficeBootConfig {
  const agents = loadProjectRosterAgents(cwd);
  return {
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    tileSize: TILE_SIZE,
    scale: CANVAS_SCALE,
    stations: buildOfficeStations(agents),
    agents,
    categories: PRODUCT_CATEGORIES,
    tenantModels: TENANT_MODELS,
    recommendedSupabaseAuth: RECOMMENDED_SUPABASE_AUTH,
    ideSurfaces: getIdeSurfaces(),
    hasSupabase: viewModel.hasSupabase,
    stackSignals: []
  };
}

export function renderSetupOfficeHtml(boot?: OfficeBootConfig): string {
  return renderOfficeHtml(boot, "setup");
}

function renderOfficeHtml(boot: OfficeBootConfig | undefined, mode: "setup" | "studio"): string {
  const css = readOfficeAsset("office.css");
  const js = readOfficeAsset("office.js");
  const bootJson = JSON.stringify({
    ...(boot ?? {
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT,
      tileSize: TILE_SIZE,
      scale: CANVAS_SCALE,
      stations: [],
      agents: [],
      categories: PRODUCT_CATEGORIES,
      tenantModels: TENANT_MODELS,
      ideSurfaces: [],
      hasSupabase: false,
      stackSignals: []
    }),
    mode
  }).replace(/</g, "\\u003c");

  const isStudio = mode === "studio";
  const title = isStudio ? "Agent Kit — Live Studio" : "Agent Kit — Setup Office";
  const dataView = isStudio ? "studio-v1" : "office-v1";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>${css}</style>
</head>
<body data-view="${dataView}" data-kit-version="${PACKAGE_VERSION}">
  <header class="office-header">
    <div class="brand">
      <h1>${isStudio ? "Live Agent Studio" : "Agent Office"}</h1>
      <p class="project-name" id="project-name">…</p>
    </div>
    <div class="header-actions">
      <span class="progress-pill" id="progress-pill">${isStudio ? "Live" : "0% ready"}</span>
      ${isStudio ? "" : '<span class="level-pill" id="level-pill" aria-live="polite">L3 → L5</span>'}
      ${isStudio ? '<span class="session-pill" id="session-pill">No session</span>' : '<a class="btn secondary" href="/wizard">Form view</a>'}
      ${isStudio ? "" : '<button type="button" class="btn primary" id="review-btn">Review &amp; save</button>'}
    </div>
  </header>
  ${isStudio ? "" : '<div class="iceberg-strip" id="iceberg-strip" aria-label="Agentic engineering levels L3 through L8"></div>'}
  <main class="office-main${isStudio ? " studio-layout" : ""}">
    <aside class="station-list${isStudio ? " hidden" : ""}" aria-label="Setup stations">
      <h2>Stations</h2>
      <p class="hint">Keyboard-friendly list — same actions as the office floor.</p>
      <div class="climb-panel" id="climb-panel" hidden>
        <h3>Climb checklist</h3>
        <ol id="climb-list"></ol>
        <button type="button" class="btn secondary climb-refresh" id="climb-refresh">Refresh level</button>
      </div>
      <ul id="station-list"></ul>
    </aside>
    <div class="canvas-wrap">
      <canvas id="office-floor" width="${MAP_WIDTH * TILE_SIZE}" height="${MAP_HEIGHT * TILE_SIZE}" role="img" aria-labelledby="canvas-desc"></canvas>
      <p id="canvas-desc" class="sr-only">${isStudio ? "Live council session office floor with agent speech bubbles." : "Top-down pixel office. Click agents at desks or zone stations to configure your project."}</p>
      <div id="hover-label" class="hover-label hidden" aria-hidden="true"></div>
      <div id="bubble-layer" class="bubble-layer" aria-hidden="true"></div>
      <div id="nameplate-layer" class="nameplate-layer" aria-hidden="true"></div>
      <div id="office-hint" class="office-hint hidden" role="status">${isStudio ? "Watching council session events…" : "Click a desk or zone to brief your agent team."}</div>
    </div>
    ${isStudio ? '<aside class="transcript-panel" id="transcript-panel" aria-label="Session transcript"><div class="studio-controls" id="studio-controls"><label class="studio-label" for="session-picker">Session</label><select id="session-picker" aria-label="Council session"></select><form id="studio-note-form" class="studio-note-form"><select id="studio-note-agent" aria-label="Agent for note"></select><input id="studio-note-text" type="text" maxlength="3999" placeholder="Add council note…" /><button type="submit" class="btn secondary">Add note</button></form><button type="button" class="btn primary" id="studio-render-btn">Render markdown</button></div><h2>Transcript</h2><ol id="transcript-list"></ol></aside>' : ""}
  </main>
  <div id="status" class="status" role="status" aria-live="polite"></div>
  <div id="depth-modal" class="modal modal-blur" hidden>
    <div class="modal-card" role="dialog" aria-labelledby="depth-title" aria-modal="true">
      <h2 id="depth-title">Choose setup depth</h2>
      <p class="why">Unlocks more stations on the office floor.</p>
      <div class="depth-grid" id="depth-grid"></div>
    </div>
  </div>
  <aside id="panel" class="panel hidden" aria-labelledby="panel-title">
    <div class="panel-head">
      <h2 id="panel-title">Station</h2>
      <button type="button" class="panel-close" id="panel-close" aria-label="Close panel">×</button>
    </div>
    <div class="panel-body" id="panel-body"></div>
    <div class="panel-foot">
      <button type="button" class="btn secondary" id="panel-cancel">Cancel</button>
      <button type="button" class="btn primary" id="panel-save">Save &amp; close</button>
    </div>
  </aside>
  <div id="review-modal" class="modal hidden" role="dialog" aria-labelledby="review-title" aria-modal="true">
    <div class="modal-card modal-wide">
      <h2 id="review-title">Review &amp; save</h2>
      <dl class="review" id="review-list"></dl>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="review-cancel">Back to office</button>
        <button type="button" class="btn primary" id="review-save">Save project context</button>
      </div>
    </div>
  </div>
  <script>window.OFFICE_BOOT = ${bootJson};</script>
  <script>${js}</script>
</body>
</html>`;
}

export function renderLiveStudioHtml(boot?: OfficeBootConfig): string {
  return renderOfficeHtml(boot, "studio");
}

export function renderLiveStudioHtmlWithContext(cwd: string): string {
  const viewModel = getSetupFormViewModel(cwd);
  const context = scanProjectContext(cwd);
  const boot = buildOfficeBootConfig(cwd, viewModel);
  let activeSessionId = "";
  try {
    activeSessionId = getActiveSessionId(cwd);
  } catch {
    activeSessionId = "";
  }
  const stackSignals = [
    ...context.architecture.frameworks,
    ...context.architecture.testTools.slice(0, 2),
    ...(viewModel.hasSupabase ? ["supabase"] : [])
  ].filter(Boolean);
  return renderLiveStudioHtml({
    ...boot,
    mode: "studio",
    activeSessionId,
    stackSignals: [...new Set(stackSignals)]
  });
}

export function renderSetupOfficeHtmlWithContext(cwd: string): string {
  const viewModel = getSetupFormViewModel(cwd);
  const context = scanProjectContext(cwd);
  const boot = buildOfficeBootConfig(cwd, viewModel);
  const stackSignals = [
    ...context.architecture.frameworks,
    ...context.architecture.testTools.slice(0, 2),
    ...(viewModel.hasSupabase ? ["supabase"] : [])
  ].filter(Boolean);
  return renderSetupOfficeHtml({ ...boot, mode: "setup", stackSignals: [...new Set(stackSignals)] });
}
