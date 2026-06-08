/* global WIZARD_BOOT */
(function wizardApp() {
  const boot = window.WIZARD_BOOT || {};
  const RECOMMENDED_SUPABASE_AUTH = boot.recommendedSupabaseAuth || "";

  const state = {
    view: "home",
    stepIndex: 0,
    depth: "undecided",
    onboarding: {},
    progress: {},
    form: {},
    hasExistingContext: false,
    designDraft: null,
    messagingDraft: null,
    ideSurfaces: boot.ideSurfaces || [],
    agents: boot.agents || []
  };

  const els = {
    status: document.getElementById("status"),
    projectName: document.getElementById("project-name"),
    ringPct: document.getElementById("ring-pct"),
    ring: document.getElementById("progress-ring"),
    sectionNav: document.getElementById("section-nav"),
    card: document.getElementById("wizard-card"),
    footer: document.getElementById("wizard-footer"),
    backBtn: document.getElementById("back-btn"),
    nextBtn: document.getElementById("next-btn"),
    saveBtn: document.getElementById("save-btn")
  };

  function setStatus(kind, message) {
    els.status.className = kind ? "status " + kind : "status";
    els.status.textContent = message || "";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fieldValue(name) {
    const el = document.querySelector('[name="' + name + '"]');
    return el && "value" in el ? String(el.value).trim() : state.form[name] || "";
  }

  function collectForm() {
    document.querySelectorAll("[name]").forEach((el) => {
      if ("value" in el) state.form[el.name] = el.value;
    });
    return state.form;
  }

  async function api(path, options) {
    const response = await fetch(path, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function saveDraft() {
    collectForm();
    const data = await api("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form: state.form })
    });
    state.progress = data.progress;
    renderRail();
  }

  async function loadAll() {
    const data = await api("/api/state");
    state.onboarding = data.onboarding;
    state.progress = data.progress;
    state.form = data.form || {};
    state.hasExistingContext = Boolean(data.hasExistingContext);
    state.depth = data.onboarding.depth || "undecided";
    state.designDraft = data.designDraft;
    state.messagingDraft = data.messagingDraft;
    if (Array.isArray(data.agents) && data.agents.length) state.agents = data.agents;
    els.projectName.textContent = data.projectName || "your project";
    const pct = data.progress?.percent ?? 0;
    els.ringPct.textContent = pct + "%";
    els.ring.style.setProperty("--pct", String(pct));
    render();
  }

  async function patchState(patch) {
    const data = await api("/api/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    state.onboarding = data.onboarding;
    state.progress = data.progress;
    renderRail();
  }

  function stepsForCurrentDepth() {
    return (boot.steps || []).filter((s) => s.depth.includes(state.depth));
  }

  function currentStepDef() {
    return stepsForCurrentDepth()[state.stepIndex];
  }

  function validateCurrentStep() {
    const step = currentStepDef();
    if (!step) return true;
    let valid = true;
    for (const field of step.fields) {
      const val = fieldValue(field);
      const err = document.querySelector('[data-error-for="' + field + '"]');
      const required = !step.optional;
      const empty = !val;
      if (err) err.classList.toggle("show", required && empty);
      if (required && empty) valid = false;
    }
    return valid;
  }

  function renderRail() {
    const sections = state.progress?.sections || [];
    els.sectionNav.innerHTML = sections
      .map((s) => {
        const chipClass =
          s.status === "done" ? "done" : s.status === "in_progress" ? "progress" : s.status === "optional" ? "optional" : "";
        const chipLabel =
          s.status === "done" ? "Done" : s.status === "in_progress" ? "Now" : s.status === "optional" ? "Optional" : "—";
        return (
          '<li><button type="button" data-section="' +
          s.id +
          '" ' +
          (s.status === "in_progress" ? 'aria-current="step"' : "") +
          ">" +
          escapeHtml(s.label) +
          '<span class="chip ' +
          chipClass +
          '">' +
          chipLabel +
          "</span></button></li>"
        );
      })
      .join("");
    els.sectionNav.querySelectorAll("[data-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-section");
        const idx = stepsForCurrentDepth().findIndex((s) => s.section === id);
        if (idx >= 0) {
          state.view = "step";
          state.stepIndex = idx;
          render();
        }
      });
    });
  }

  function renderTeamIntro() {
    const cards = state.agents
      .map(
        (a) =>
          '<li class="agent-card"><strong>' +
          escapeHtml(a.name) +
          "</strong><p>" +
          escapeHtml(a.roleSummary) +
          "</p></li>"
      )
      .join("");
    return (
      '<p class="why">Next you will brief each specialist — one step per agent. Skip any you are not ready to answer; you can return later.</p>' +
      '<ul class="agent-roster">' +
      cards +
      "</ul>"
    );
  }

  function renderAgentBriefField(fieldName, step) {
    const val = escapeHtml(state.form[fieldName] || "");
    return (
      '<div class="agent-brief">' +
      '<p class="agent-role">' +
      escapeHtml(step.roleSummary || "") +
      '</p><label for="' +
      fieldName +
      '">Project briefing for ' +
      escapeHtml(step.agentName || "this agent") +
      '<span>Optional — like onboarding a freelancer who already knows their craft.</span></label><textarea id="' +
      fieldName +
      '" name="' +
      fieldName +
      '" placeholder="What is unique about this project for ' +
      escapeHtml(step.agentName || "them") +
      '? Constraints, priorities, things not obvious from the repo…">' +
      val +
      "</textarea></div>"
    );
  }

  function renderHome() {
    const pills = (boot.stackSignals || [])
      .map((s) => '<span class="pill">' + escapeHtml(s) + "</span>")
      .join("");
    const agentCount = state.agents.length || boot.agents?.length || 0;
    const officePromo =
      '<div class="office-promo">' +
      "<h3>Try the Agent Office</h3>" +
      "<p>Walk a pixel office floor — click agent desks to brief your team, or visit zone stations for product, security, and design setup.</p>" +
      '<a href="/" class="btn">Open Agent Office →</a>' +
      "</div>";
    return (
      officePromo +
      '<div class="eyebrow">Form view · setup home</div>' +
      "<h2>Brief your agent team (step-by-step)</h2>" +
      '<p class="why">You have <strong>' +
      agentCount +
      " specialists</strong> — planner, architect, engineers, design, copy, security, QA, and more. They already know their fields. This wizard captures what is unique about <em>your</em> project, like briefing freelancers you just hired.</p>" +
      '<p class="why">Forms start empty so you can answer fresh. Progress auto-saves as you go.</p>' +
      (state.hasExistingContext
        ? '<p class="why"><button type="button" class="link-btn" id="import-context">Load answers from existing project context</button> (optional)</p>'
        : "") +
      '<div class="stack-pills">' +
      pills +
      "</div>" +
      '<p class="why" style="margin-top:20px"><strong>Choose your path</strong></p>' +
      '<div class="depth-grid">' +
      depthCard("quick", "Quick (~10 min)", "IDE setup, agent briefings, and product essentials.") +
      depthCard("standard", "Standard (~15 min)", "Quick plus visual QA tier for UI changes.") +
      depthCard("complete", "Complete (~25 min)", "Standard plus DESIGN and MESSAGING intake drafts.") +
      "</div>" +
      (state.progress?.recommendedNext
        ? '<p class="why" style="margin-top:18px">Continue: <strong>' +
          escapeHtml(state.progress.recommendedNext) +
          "</strong></p>"
        : "")
    );
  }

  function depthCard(id, title, desc) {
    const sel = state.depth === id ? " selected" : "";
    return (
      '<button type="button" class="depth-card' +
      sel +
      '" data-depth="' +
      id +
      '"><strong>' +
      escapeHtml(title) +
      "</strong><p>" +
      escapeHtml(desc) +
      "</p></button>"
    );
  }

  function inputField(name, label, hint, type, placeholder) {
    const val = escapeHtml(state.form[name] || "");
    if (type === "textarea") {
      return (
        "<label for=\"" +
        name +
        "\">" +
        escapeHtml(label) +
        (hint ? "<span>" + escapeHtml(hint) + "</span>" : "") +
        '</label><textarea id="' +
        name +
        '" name="' +
        name +
        '" placeholder="' +
        escapeHtml(placeholder || "") +
        '">' +
        val +
        '</textarea><p class="field-error" data-error-for="' +
        name +
        '">This field is required.</p>'
      );
    }
    return (
      "<label for=\"" +
      name +
      "\">" +
      escapeHtml(label) +
      (hint ? "<span>" + escapeHtml(hint) + "</span>" : "") +
      '</label><input id="' +
      name +
      '" name="' +
      name +
      '" type="text" value="' +
      val +
      '" placeholder="' +
      escapeHtml(placeholder || "") +
      '"><p class="field-error" data-error-for="' +
      name +
      '">This field is required.</p>'
    );
  }

  function renderStepFields(step) {
    const map = {
      productSummary: () =>
        inputField(
          "productSummary",
          "Product summary",
          "One paragraph: what it does, who it serves, how data or content flows.",
          "textarea",
          "Describe the product in plain language."
        ),
      productCategory: () => {
        const opts = (boot.categories || [])
          .map(
            (c) =>
              '<option value="' +
              c +
              '"' +
              (state.form.productCategory === c ? " selected" : "") +
              ">" +
              c +
              "</option>"
          )
          .join("");
        return (
          '<label for="productCategory">Category</label><select id="productCategory" name="productCategory">' +
          opts +
          "</select>"
        );
      },
      primaryAudience: () =>
        inputField("primaryAudience", "Primary user or buyer", "", "text", "Who uses or pays for this product?"),
      primaryWorkflows: () =>
        inputField(
          "primaryWorkflows",
          "Top workflows",
          "One per line.",
          "textarea",
          "Sign up and configure an account\nComplete the primary task\nReview or export results"
        ),
      tenantModel: () => {
        const opts = (boot.tenantModels || [])
          .map(
            (c) =>
              '<option value="' +
              c +
              '"' +
              (state.form.tenantModel === c ? " selected" : "") +
              ">" +
              c +
              "</option>"
          )
          .join("");
        return '<label for="tenantModel">Who uses the system?</label><select id="tenantModel" name="tenantModel">' + opts + "</select>";
      },
      owner: () => inputField("owner", "Project owner", "Optional.", "text", ""),
      authModel: () =>
        (boot.hasSupabase
          ? '<div class="hint">Supabase detected. Insert the kit baseline, then customize for your roles.<button type="button" id="apply-supabase-auth">Insert Supabase auth baseline</button></div>'
          : "") +
        inputField(
          "authModel",
          "Authentication model",
          "Sign-in methods, roles, and rules agents must preserve.",
          "textarea",
          "Describe auth boundaries agents must not break."
        ),
      uiPreferred: () =>
        inputField("uiPreferred", "UI should feel like…", "", "textarea", "Task-first, clear hierarchy, readable typography."),
      uiAvoid: () =>
        inputField("uiAvoid", "UI should avoid…", "Optional.", "textarea", "Generic SaaS heroes, card soup, fake metrics."),
      valueProposition: () =>
        inputField("valueProposition", "Value proposition", "", "textarea", "What outcome do users get?"),
      proof: () => inputField("proof", "Proof points", "One per line. Real evidence only.", "textarea", ""),
      objections: () => inputField("objections", "Objections", "One per line. Optional.", "textarea", ""),
      qualityTarget: () => {
        const q = state.form.qualityTarget || "baseline-setup";
        return (
          '<label for="qualityTarget">Quality target</label><select id="qualityTarget" name="qualityTarget">' +
          optionQuality("baseline-setup", "baseline-setup — kit installed, filling evidence", q) +
          optionQuality("needs-improvement", "needs-improvement — active delivery", q) +
          optionQuality("best-practice-candidate", "best-practice-candidate — clean audit goal", q) +
          "</select>"
        );
      },
      ideSurface: () => {
        const opts = state.ideSurfaces
          .map(
            (s) =>
              '<option value="' +
              s.id +
              '"' +
              (state.form.ideSurface === s.id ? " selected" : "") +
              ">" +
              escapeHtml(s.label) +
              "</option>"
          )
          .join("");
        return (
          '<label for="ideSurface">Primary AI coding tool</label><select id="ideSurface" name="ideSurface" required>' +
          '<option value="">Choose your IDE…</option>' +
          opts +
          '</select><p class="why">We configure instructions for this path: <code id="ide-path"></code></p>'
        );
      },
      visualQaTier: () => {
        const t = state.form.visualQaTier || "baseline";
        return (
          '<label for="visualQaTier">Visual QA tier</label><select id="visualQaTier" name="visualQaTier">' +
          optionTier("baseline", "Baseline — manual screenshot review", t) +
          optionTier("strong", "Strong — Playwright screenshots + review", t) +
          optionTier("mature", "Mature — Storybook / visual regression CI", t) +
          "</select>"
        );
      },
      designAudience: () => inputField("designAudience", "Design audience", "", "text", state.form.primaryAudience || ""),
      designContent: () => inputField("designContent", "Content inventory", "Real nouns, labels, data types.", "textarea", ""),
      designAntiReferences: () => inputField("designAntiReferences", "Anti-references", "Patterns to avoid.", "textarea", ""),
      msgAudience: () => inputField("msgAudience", "Primary audience", "", "text", state.form.primaryAudience || ""),
      msgPain: () => inputField("msgPain", "Painful problem", "In customer language.", "textarea", ""),
      msgOutcome: () => inputField("msgOutcome", "Desired outcome", "", "textarea", "")
    };
    return step.fields
      .map((f) => {
        if (map[f]) return map[f]();
        if (f.startsWith("agentBrief_")) return renderAgentBriefField(f, step);
        return "";
      })
      .join("");
  }

  function optionQuality(v, l, current) {
    return '<option value="' + v + '"' + (current === v ? " selected" : "") + ">" + escapeHtml(l) + "</option>";
  }

  function optionTier(v, l, current) {
    return '<option value="' + v + '"' + (current === v ? " selected" : "") + ">" + escapeHtml(l) + "</option>";
  }

  function renderReview() {
    const ide = state.ideSurfaces.find((s) => s.id === fieldValue("ideSurface"));
    const briefCount = Object.keys(state.form).filter((k) => k.startsWith("agentBrief_") && state.form[k]?.trim()).length;
    const items = [
      ["IDE / AI tool", ide ? ide.label : fieldValue("ideSurface") || "—"],
      ["Agent briefings", briefCount ? briefCount + " specialist(s) briefed" : "—"],
      ["Product summary", fieldValue("productSummary")],
      ["Audience", fieldValue("primaryAudience")],
      ["Workflows", fieldValue("primaryWorkflows")],
      ["Auth", fieldValue("authModel")],
      ["UI preferred", fieldValue("uiPreferred")],
      ["Value proposition", fieldValue("valueProposition")],
      ["Quality target", fieldValue("qualityTarget")]
    ];
    return (
      '<div class="eyebrow">Review</div><h2>Check your answers</h2><p class="why">Nothing is written to project context until you click Save. Agent briefings go to <code>.agent-kit/agent-briefs.md</code>.</p><dl class="review">' +
      items.map(([k, v]) => "<div><dt>" + escapeHtml(k) + "</dt><dd>" + escapeHtml(v || "—") + "</dd></div>").join("") +
      "</dl>"
    );
  }

  function renderComplete() {
    return (
      '<div class="complete-icon" aria-hidden="true">✓</div><h2>Setup saved</h2><p class="why">Agents read <code>.agent-kit/project-context.md</code> and <code>.agent-kit/agent-briefs.md</code> before meaningful work.</p><ol class="next-steps"><li>Run <code>agent-kit audit</code></li><li>Reload your IDE so it picks up instructions for your chosen tool</li><li>Return anytime with <code>agent-kit setup</code></li></ol>'
    );
  }

  function sectionLabel(section) {
    const labels = {
      ide: "Your IDE",
      team: "Agent team",
      product: "Product",
      access: "Access",
      ui: "UI",
      messaging: "Messaging",
      visualQa: "Visual QA",
      designDoc: "Design",
      messagingDoc: "Copy",
      applyDrafts: "Apply drafts"
    };
    return labels[section] || section;
  }

  function renderStep() {
    const step = currentStepDef();
    if (!step) return renderHome();
    const total = stepsForCurrentDepth().length;
    const body = step.id === "team-intro" ? renderTeamIntro() : renderStepFields(step);
    return (
      '<div class="eyebrow">Step ' +
      (state.stepIndex + 1) +
      " of " +
      total +
      " · " +
      escapeHtml(sectionLabel(step.section)) +
      '</div><h2 id="step-title">' +
      escapeHtml(step.title) +
      '</h2><p class="why">' +
      escapeHtml(step.why) +
      "</p>" +
      body
    );
  }

  function render() {
    renderRail();
    if (state.view === "home") {
      els.card.innerHTML = renderHome();
      bindHome();
      els.backBtn.classList.add("hidden");
      els.nextBtn.textContent = "Start wizard";
      els.saveBtn.classList.add("hidden");
      return;
    }
    if (state.view === "complete") {
      els.card.innerHTML = renderComplete();
      els.footer.classList.add("hidden");
      return;
    }
    if (state.view === "review") {
      collectForm();
      els.card.innerHTML = renderReview();
      els.backBtn.classList.remove("hidden");
      els.nextBtn.classList.add("hidden");
      els.saveBtn.classList.remove("hidden");
      return;
    }
    els.card.innerHTML = renderStep();
    bindStep();
    els.backBtn.classList.remove("hidden");
    els.nextBtn.classList.remove("hidden");
    els.saveBtn.classList.add("hidden");
    els.nextBtn.textContent = state.stepIndex >= stepsForCurrentDepth().length - 1 ? "Review" : "Next";
  }

  function bindHome() {
    const importBtn = document.getElementById("import-context");
    if (importBtn) {
      importBtn.addEventListener("click", async () => {
        setStatus("", "Loading existing context…");
        try {
          const data = await api("/api/context/import", { method: "POST" });
          state.form = data.form || state.form;
          state.hasExistingContext = false;
          setStatus("ok", "Loaded from existing project context.");
          render();
        } catch (error) {
          setStatus("error", error.message);
        }
      });
    }
    els.card.querySelectorAll("[data-depth]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.depth = btn.getAttribute("data-depth");
        await patchState({ depth: state.depth, currentSection: "ide", currentStep: 0 });
        state.view = "step";
        state.stepIndex = 0;
        render();
      });
    });
  }

  function bindStep() {
    const applyBtn = document.getElementById("apply-supabase-auth");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const el = document.querySelector('[name="authModel"]');
        if (el) el.value = RECOMMENDED_SUPABASE_AUTH;
      });
    }
    const ideSelect = document.querySelector('[name="ideSurface"]');
    if (ideSelect) {
      const updatePath = () => {
        const id = ideSelect.value;
        const surface = state.ideSurfaces.find((s) => s.id === id);
        const pathEl = document.getElementById("ide-path");
        if (pathEl && surface) pathEl.textContent = surface.path;
      };
      ideSelect.addEventListener("change", updatePath);
      updatePath();
    }
  }

  els.backBtn.addEventListener("click", () => {
    if (state.view === "step" && state.stepIndex > 0) {
      collectForm();
      state.stepIndex -= 1;
      render();
      return;
    }
    if (state.view === "review") {
      state.view = "step";
      state.stepIndex = stepsForCurrentDepth().length - 1;
      render();
      return;
    }
    state.view = "home";
    render();
  });

  els.nextBtn.addEventListener("click", async () => {
    if (state.view === "home") {
      if (state.depth === "undecided") {
        setStatus("error", "Choose Quick, Standard, or Complete to continue.");
        return;
      }
      state.view = "step";
      state.stepIndex = 0;
      render();
      return;
    }
    collectForm();
    if (!validateCurrentStep()) return;
    const step = currentStepDef();
    try {
      await saveDraft();
    } catch (error) {
      setStatus("error", error.message);
      return;
    }
    if (step) {
      await patchState({ currentSection: step.section, currentStep: state.stepIndex });
    }
    if (step?.section === "ide" && fieldValue("ideSurface")) {
      await api("/api/checklist/ide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideSurface: fieldValue("ideSurface") })
      });
    }
    if (step?.section === "visualQa" && fieldValue("visualQaTier")) {
      await api("/api/checklist/visual-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: fieldValue("visualQaTier") })
      });
    }
    if (step?.section === "designDoc") {
      await api("/api/drafts/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: fieldValue("designAudience"),
          contentInventory: fieldValue("designContent"),
          antiReferences: fieldValue("designAntiReferences")
        })
      });
    }
    if (step?.section === "messagingDoc") {
      await api("/api/drafts/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: fieldValue("msgAudience"),
          pain: fieldValue("msgPain"),
          outcome: fieldValue("msgOutcome")
        })
      });
    }
    if (step?.section === "applyDrafts") {
      await api("/api/drafts/apply", { method: "POST" });
    }
    if (state.stepIndex >= stepsForCurrentDepth().length - 1) {
      state.view = "review";
      render();
      return;
    }
    state.stepIndex += 1;
    render();
  });

  els.saveBtn.addEventListener("click", async () => {
    collectForm();
    setStatus("", "Saving…");
    els.saveBtn.disabled = true;
    try {
      await api("/api/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.form)
      });
      state.view = "complete";
      setStatus("ok", "Saved to .agent-kit/project-context.json");
      render();
    } catch (error) {
      setStatus("error", error.message);
    } finally {
      els.saveBtn.disabled = false;
    }
  });

  const resume = state.onboarding?.lastVisitedAt && state.progress?.percent > 0;
  state.view = resume ? "home" : "home";
  loadAll().catch((e) => setStatus("error", e.message));
})();
