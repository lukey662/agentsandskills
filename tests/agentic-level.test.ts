import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { activateIdeTargets } from "../src/install/ide-activate.js";
import { applySetupFormAnswers } from "../src/studio/setup-form.js";
import {
  computeAgenticLevel,
  invalidateAgenticLevelCache,
  isMaintainerSourceRepo
} from "../src/studio/agentic-level.js";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agent-kit-agentic-level-"));
  invalidateAgenticLevelCache(root);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("agentic level", () => {
  it("detects maintainer source repo profile", () => {
    expect(isMaintainerSourceRepo(process.cwd())).toBe(true);
    initProject({ cwd: root });
    expect(isMaintainerSourceRepo(root)).toBe(false);
  });

  it("computes at least L3 after init with cursor rules", () => {
    initProject({ cwd: root });
    const report = computeAgenticLevel(root, { forceRefresh: true });
    expect(report.currentLevel).toBeGreaterThanOrEqual(3);
    expect(report.targetLevel).toBe(5);
    expect(report.maintainerProfile).toBe(false);
    expect(report.signals.some((s) => s.id === "l3-ide" && s.pass)).toBe(true);
  });

  it("computes L5 after cursor activation with subagents", () => {
    initProject({ cwd: root });
    applySetupFormAnswers(root, {
      productSummary: "A task-first SaaS for teams.",
      productCategory: "saas",
      primaryAudience: "Engineering leads",
      primaryWorkflows: "Sign up\nConfigure project\nShip feature",
      tenantModel: "team",
      owner: "engineering",
      authModel: "Supabase Auth with RLS per tenant",
      uiPreferred: "Clear hierarchy",
      uiAvoid: "Generic heroes",
      valueProposition: "Ship with council gates",
      proof: "Dogfood audits",
      objections: "Too much process",
      qualityTarget: "baseline-setup"
    });
    activateIdeTargets({ cwd: root, targets: ["cursor"] });
    const report = computeAgenticLevel(root, { forceRefresh: true });
    expect(report.signals.find((s) => s.id === "l5-subagents")?.pass).toBe(true);
    expect(report.currentLevel).toBeGreaterThanOrEqual(5);
  });

  it("includes climb steps when below target", () => {
    initProject({ cwd: root });
    const report = computeAgenticLevel(root, { forceRefresh: true });
    expect(report.targetLevel).toBe(5);
    if (report.currentLevel < 5) {
      expect(report.climbSteps.length).toBeGreaterThan(0);
    }
  });

  it("raises L4 when project context is complete", () => {
    initProject({ cwd: root });
    applySetupFormAnswers(root, {
      productSummary: "A task-first SaaS for teams.",
      productCategory: "saas",
      primaryAudience: "Engineering leads",
      primaryWorkflows: "Sign up\nConfigure project\nShip feature",
      tenantModel: "team",
      owner: "engineering",
      authModel: "Supabase Auth with RLS per tenant",
      uiPreferred: "Clear hierarchy",
      uiAvoid: "Generic heroes",
      valueProposition: "Ship with council gates",
      proof: "Dogfood audits",
      objections: "Too much process",
      qualityTarget: "baseline-setup"
    });
    const report = computeAgenticLevel(root, { forceRefresh: true });
    expect(report.signals.find((s) => s.id === "l4-project-context")?.pass).toBe(true);
    expect(report.currentLevel).toBeGreaterThanOrEqual(4);
  });

  it("uses maintainer profile and L6 target on kit source repo", () => {
    const report = computeAgenticLevel(process.cwd(), { forceRefresh: true });
    expect(report.maintainerProfile).toBe(true);
    expect(report.targetLevel).toBe(6);
    expect(report.maintainerNote).toContain("dogfood:init");
  });
});
