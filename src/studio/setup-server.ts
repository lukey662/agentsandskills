import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import {
  applySetupFormAnswers,
  ensureProjectContextForSetup,
  getSetupFormViewModel,
  parseSetupFormPayload
} from "./setup-form.js";
import {
  getSetupProgress,
  loadOnboardingState,
  markQuickPathComplete,
  saveOnboardingState
} from "./onboarding-state.js";
import { saveIdeChecklist, writeVisualQaTier, type IdeSurface } from "./wizard/checklist.js";
import { saveAgentBriefs } from "./wizard/agent-briefs.js";
import {
  buildWizardFormState,
  extractAgentBriefsFromForm,
  extractSetupFormFromWizardForm,
  loadWizardDraft,
  saveWizardDraft
} from "./wizard/wizard-draft.js";
import { loadProjectRosterAgents } from "./wizard/roster.js";
import {
  applyDrafts,
  loadDesignDraft,
  loadMessagingDraft,
  previewDesignMarkdown,
  previewMessagingMarkdown,
  saveDesignDraft,
  saveMessagingDraft
} from "./wizard/drafts.js";
import { renderSetupOfficeHtmlWithContext } from "./office/render.js";
import { renderSetupWizardHtmlWithContext } from "./wizard/render.js";
import type { WizardDepth } from "./wizard/steps.js";

export interface SetupServerOptions {
  cwd: string;
  port?: number;
  host?: string;
}

export interface SetupServerHandle {
  url: string;
  port: number;
  close: () => Promise<void>;
}

const DEFAULT_PORT = 9321;
const DEFAULT_HOST = "127.0.0.1";

function readJsonBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      if (chunks.reduce((total, item) => total + item.length, 0) > 256_000) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as unknown);
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendHtml(response: ServerResponse, html: string): void {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'none'; connect-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'self'"
  });
  response.end(html);
}

function buildStatePayload(cwd: string): Record<string, unknown> {
  ensureProjectContextForSetup(cwd);
  const viewModel = getSetupFormViewModel(cwd);
  const onboarding = loadOnboardingState(cwd);
  const progress = getSetupProgress(cwd);
  const designDraft = loadDesignDraft(cwd);
  const messagingDraft = loadMessagingDraft(cwd);
  const draft = loadWizardDraft(cwd);
  return {
    projectName: viewModel.projectName,
    form: buildWizardFormState(cwd),
    hasExistingContext: Boolean(
      viewModel.form.productSummary.trim() ||
        viewModel.form.primaryAudience.trim() ||
        viewModel.form.valueProposition.trim()
    ),
    openQuestions: viewModel.openQuestions,
    hasSupabase: viewModel.hasSupabase,
    onboarding,
    progress,
    designDraft,
    messagingDraft,
    draftUpdatedAt: draft.updatedAt,
    agents: loadProjectRosterAgents(cwd),
    designPreview: designDraft ? previewDesignMarkdown(designDraft) : null,
    messagingPreview: messagingDraft ? previewMessagingMarkdown(messagingDraft) : null
  };
}

async function handleRequest(cwd: string, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/office")) {
    sendHtml(response, renderSetupOfficeHtmlWithContext(cwd));
    return;
  }

  if (request.method === "GET" && (url.pathname === "/wizard" || url.pathname === "/setup")) {
    sendHtml(response, renderSetupWizardHtmlWithContext(cwd));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/state") {
    sendJson(response, 200, buildStatePayload(cwd));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/context") {
    sendJson(response, 200, getSetupFormViewModel(cwd));
    return;
  }

  if (request.method === "PATCH" && url.pathname === "/api/state") {
    try {
      const body = (await readJsonBody(request)) as Record<string, unknown>;
      const patch: Record<string, unknown> = {};
      if (body.depth) patch.depth = body.depth as WizardDepth;
      if (body.currentSection) patch.currentSection = String(body.currentSection);
      if (typeof body.currentStep === "number") patch.currentStep = body.currentStep;
      if (Array.isArray(body.completedSections)) patch.completedSections = body.completedSections;
      saveOnboardingState(cwd, patch);
      sendJson(response, 200, buildStatePayload(cwd));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/context") {
    try {
      const raw = (await readJsonBody(request)) as Record<string, unknown>;
      const payload = parseSetupFormPayload(extractSetupFormFromWizardForm(raw as Record<string, string>));
      const result = applySetupFormAnswers(cwd, payload);
      saveAgentBriefs(cwd, extractAgentBriefsFromForm(raw as Record<string, string>));
      markQuickPathComplete(cwd);
      sendJson(response, 200, {
        ...buildStatePayload(cwd),
        saved: true,
        contextPath: result.contextPath,
        markdownPath: result.markdownPath,
        openQuestions: result.openQuestions
      });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/draft") {
    try {
      const body = (await readJsonBody(request)) as { form?: Record<string, string> };
      const form = body.form ?? {};
      saveWizardDraft(cwd, {
        form: extractSetupFormFromWizardForm(form),
        agentBriefs: extractAgentBriefsFromForm(form)
      });
      sendJson(response, 200, buildStatePayload(cwd));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/context/import") {
    try {
      const viewModel = getSetupFormViewModel(cwd);
      saveWizardDraft(cwd, { form: viewModel.form });
      sendJson(response, 200, buildStatePayload(cwd));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/checklist/ide") {
    try {
      const body = (await readJsonBody(request)) as { ideSurface?: IdeSurface };
      if (!body.ideSurface) throw new Error("ideSurface is required.");
      const result = saveIdeChecklist(cwd, body.ideSurface);
      sendJson(response, 200, { ...result, ...buildStatePayload(cwd) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/checklist/visual-qa") {
    try {
      const body = (await readJsonBody(request)) as { tier?: "baseline" | "strong" | "mature" };
      if (!body.tier) throw new Error("tier is required.");
      const result = writeVisualQaTier(cwd, body.tier);
      sendJson(response, 200, { ...result, ...buildStatePayload(cwd) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/drafts/design") {
    try {
      const body = (await readJsonBody(request)) as {
        audience?: string;
        contentInventory?: string;
        antiReferences?: string;
      };
      const draft = saveDesignDraft(cwd, {
        audience: String(body.audience ?? ""),
        contentInventory: String(body.contentInventory ?? ""),
        antiReferences: String(body.antiReferences ?? "")
      });
      sendJson(response, 200, { draft, preview: previewDesignMarkdown(draft), ...buildStatePayload(cwd) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/drafts/messaging") {
    try {
      const body = (await readJsonBody(request)) as { audience?: string; pain?: string; outcome?: string };
      const draft = saveMessagingDraft(cwd, {
        audience: String(body.audience ?? ""),
        pain: String(body.pain ?? ""),
        outcome: String(body.outcome ?? "")
      });
      sendJson(response, 200, { draft, preview: previewMessagingMarkdown(draft), ...buildStatePayload(cwd) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/drafts/apply") {
    try {
      const results = applyDrafts(cwd);
      sendJson(response, 200, { results, ...buildStatePayload(cwd) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found." });
}

function listen(server: Server, host: string, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine setup server port."));
        return;
      }
      resolve(address.port);
    });
  });
}

export async function startSetupServer(options: SetupServerOptions): Promise<SetupServerHandle> {
  const host = options.host ?? DEFAULT_HOST;
  const requestedPort = options.port ?? DEFAULT_PORT;
  ensureProjectContextForSetup(options.cwd);
  loadOnboardingState(options.cwd);

  const server = createServer((request, response) => {
    handleRequest(options.cwd, request, response).catch((error) => {
      sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
    });
  });

  let port = requestedPort;
  try {
    port = await listen(server, host, requestedPort);
  } catch (error) {
    if (requestedPort === DEFAULT_PORT && error instanceof Error && "code" in error && error.code === "EADDRINUSE") {
      port = await listen(server, host, 0);
    } else {
      throw error;
    }
  }

  return {
    url: `http://${host}:${port}`,
    port,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((closeError) => {
          if (closeError) reject(closeError);
          else resolve();
        });
      })
  };
}
