/* global OFFICE_BOOT */
(function officeApp() {
  const boot = window.OFFICE_BOOT || {};
  const TILE = boot.tileSize || 16;
  const SCALE = boot.scale || 6;
  const MAP_W = boot.mapWidth || 28;
  const MAP_H = boot.mapHeight || 18;

  const ROLE_COLORS = {
    planner: ["#7c3aed", "#5b21b6"],
    engineer: ["#0ea5e9", "#0369a1"],
    design: ["#ec4899", "#be185d"],
    ops: ["#f59e0b", "#b45309"]
  };

  const state = {
    depth: "undecided",
    form: {},
    progress: {},
    onboarding: {},
    agents: boot.agents || [],
    stations: boot.stations || [],
    hoverId: null,
    activeStationId: null,
    frame: 0,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  const els = {
    canvas: document.getElementById("office-floor"),
    projectName: document.getElementById("project-name"),
    progressPill: document.getElementById("progress-pill"),
    stationList: document.getElementById("station-list"),
    status: document.getElementById("status"),
    hoverLabel: document.getElementById("hover-label"),
    panel: document.getElementById("panel"),
    panelTitle: document.getElementById("panel-title"),
    panelBody: document.getElementById("panel-body"),
    panelClose: document.getElementById("panel-close"),
    panelCancel: document.getElementById("panel-cancel"),
    panelSave: document.getElementById("panel-save"),
    depthModal: document.getElementById("depth-modal"),
    depthGrid: document.getElementById("depth-grid"),
    reviewBtn: document.getElementById("review-btn"),
    reviewModal: document.getElementById("review-modal"),
    reviewList: document.getElementById("review-list"),
    reviewCancel: document.getElementById("review-cancel"),
    reviewSave: document.getElementById("review-save"),
    nameplateLayer: document.getElementById("nameplate-layer"),
    officeHint: document.getElementById("office-hint"),
    canvasWrap: document.querySelector(".canvas-wrap")
  };

  const ctx = els.canvas?.getContext("2d");
  if (!ctx || !els.canvas) {
    if (els.status) {
      els.status.className = "status error";
      els.status.textContent = "Canvas failed to initialize.";
    }
    return;
  }
  els.canvas.style.width = MAP_W * TILE * SCALE + "px";
  els.canvas.style.height = MAP_H * TILE * SCALE + "px";

  function setStatus(kind, message) {
    els.status.className = kind ? "status " + kind : "status";
    els.status.textContent = message || "";
    if (message) {
      window.clearTimeout(setStatus._timer);
      setStatus._timer = window.setTimeout(() => setStatus("", ""), 4000);
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function agentRole(agentId) {
    if (agentId === "planner") return "planner";
    if (["lead-architect", "nextjs-engineer", "supabase-postgres-engineer"].includes(agentId)) return "engineer";
    if (["frontend-design-lead", "marketing-copy-lead"].includes(agentId)) return "design";
    return "ops";
  }

  function visibleStations() {
    const depth = state.depth === "undecided" ? "quick" : state.depth;
    return state.stations.filter((s) => s.depths.includes(depth) || s.depths.includes("undecided"));
  }

  function fieldValue(name) {
    const el = document.querySelector('#panel-body [name="' + name + '"]');
    return el && "value" in el ? String(el.value).trim() : state.form[name] || "";
  }

  function collectPanelForm() {
    document.querySelectorAll("#panel-body [name]").forEach((el) => {
      if ("value" in el) state.form[el.name] = el.value;
    });
  }

  async function api(path, options) {
    const response = await fetch(path, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function loadState() {
    const data = await api("/api/state");
    state.form = data.form || {};
    state.progress = data.progress || {};
    state.onboarding = data.onboarding || {};
    state.depth = data.onboarding?.depth || "undecided";
    if (Array.isArray(data.agents) && data.agents.length) state.agents = data.agents;
    els.projectName.textContent = data.projectName || "your project";
    updateProgressUi();
    renderStationList();
    if (state.depth === "undecided") showDepthModal();
    else {
      els.depthModal.hidden = true;
      showOfficeHint();
    }
    renderNameplates();
  }

  function updateProgressUi() {
    const pct = state.progress?.percent ?? 0;
    els.progressPill.textContent = pct + "% ready";
  }

  function stationStatus(station) {
    if (station.kind === "agent" && station.agentId) {
      const brief = state.form["agentBrief_" + station.agentId]?.trim();
      return brief ? "done" : "open";
    }
    if (station.section === "ide") return state.form.ideSurface ? "done" : "open";
    if (station.section === "product") {
      return state.form.productSummary?.trim() && state.form.primaryAudience?.trim() ? "done" : "open";
    }
    if (station.section === "access") return state.form.authModel?.trim() ? "done" : "open";
    if (station.section === "ui") return state.form.uiPreferred?.trim() ? "done" : "open";
    if (station.section === "messaging") return state.form.valueProposition?.trim() ? "done" : "open";
    if (station.section === "visualQa") return state.form.visualQaTier ? "done" : "open";
    if (station.section === "designDoc") {
      return state.form.designAudience?.trim() || state.form.designContent?.trim() ? "done" : "open";
    }
    if (station.section === "messagingDoc") {
      return state.form.msgPain?.trim() || state.form.msgOutcome?.trim() ? "done" : "open";
    }
    return "open";
  }

  function renderStationList() {
    const items = visibleStations();
    els.stationList.innerHTML = items
      .map((s) => {
        const st = stationStatus(s);
        return (
          '<li><button type="button" data-station="' +
          s.id +
          '" class="' +
          (st === "done" ? "done" : "") +
          '">' +
          escapeHtml(s.label) +
          '<span class="chip">' +
          (st === "done" ? "✓" : "…") +
          "</span></button></li>"
        );
      })
      .join("");
    els.stationList.querySelectorAll("[data-station]").forEach((btn) => {
      btn.addEventListener("click", () => openStation(btn.getAttribute("data-station")));
    });
  }

  function showOfficeHint() {
    if (!els.officeHint) return;
    els.officeHint.classList.remove("hidden");
    window.clearTimeout(showOfficeHint._timer);
    showOfficeHint._timer = window.setTimeout(() => {
      els.officeHint.classList.add("hidden");
    }, 8000);
  }

  function renderNameplates() {
    if (!els.nameplateLayer || !els.canvasWrap) return;
    const canvasRect = els.canvas.getBoundingClientRect();
    const wrapRect = els.canvasWrap.getBoundingClientRect();
    const offsetLeft = canvasRect.left - wrapRect.left;
    const offsetTop = canvasRect.top - wrapRect.top;
    const scaleX = canvasRect.width / (MAP_W * TILE);
    const scaleY = canvasRect.height / (MAP_H * TILE);
    els.nameplateLayer.innerHTML = visibleStations()
      .map((station) => {
        const cx = offsetLeft + (station.x + station.w / 2) * TILE * scaleX;
        const cy = offsetTop + station.y * TILE * scaleY - 4;
        const st = stationStatus(station);
        return (
          '<span class="nameplate ' +
          st +
          '" style="left:' +
          cx +
          "px;top:" +
          cy +
          'px">' +
          escapeHtml(station.label) +
          "</span>"
        );
      })
      .join("");
  }

  function showDepthModal() {
    els.depthModal.hidden = false;
    els.depthGrid.innerHTML = [
      ["quick", "Quick (~10 min)", "IDE, agent briefings, product essentials."],
      ["standard", "Standard (~15 min)", "Quick plus visual QA station."],
      ["complete", "Complete (~25 min)", "Standard plus design and copy archives."]
    ]
      .map(
        ([id, title, desc]) =>
          '<button type="button" class="depth-card" data-depth="' +
          id +
          '"><strong>' +
          escapeHtml(title) +
          "</strong><p>" +
          escapeHtml(desc) +
          "</p></button>"
      )
      .join("");
    els.depthGrid.querySelectorAll("[data-depth]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.depth = btn.getAttribute("data-depth");
        await api("/api/state", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ depth: state.depth, currentSection: "ide" })
        });
        els.depthModal.hidden = true;
        renderStationList();
        renderNameplates();
        showOfficeHint();
        setStatus("ok", "Depth set to " + state.depth + ". Click a desk to brief an agent.");
      });
    });
  }

  function drawZoneLabel(station) {
    const x = station.x * TILE + 6;
    const y = station.y * TILE + station.h * TILE - 6;
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "8px monospace";
    ctx.fillText(station.label.slice(0, 14), x, y);
  }

  // --- Pixel drawing ---
  function fillRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawFloor() {
    for (let ty = 0; ty < MAP_H; ty += 1) {
      for (let tx = 0; tx < MAP_W; tx += 1) {
        const edge = tx === 0 || ty === 0 || tx === MAP_W - 1 || ty === MAP_H - 1;
        fillRect(tx * TILE, ty * TILE, TILE, TILE, edge ? "#475569" : (tx + ty) % 2 ? "#334155" : "#3f4f63");
      }
    }
  }

  function drawDesk(tx, ty, lampOn) {
    fillRect(tx * TILE, ty * TILE + 10, TILE * 3, 6, "#78716c");
    fillRect(tx * TILE + 4, ty * TILE + 4, TILE * 3 - 8, 8, "#a8a29e");
    fillRect(tx * TILE + TILE * 3 - 6, ty * TILE + 2, 4, 6, lampOn ? "#fbbf24" : "#64748b");
  }

  function drawZone(station, color) {
    const x = station.x * TILE;
    const y = station.y * TILE;
    const w = station.w * TILE;
    const h = station.h * TILE;
    fillRect(x + 2, y + 2, w - 4, h - 4, color);
    fillRect(x, y, w, 3, "#94a3b8");
    fillRect(x, y + h - 3, w, 3, "#64748b");
    fillRect(x, y, 3, h, "#94a3b8");
    fillRect(x + w - 3, y, 3, h, "#64748b");
  }

  function drawAgent(tx, ty, role, frame, lampOn) {
    drawDesk(tx, ty, lampOn);
    const colors = ROLE_COLORS[role] || ROLE_COLORS.ops;
    const bob = state.reducedMotion ? 0 : Math.sin(frame * 0.08) * 1;
    const ax = tx * TILE + 8;
    const ay = ty * TILE + 2 + bob;
    fillRect(ax + 4, ay, 8, 8, colors[0]);
    fillRect(ax + 2, ay + 8, 12, 10, colors[1]);
    fillRect(ax, ay + 10, 4, 6, colors[1]);
    fillRect(ax + 12, ay + 10, 4, 6, colors[1]);
    fillRect(ax + 5, ay + 2, 2, 2, "#fff");
    fillRect(ax + 9, ay + 2, 2, 2, "#fff");
  }

  function drawHighlight(station) {
    const x = station.x * TILE - 2;
    const y = station.y * TILE - 2;
    const w = station.w * TILE + 4;
    const h = station.h * TILE + 4;
    ctx.strokeStyle = "#99f6e4";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function drawLabel(station) {
    const st = stationStatus(station);
    if (st !== "done") return;
    const cx = (station.x + station.w / 2) * TILE;
    const cy = station.y * TILE - 4;
    fillRect(cx - 4, cy - 4, 8, 8, "#4ade80");
    fillRect(cx - 2, cy - 1, 4, 2, "#fff");
    fillRect(cx - 1, cy, 2, 3, "#fff");
  }

  function renderOffice() {
    ctx.imageSmoothingEnabled = false;
    drawFloor();
    const stations = visibleStations();
    for (const station of stations) {
      if (station.kind === "zone" || station.kind === "review") {
        const colors = {
          ide: "#1e3a5f",
          product: "#1e4035",
          access: "#4a1e1e",
          ui: "#3b1e4a",
          messaging: "#4a3a1e",
          visualQa: "#1e3a4a",
          designDoc: "#2a2a4a",
          messagingDoc: "#4a2a3a",
          review: "#1e4a3a"
        };
        drawZone(station, colors[station.id] || colors[station.section] || "#334155");
        drawZoneLabel(station);
      }
    }
    for (const station of stations) {
      if (station.kind === "agent" && station.agentId) {
        const role = agentRole(station.agentId);
        drawAgent(station.x, station.y, role, state.frame, stationStatus(station) === "done");
      }
      drawLabel(station);
    }
    if (state.hoverId) {
      const hovered = stations.find((s) => s.id === state.hoverId);
      if (hovered) drawHighlight(hovered);
    }
    if (state.frame % 30 === 0) renderNameplates();
  }

  function canvasCoords(event) {
    const rect = els.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * MAP_W * TILE;
    const y = ((event.clientY - rect.top) / rect.height) * MAP_H * TILE;
    return { x, y };
  }

  function hitTest(mx, my) {
    const stations = visibleStations().slice().reverse();
    for (const station of stations) {
      const x = station.x * TILE;
      const y = station.y * TILE;
      const w = station.w * TILE;
      const h = station.h * TILE;
      if (mx >= x && mx <= x + w && my >= y && my <= y + h) return station;
    }
    return null;
  }

  function inputField(name, label, hint, type, placeholder, optional) {
    const val = escapeHtml(state.form[name] || "");
    const req = optional ? "" : " required";
    if (type === "textarea") {
      return (
        "<label for=\"p-" +
        name +
        "\">" +
        escapeHtml(label) +
        (hint ? "<span>" + escapeHtml(hint) + "</span>" : "") +
        '</label><textarea id="p-' +
        name +
        '" name="' +
        name +
        '" placeholder="' +
        escapeHtml(placeholder || "") +
        '"' +
        req +
        ">" +
        val +
        "</textarea>"
      );
    }
    return (
      "<label for=\"p-" +
      name +
      "\">" +
      escapeHtml(label) +
      (hint ? "<span>" + escapeHtml(hint) + "</span>" : "") +
      '</label><input id="p-' +
      name +
      '" name="' +
      name +
      '" type="text" value="' +
      val +
      '" placeholder="' +
      escapeHtml(placeholder || "") +
      '"' +
      req +
      ">"
    );
  }

  function renderPanelContent(station) {
    if (station.kind === "agent" && station.agentId) {
      const agent = state.agents.find((a) => a.id === station.agentId);
      const field = "agentBrief_" + station.agentId;
      return (
        '<p class="agent-role">' +
        escapeHtml(agent?.roleSummary || "") +
        '</p><label for="p-' +
        field +
        '">Project briefing<span>Optional — what is unique about this project for ' +
        escapeHtml(station.label) +
        "?</span></label><textarea id=\"p-" +
        field +
        '" name="' +
        field +
        '" placeholder="Constraints, priorities, things not obvious from the repo…">' +
        escapeHtml(state.form[field] || "") +
        "</textarea>"
      );
    }

    const maps = {
      ide: () => {
        const opts = (boot.ideSurfaces || [])
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
          '<label for="p-ideSurface">Primary AI coding tool</label><select id="p-ideSurface" name="ideSurface" required><option value="">Choose…</option>' +
          opts +
          '</select><p class="why">Instructions load from the path your IDE reads.</p>'
        );
      },
      product: () =>
        inputField("productSummary", "Product summary", "One paragraph.", "textarea", "What does it do?", false) +
        '<label for="p-productCategory">Category</label><select id="p-productCategory" name="productCategory">' +
        (boot.categories || [])
          .map((c) => '<option value="' + c + '"' + (state.form.productCategory === c ? " selected" : "") + ">" + c + "</option>")
          .join("") +
        "</select>" +
        inputField("primaryAudience", "Primary audience", "", "text", "Who uses or pays?", false) +
        inputField("primaryWorkflows", "Top workflows", "One per line.", "textarea", "Workflow one", false),
      access: () =>
        '<label for="p-tenantModel">Who uses the system?</label><select id="p-tenantModel" name="tenantModel">' +
        (boot.tenantModels || [])
          .map((c) => '<option value="' + c + '"' + (state.form.tenantModel === c ? " selected" : "") + ">" + c + "</option>")
          .join("") +
        "</select>" +
        inputField("owner", "Project owner", "Optional.", "text", "", true) +
        (boot.hasSupabase
          ? '<div class="hint-box">Supabase detected.<button type="button" id="apply-supabase-auth">Insert auth baseline</button></div>'
          : "") +
        inputField("authModel", "Authentication model", "Rules agents must preserve.", "textarea", "Describe auth boundaries.", false),
      ui: () =>
        inputField("uiPreferred", "UI should feel like…", "", "textarea", "Clear, readable, task-first.", false) +
        inputField("uiAvoid", "UI should avoid…", "Optional.", "textarea", "Generic dashboards.", true),
      messaging: () => {
        const q = state.form.qualityTarget || "baseline-setup";
        return (
          inputField("valueProposition", "Value proposition", "", "textarea", "What outcome do users get?", false) +
          inputField("proof", "Proof points", "One per line.", "textarea", "", true) +
          inputField("objections", "Objections", "One per line.", "textarea", "", true) +
          '<label for="p-qualityTarget">Quality target</label><select id="p-qualityTarget" name="qualityTarget">' +
          ["baseline-setup", "needs-improvement", "best-practice-candidate"]
            .map((v) => '<option value="' + v + '"' + (q === v ? " selected" : "") + ">" + v + "</option>")
            .join("") +
          "</select>"
        );
      },
      visualQa: () => {
        const t = state.form.visualQaTier || "baseline";
        return (
          '<label for="p-visualQaTier">Visual QA tier</label><select id="p-visualQaTier" name="visualQaTier">' +
          [
            ["baseline", "Baseline — manual screenshot review"],
            ["strong", "Strong — Playwright + review"],
            ["mature", "Mature — visual regression CI"]
          ]
            .map(([v, l]) => '<option value="' + v + '"' + (t === v ? " selected" : "") + ">" + escapeHtml(l) + "</option>")
            .join("") +
          "</select>"
        );
      },
      designDoc: () =>
        inputField("designAudience", "Design audience", "", "text", state.form.primaryAudience || "", true) +
        inputField("designContent", "Content inventory", "", "textarea", "", true) +
        inputField("designAntiReferences", "Anti-references", "", "textarea", "", true),
      messagingDoc: () =>
        inputField("msgAudience", "Primary audience", "", "text", state.form.primaryAudience || "", true) +
        inputField("msgPain", "Painful problem", "", "textarea", "", true) +
        inputField("msgOutcome", "Desired outcome", "", "textarea", "", true),
      review: () => '<p class="why">Use Review &amp; save in the header when you are ready.</p>'
    };

    const section = station.section;
    return maps[section] ? maps[section]() : "<p>No fields for this station.</p>";
  }

  function openStation(stationId) {
    if (state.depth === "undecided") {
      showDepthModal();
      return;
    }
    const station = visibleStations().find((s) => s.id === stationId);
    if (!station) return;
    if (station.kind === "review") {
      openReview();
      return;
    }
    state.activeStationId = stationId;
    els.panelTitle.textContent = station.label;
    els.panelBody.innerHTML = renderPanelContent(station);
    els.panel.classList.remove("hidden");
    const applyBtn = document.getElementById("apply-supabase-auth");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const el = document.querySelector("#panel-body [name='authModel']");
        if (el) el.value = boot.recommendedSupabaseAuth || "";
      });
    }
    const first = els.panelBody.querySelector("input, textarea, select");
    if (first) first.focus();
  }

  function closePanel() {
    els.panel.classList.add("hidden");
    state.activeStationId = null;
  }

  async function savePanel() {
    collectPanelForm();
    const station = visibleStations().find((s) => s.id === state.activeStationId);
    if (!station) return;
    try {
      await api("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: state.form })
      });
      if (station.section === "ide" && fieldValue("ideSurface")) {
        await api("/api/checklist/ide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ideSurface: fieldValue("ideSurface") })
        });
      }
      if (station.section === "visualQa" && fieldValue("visualQaTier")) {
        await api("/api/checklist/visual-qa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: fieldValue("visualQaTier") })
        });
      }
      if (station.section === "designDoc") {
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
      if (station.section === "messagingDoc") {
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
      const data = await api("/api/state");
      state.progress = data.progress;
      updateProgressUi();
      renderStationList();
      closePanel();
      setStatus("ok", "Saved " + station.label);
    } catch (error) {
      setStatus("error", error.message);
    }
  }

  function openReview() {
    const ide = (boot.ideSurfaces || []).find((s) => s.id === state.form.ideSurface);
    const briefCount = Object.keys(state.form).filter((k) => k.startsWith("agentBrief_") && state.form[k]?.trim()).length;
    const items = [
      ["IDE", ide ? ide.label : state.form.ideSurface || "—"],
      ["Agent briefings", briefCount ? briefCount + " specialist(s)" : "—"],
      ["Product", state.form.productSummary || "—"],
      ["Audience", state.form.primaryAudience || "—"],
      ["Auth", state.form.authModel || "—"],
      ["Value prop", state.form.valueProposition || "—"],
      ["Quality", state.form.qualityTarget || "—"]
    ];
    els.reviewList.innerHTML = items.map(([k, v]) => "<div><dt>" + escapeHtml(k) + "</dt><dd>" + escapeHtml(v) + "</dd></div>").join("");
    els.reviewModal.classList.remove("hidden");
  }

  async function saveProject() {
    try {
      await api("/api/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.form)
      });
      els.reviewModal.classList.add("hidden");
      setStatus("ok", "Saved project context and agent briefings.");
      const data = await api("/api/state");
      state.progress = data.progress;
      updateProgressUi();
      renderStationList();
    } catch (error) {
      setStatus("error", error.message);
    }
  }

  // Events
  els.canvas.addEventListener("mousemove", (event) => {
    const { x, y } = canvasCoords(event);
    const hit = hitTest(x, y);
    state.hoverId = hit ? hit.id : null;
    if (hit) {
      els.hoverLabel.textContent = hit.label + (stationStatus(hit) === "done" ? " ✓" : "");
      els.hoverLabel.classList.remove("hidden");
      els.hoverLabel.style.left = event.clientX + 12 + "px";
      els.hoverLabel.style.top = event.clientY + 12 + "px";
    } else {
      els.hoverLabel.classList.add("hidden");
    }
  });

  els.canvas.addEventListener("mouseleave", () => {
    state.hoverId = null;
    els.hoverLabel.classList.add("hidden");
  });

  els.canvas.addEventListener("click", (event) => {
    const { x, y } = canvasCoords(event);
    const hit = hitTest(x, y);
    if (hit) openStation(hit.id);
  });

  els.panelClose.addEventListener("click", closePanel);
  els.panelCancel.addEventListener("click", closePanel);
  els.panelSave.addEventListener("click", savePanel);
  els.reviewBtn.addEventListener("click", openReview);
  els.reviewCancel.addEventListener("click", () => els.reviewModal.classList.add("hidden"));
  els.reviewSave.addEventListener("click", saveProject);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
      els.reviewModal.classList.add("hidden");
    }
  });

  function loop() {
    state.frame += 1;
    renderOffice();
    window.requestAnimationFrame(loop);
  }

  loop();
  loadState().catch((error) => setStatus("error", error.message));
  window.addEventListener("resize", () => renderNameplates());
})();
