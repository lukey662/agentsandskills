/* global OFFICE_BOOT */
(function officeApp() {
  const boot = window.OFFICE_BOOT || {};
  const isStudio = boot.mode === "studio";
  const TILE = boot.tileSize || 24;
  const SCALE = boot.scale || 4;
  const MAP_W = boot.mapWidth || 28;
  const MAP_H = boot.mapHeight || 18;
  const BREAK_RUG = { x: 11, y: 9, w: 7, h: 4 };
  const AMENITY_MSG = {
    coffee: ["Fresh brew — back to work!", "Caffeine acquired.", "One more espresso?"],
    cooler: ["Hydration break.", "Cold water hits different.", "Stay hydrated, ship faster."]
  };

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
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    depthSweep: null,
    confetti: [],
    handoffPulse: null,
    studioSessionId: boot.activeSessionId || "",
    studioEvents: [],
    speechBubbles: [],
    agenticLevel: null
  };

  const agentRuntime = {};

  const els = {
    canvas: document.getElementById("office-floor"),
    projectName: document.getElementById("project-name"),
    progressPill: document.getElementById("progress-pill"),
    levelPill: document.getElementById("level-pill"),
    icebergStrip: document.getElementById("iceberg-strip"),
    climbPanel: document.getElementById("climb-panel"),
    climbList: document.getElementById("climb-list"),
    climbRefresh: document.getElementById("climb-refresh"),
    sessionPill: document.getElementById("session-pill"),
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
    bubbleLayer: document.getElementById("bubble-layer"),
    officeHint: document.getElementById("office-hint"),
    canvasWrap: document.querySelector(".canvas-wrap"),
    transcriptList: document.getElementById("transcript-list")
  };

  const ctx = els.canvas?.getContext("2d");
  if (!ctx || !els.canvas) {
    if (els.status) {
      els.status.className = "status error";
      els.status.textContent = "Canvas failed to initialize.";
    }
    return;
  }

  const logicalW = MAP_W * TILE;
  const logicalH = MAP_H * TILE;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  els.canvas.width = logicalW * dpr;
  els.canvas.height = logicalH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  els.canvas.style.width = logicalW * SCALE + "px";
  els.canvas.style.height = logicalH * SCALE + "px";

  function wizardSectionForStation(station) {
    if (!station || station.kind === "amenity") return null;
    if (station.kind === "agent") return "team";
    if (station.section === "agent") return "team";
    return station.section;
  }

  function allAgentBriefsComplete() {
    const ids = state.agents.map((a) => a.id);
    if (!ids.length) return false;
    return ids.every((id) => Boolean(state.form["agentBrief_" + id]?.trim()));
  }

  function initAgentRuntime() {
    for (const station of state.stations) {
      if (station.kind !== "agent" || !station.agentId) continue;
      const hx = station.x + 1;
      const hy = station.y + 1;
      agentRuntime[station.agentId] = {
        tileX: hx,
        tileY: hy,
        targetX: hx,
        targetY: hy,
        homeX: hx,
        homeY: hy,
        state: "idle",
        direction: "down",
        frame: 0,
        breakTimer: 120 + Math.floor(Math.random() * 180),
        breakTarget: null
      };
    }
  }

  initAgentRuntime();

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

  function stationStatus(station) {
    const sectionId = wizardSectionForStation(station);
    if (!sectionId) return "open";
    const sections = state.progress?.sections || [];
    const match = sections.find((s) => s.id === sectionId);
    if (match) return match.status === "done" ? "done" : "open";
    return "open";
  }

  async function loadState() {
    if (isStudio) {
      await loadStudioState();
      return;
    }
    const data = await api("/api/state");
    state.form = data.form || {};
    state.progress = data.progress || {};
    state.onboarding = data.onboarding || {};
    state.depth = data.onboarding?.depth || "undecided";
    state.agenticLevel = data.agenticLevel || null;
    if (Array.isArray(data.agents) && data.agents.length) state.agents = data.agents;
    els.projectName.textContent = data.projectName || "your project";
    updateProgressUi();
    updateAgenticLevelUi();
    renderStationList();
    if (state.depth === "undecided") showDepthModal();
    else {
      els.depthModal.hidden = true;
      showOfficeHint();
    }
    renderNameplates();
  }

  async function loadStudioState() {
    const sessionsRes = await api("/api/sessions");
    state.studioSessionId = sessionsRes.activeSessionId || boot.activeSessionId || "";
    if (els.sessionPill) {
      els.sessionPill.textContent = state.studioSessionId ? state.studioSessionId.slice(0, 24) : "No session";
    }
    if (els.projectName) els.projectName.textContent = sessionsRes.sessions?.[0]?.title || "Council session";
    if (els.officeHint) {
      els.officeHint.classList.remove("hidden");
      window.setTimeout(() => els.officeHint?.classList.add("hidden"), 6000);
    }
    connectStudioStream();
  }

  function connectStudioStream() {
    if (!state.studioSessionId) return;
    const url = "/api/events/stream?sessionId=" + encodeURIComponent(state.studioSessionId);
    const source = new EventSource(url);
    source.addEventListener("snapshot", (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        state.studioEvents = payload.events || [];
        renderTranscript();
      } catch {
        // ignore
      }
    });
    source.addEventListener("event", (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload.event) {
          state.studioEvents.push(payload.event);
          renderTranscript();
          handleStudioEvent(payload.event);
        }
      } catch {
        // ignore
      }
    });
    source.onerror = () => {
      source.close();
    };
  }

  function eventLabel(event) {
    if (event.text) return event.text;
    if (event.decision) return event.decision;
    if (event.type === "handoff") return "Handoff → " + (event.toAgentId || "?");
    if (event.command) return event.command;
    return event.type;
  }

  function renderTranscript() {
    if (!els.transcriptList) return;
    els.transcriptList.innerHTML = state.studioEvents
      .slice(-80)
      .map(
        (ev) =>
          '<li><span class="tx-time">' +
          escapeHtml((ev.createdAt || "").slice(11, 19)) +
          "</span> <strong>" +
          escapeHtml(ev.agentId || ev.fromAgentId || "session") +
          "</strong> " +
          escapeHtml(eventLabel(ev)) +
          "</li>"
      )
      .join("");
    els.transcriptList.scrollTop = els.transcriptList.scrollHeight;
  }

  function handleStudioEvent(event) {
    const agentId = event.agentId || event.fromAgentId;
    if (agentId && agentRuntime[agentId]) {
      agentRuntime[agentId].state = event.type === "handoff" ? "walking" : "working";
      addSpeechBubble(agentId, eventLabel(event));
    }
    if (event.type === "handoff" && event.fromAgentId && event.toAgentId) {
      state.handoffPulse = { frame: 0, from: event.fromAgentId, to: event.toAgentId };
      const toRt = agentRuntime[event.toAgentId];
      if (toRt) {
        toRt.state = "walking";
        toRt.targetX = toRt.homeX;
        toRt.targetY = toRt.homeY;
      }
    }
  }

  function addSpeechBubble(agentId, text) {
    const station = state.stations.find((s) => s.agentId === agentId);
    if (!station) return;
    const rt = agentRuntime[agentId];
    const cx = (rt ? rt.tileX : station.x + 1) * TILE;
    const cy = (rt ? rt.tileY : station.y) * TILE;
    state.speechBubbles.push({
      agentId,
      text: String(text).slice(0, 72),
      x: cx,
      y: cy - 8,
      frame: 0,
      ttl: state.reducedMotion ? 120 : 240
    });
    renderSpeechDom();
  }

  function renderSpeechDom() {
    if (!els.bubbleLayer) return;
    const canvasRect = els.canvas.getBoundingClientRect();
    const wrapRect = els.canvasWrap?.getBoundingClientRect() || canvasRect;
    const offsetLeft = canvasRect.left - wrapRect.left;
    const offsetTop = canvasRect.top - wrapRect.top;
    const scaleX = canvasRect.width / logicalW;
    const scaleY = canvasRect.height / logicalH;
    els.bubbleLayer.innerHTML = state.speechBubbles
      .map((b) => {
        const left = offsetLeft + b.x * scaleX;
        const top = offsetTop + b.y * scaleY - 28;
        return '<span class="speech-bubble" style="left:' + left + "px;top:" + top + 'px">' + escapeHtml(b.text) + "</span>";
      })
      .join("");
  }

  function updateProgressUi() {
    const pct = state.progress?.percent ?? 0;
    if (els.progressPill) els.progressPill.textContent = pct + "% ready";
  }

  function updateAgenticLevelUi() {
    const level = state.agenticLevel;
    if (!level || isStudio) return;
    const current = level.currentLevel ?? 3;
    const target = level.targetLevel ?? 5;
    if (els.levelPill) {
      els.levelPill.textContent = "L" + current + " → L" + target;
      els.levelPill.setAttribute("aria-label", "Agentic engineering level " + current + ", target level " + target);
    }
    if (els.icebergStrip) {
      els.icebergStrip.innerHTML = [3, 4, 5, 6, 7, 8]
        .map((n) => {
          let cls = "iceberg-seg";
          if (n === current) cls += " current";
          if (n === target && n !== current) cls += " target";
          if (n >= 7) cls += " deferred";
          return '<span class="' + cls + '">L' + n + "</span>";
        })
        .join("");
    }
    const steps = level.climbSteps || [];
    if (els.climbPanel && els.climbList) {
      if (current >= target || steps.length === 0) {
        els.climbPanel.hidden = true;
      } else {
        els.climbPanel.hidden = false;
        els.climbList.innerHTML = steps
          .slice(0, 3)
          .map((step) => "<li><strong>L" + step.level + "</strong> " + escapeHtml(step.label) + " — " + escapeHtml(step.remediation) + "</li>")
          .join("");
      }
    }
    if (level.maintainerNote && els.status && !els.status.textContent) {
      setStatus("ok", level.maintainerNote);
    }
  }

  if (els.climbRefresh) {
    els.climbRefresh.addEventListener("click", async () => {
      try {
        const data = await api("/api/agentic-level/refresh", { method: "POST" });
        state.agenticLevel = data.agenticLevel;
        state.progress = data.progress;
        updateAgenticLevelUi();
        setStatus("ok", "Agentic level refreshed.");
      } catch (error) {
        setStatus("error", error.message);
      }
    });
  }

  function spawnConfetti(x, y) {
    if (state.reducedMotion) return;
    for (let i = 0; i < 12; i += 1) {
      state.confetti.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 0.5,
        color: ["#4ade80", "#99f6e4", "#fbbf24", "#f472b6"][i % 4],
        ttl: 60 + Math.floor(Math.random() * 30)
      });
    }
  }

  function renderStationList() {
    if (!els.stationList) return;
    const items = visibleStations().filter((s) => s.kind !== "amenity");
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
    const scaleX = canvasRect.width / logicalW;
    const scaleY = canvasRect.height / logicalH;
    els.nameplateLayer.innerHTML = visibleStations()
      .filter((s) => s.kind !== "amenity")
      .map((station) => {
        const cx = offsetLeft + (station.x + station.w / 2) * TILE * scaleX;
        const cy = offsetTop + station.y * TILE * scaleY - 4;
        const st = stationStatus(station);
        return '<span class="nameplate ' + st + '" style="left:' + cx + "px;top:" + cy + 'px">' + escapeHtml(station.label) + "</span>";
      })
      .join("");
  }

  function showDepthModal() {
    if (!els.depthModal) return;
    els.depthModal.hidden = false;
    els.depthGrid.innerHTML = [
      ["quick", "Quick (~10 min)", "IDE, agent briefings, product essentials."],
      ["standard", "Standard (~15 min)", "Quick plus visual QA station."],
      ["complete", "Complete (~25 min)", "Standard plus design and copy archives."]
    ]
      .map(
        ([id, title, desc]) =>
          '<button type="button" class="depth-card" data-depth="' + id + '"><strong>' + escapeHtml(title) + "</strong><p>" + escapeHtml(desc) + "</p></button>"
      )
      .join("");
    els.depthGrid.querySelectorAll("[data-depth]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.depth = btn.getAttribute("data-depth");
        state.depthSweep = { frame: 0, depth: state.depth };
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

  function fillRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function inBreakRug(tx, ty) {
    return tx >= BREAK_RUG.x && tx < BREAK_RUG.x + BREAK_RUG.w && ty >= BREAK_RUG.y && ty < BREAK_RUG.y + BREAK_RUG.h;
  }

  function drawFloor() {
    for (let ty = 0; ty < MAP_H; ty += 1) {
      for (let tx = 0; tx < MAP_W; tx += 1) {
        const edge = tx === 0 || ty === 0 || tx === MAP_W - 1 || ty === MAP_H - 1;
        let base = (tx + ty) % 2 ? "#334155" : "#3f4f63";
        if (inBreakRug(tx, ty)) base = (tx + ty) % 2 ? "#4a3728" : "#5c4433";
        fillRect(tx * TILE, ty * TILE, TILE, TILE, edge ? "#475569" : base);
      }
    }
    for (let wx = 3; wx < MAP_W - 3; wx += 7) {
      fillRect(wx * TILE + 4, 2, TILE - 8, 6, "#bae6fd");
      fillRect(wx * TILE + 6, 4, TILE - 12, 2, "#e0f2fe");
    }
    fillRect(BREAK_RUG.x * TILE, BREAK_RUG.y * TILE, BREAK_RUG.w * TILE, 3, "#78716c");
  }

  function drawZoneProps(station) {
    const x = station.x * TILE;
    const y = station.y * TILE;
    if (station.id === "ide") {
      fillRect(x + 8, y + 8, TILE - 4, TILE - 8, "#0ea5e9");
      fillRect(x + TILE, y + 10, 6, 4, "#38bdf8");
    } else if (station.id === "product") {
      fillRect(x + 10, y + 6, TILE * 2, 8, "#fef08a");
      fillRect(x + TILE * 2, y + 8, 4, 12, "#ca8a04");
    } else if (station.id === "access") {
      fillRect(x + TILE, y + TILE, 8, TILE, "#991b1b");
      fillRect(x + TILE + 2, y + TILE + 4, 4, 8, "#fca5a5");
    } else if (station.id === "review") {
      fillRect(x + 12, y + 6, TILE * 2, TILE - 4, "#ecfccb");
    }
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
    drawZoneProps(station);
  }

  function drawZoneLabel(station) {
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "9px monospace";
    ctx.fillText(station.label.slice(0, 14), station.x * TILE + 6, station.y * TILE + station.h * TILE - 6);
  }

  function drawDesk(tx, ty, lampOn, working) {
    fillRect(tx * TILE, ty * TILE + TILE - 8, TILE * 3, 8, "#78716c");
    fillRect(tx * TILE + 6, ty * TILE + 8, TILE * 3 - 12, 12, "#a8a29e");
    fillRect(tx * TILE + TILE * 3 - 10, ty * TILE + 4, 6, 10, lampOn ? "#fbbf24" : "#64748b");
    if (working) {
      fillRect(tx * TILE + 10, ty * TILE + 10, TILE * 2 - 8, 10, "#1e293b");
      fillRect(tx * TILE + 12, ty * TILE + 12, TILE * 2 - 12, 6, "#38bdf8");
    }
  }

  function drawAgentSprite(px, py, role, frame, working) {
    const colors = ROLE_COLORS[role] || ROLE_COLORS.ops;
    const bob = state.reducedMotion ? 0 : Math.sin(frame * 0.08) * 1;
    const ax = px + 8;
    const ay = py + bob;
    fillRect(ax + 6, ay, 10, 10, colors[0]);
    fillRect(ax + 4, ay + 10, 14, 12, colors[1]);
    fillRect(ax + 2, ay + 12, 5, 8, colors[1]);
    fillRect(ax + 15, ay + 12, 5, 8, colors[1]);
    fillRect(ax + 7, ay + 3, 2, 2, "#fff");
    fillRect(ax + 11, ay + 3, 2, 2, "#fff");
    if (working) {
      fillRect(ax + 16, ay + 14, 8, 4, "#64748b");
    }
  }

  function drawAgentAtDesk(station, frame, working) {
    drawDesk(station.x, station.y, stationStatus(station) === "done", working);
    const role = agentRole(station.agentId);
    drawAgentSprite(station.x * TILE, station.y * TILE + 2, role, frame, working);
  }

  function drawAgent(station, frame) {
    const rt = agentRuntime[station.agentId];
    const working = rt?.state === "working" || (state.activeStationId === station.id && !isStudio);
    if (rt && (rt.state === "walking" || rt.state === "break")) {
      const px = rt.tileX * TILE;
      const py = rt.tileY * TILE;
      drawAgentSprite(px, py, agentRole(station.agentId), rt.frame, false);
      return;
    }
    drawAgentAtDesk(station, frame, working);
  }

  function drawAmenity(station) {
    const x = station.x * TILE;
    const y = station.y * TILE;
    if (station.amenityId === "coffee") {
      fillRect(x + 4, y + 6, TILE + 8, TILE - 4, "#57534e");
      fillRect(x + 10, y + 2, 10, 8, "#292524");
      if (!state.reducedMotion) {
        const steam = Math.sin(state.frame * 0.12 + x) * 2;
        fillRect(x + 12, y - 4 + steam, 3, 6, "rgba(255,255,255,0.35)");
        fillRect(x + 18, y - 6 + steam * 0.8, 3, 8, "rgba(255,255,255,0.25)");
      }
    } else if (station.amenityId === "cooler") {
      fillRect(x + 2, y + 4, TILE + 4, TILE * 2 - 6, "#e2e8f0");
      fillRect(x + 8, y + 8, 8, 10, "#38bdf8");
      if (!state.reducedMotion && state.frame % 20 < 10) {
        fillRect(x + 20, y + 6, 2, 2, "#fef08a");
        fillRect(x + 22, y + 10, 2, 2, "#fef08a");
      }
    }
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
    if (stationStatus(station) !== "done") return;
    const cx = (station.x + station.w / 2) * TILE;
    const cy = station.y * TILE - 4;
    fillRect(cx - 5, cy - 5, 10, 10, "#4ade80");
    fillRect(cx - 3, cy - 1, 6, 2, "#fff");
    fillRect(cx - 1, cy, 2, 4, "#fff");
  }

  function drawDepthSweep() {
    if (!state.depthSweep) return;
    state.depthSweep.frame += 1;
    const alpha = Math.max(0, 1 - state.depthSweep.frame / 90);
    ctx.fillStyle = "rgba(153, 246, 228, " + alpha * 0.25 + ")";
    ctx.fillRect(0, 0, logicalW, logicalH);
    if (state.depthSweep.frame > 90) state.depthSweep = null;
  }

  function drawConfetti() {
    state.confetti = state.confetti.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.ttl -= 1;
      fillRect(p.x, p.y, 3, 3, p.color);
      return p.ttl > 0;
    });
  }

  function drawHandoffPulse() {
    if (!state.handoffPulse) return;
    state.handoffPulse.frame += 1;
    const fromSt = state.stations.find((s) => s.agentId === state.handoffPulse.from);
    const toSt = state.stations.find((s) => s.agentId === state.handoffPulse.to);
    if (fromSt && toSt) {
      const fx = (fromSt.x + 1) * TILE;
      const fy = (fromSt.y + 1) * TILE;
      const tx = (toSt.x + 1) * TILE;
      const ty = (toSt.y + 1) * TILE;
      const t = state.handoffPulse.frame / 60;
      const alpha = Math.max(0, 1 - t);
      ctx.strokeStyle = "rgba(251, 191, 36, " + alpha + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    if (state.handoffPulse.frame > 60) state.handoffPulse = null;
  }

  function updateAgents() {
    if (state.reducedMotion || isStudio) return;
    for (const station of state.stations) {
      if (station.kind !== "agent" || !station.agentId) continue;
      const rt = agentRuntime[station.agentId];
      if (!rt) continue;
      rt.frame += 1;

      const panelOpenForThis = state.activeStationId === station.id;
      if (panelOpenForThis) {
        rt.state = "working";
        rt.targetX = rt.homeX;
        rt.targetY = rt.homeY;
      } else if (rt.state === "working") {
        rt.state = "idle";
      }

      if (rt.state === "idle" || rt.state === "break") {
        rt.breakTimer -= 1;
        if (rt.breakTimer <= 0 && rt.state === "idle") {
          const amenity = state.stations.find((s) => s.kind === "amenity" && s.amenityId);
          if (amenity) {
            rt.state = "break";
            rt.breakTarget = amenity.amenityId;
            rt.targetX = amenity.x + amenity.w / 2;
            rt.targetY = amenity.y + amenity.h / 2;
          }
          rt.breakTimer = 180 + Math.floor(Math.random() * 240);
        }
        if (rt.state === "break" && Math.abs(rt.tileX - rt.targetX) < 0.05 && Math.abs(rt.tileY - rt.targetY) < 0.05) {
          if (rt.breakTimer <= 60) {
            rt.state = "walking";
            rt.targetX = rt.homeX;
            rt.targetY = rt.homeY;
          }
        }
      }

      if (rt.state === "walking" || rt.state === "break") {
        const speed = 0.06;
        const dx = rt.targetX - rt.tileX;
        const dy = rt.targetY - rt.tileY;
        if (Math.abs(dx) < 0.04 && Math.abs(dy) < 0.04) {
          rt.tileX = rt.targetX;
          rt.tileY = rt.targetY;
          if (rt.state === "walking" && rt.tileX === rt.homeX && rt.tileY === rt.homeY) rt.state = "idle";
        } else {
          rt.tileX += Math.sign(dx) * Math.min(Math.abs(dx), speed);
          rt.tileY += Math.sign(dy) * Math.min(Math.abs(dy), speed);
          rt.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
        }
      }
    }
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
          applyDrafts: "#2a4a3a",
          review: "#1e4a3a"
        };
        drawZone(station, colors[station.id] || colors[station.section] || "#334155");
        drawZoneLabel(station);
      }
      if (station.kind === "amenity") drawAmenity(station);
    }
    for (const station of stations) {
      if (station.kind === "agent" && station.agentId) drawAgent(station, state.frame);
      drawLabel(station);
    }
    drawDepthSweep();
    drawHandoffPulse();
    drawConfetti();
    state.speechBubbles = state.speechBubbles.filter((b) => {
      b.frame += 1;
      return b.frame < b.ttl;
    });
    if (state.frame % 30 === 0) {
      renderNameplates();
      renderSpeechDom();
    }
    if (state.hoverId) {
      const hovered = stations.find((s) => s.id === state.hoverId);
      if (hovered) drawHighlight(hovered);
    }
  }

  function canvasCoords(event) {
    const rect = els.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * logicalW;
    const y = ((event.clientY - rect.top) / rect.height) * logicalH;
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
        '<label for="p-' +
        name +
        '">' +
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
      '<label for="p-' +
      name +
      '">' +
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
        '?</span></label><textarea id="p-' +
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
          .map((s) => '<option value="' + s.id + '"' + (state.form.ideSurface === s.id ? " selected" : "") + ">" + escapeHtml(s.label) + "</option>")
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
        (boot.tenantModels || []).map((c) => '<option value="' + c + '"' + (state.form.tenantModel === c ? " selected" : "") + ">" + c + "</option>").join("") +
        "</select>" +
        inputField("owner", "Project owner", "Optional.", "text", "", true) +
        (boot.hasSupabase ? '<div class="hint-box">Supabase detected.<button type="button" id="apply-supabase-auth">Insert auth baseline</button></div>' : "") +
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
    if (isStudio) return;
    if (state.depth === "undecided") {
      showDepthModal();
      return;
    }
    const station = visibleStations().find((s) => s.id === stationId);
    if (!station) return;
    if (station.kind === "amenity") {
      const msgs = AMENITY_MSG[station.amenityId] || ["Nice break."];
      setStatus("ok", msgs[Math.floor(Math.random() * msgs.length)]);
      return;
    }
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

  async function markStationProgress(station) {
    const sectionId = wizardSectionForStation(station);
    if (!sectionId) return;
    if (sectionId === "team" && !allAgentBriefsComplete()) return;
    const prev = stationStatus(station);
    await api("/api/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completeSection: sectionId, currentSection: sectionId })
    });
    const data = await api("/api/state");
    state.progress = data.progress;
    state.onboarding = data.onboarding;
    if (prev !== "done" && stationStatus(station) === "done") {
      const cx = (station.x + station.w / 2) * TILE;
      const cy = station.y * TILE;
      spawnConfetti(cx, cy);
    }
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
      await markStationProgress(station);
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

  if (!isStudio) {
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

    if (els.panelClose) els.panelClose.addEventListener("click", closePanel);
    if (els.panelCancel) els.panelCancel.addEventListener("click", closePanel);
    if (els.panelSave) els.panelSave.addEventListener("click", savePanel);
    if (els.reviewBtn) els.reviewBtn.addEventListener("click", openReview);
    if (els.reviewCancel) els.reviewCancel.addEventListener("click", () => els.reviewModal.classList.add("hidden"));
    if (els.reviewSave) els.reviewSave.addEventListener("click", saveProject);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
        if (els.reviewModal) els.reviewModal.classList.add("hidden");
      }
    });
  }

  function loop() {
    state.frame += 1;
    updateAgents();
    renderOffice();
    window.requestAnimationFrame(loop);
  }

  loop();
  loadState().catch((error) => setStatus("error", error.message));
  window.addEventListener("resize", () => {
    renderNameplates();
    renderSpeechDom();
  });
})();
