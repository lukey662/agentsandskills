export type WizardDepth = "quick" | "standard" | "complete" | "undecided";

export type WizardSectionId =
  "home" | "team" | "product" | "access" | "ui" | "messaging" | "review" | "complete" | "ide" | "visualQa" | "designDoc" | "messagingDoc" | "applyDrafts";

export interface WizardStepDef {
  id: string;
  section: WizardSectionId;
  title: string;
  why: string;
  fields: string[];
  depth: WizardDepth[];
  optional?: boolean;
  agentId?: string;
  agentName?: string;
  roleSummary?: string;
}

export const WIZARD_VERSION = "1.0.0";

export const SECTION_LABELS: Record<WizardSectionId, string> = {
  home: "Home",
  team: "Agent team",
  product: "Product",
  access: "Access",
  ui: "UI",
  messaging: "Messaging",
  review: "Review",
  complete: "Done",
  ide: "Your IDE",
  visualQa: "Visual QA",
  designDoc: "Design intake",
  messagingDoc: "Copy intake",
  applyDrafts: "Apply drafts"
};

export const QUICK_SECTIONS: WizardSectionId[] = ["ide", "team", "product", "access", "ui", "messaging", "review"];

export const STANDARD_SECTIONS: WizardSectionId[] = [...QUICK_SECTIONS, "visualQa"];

export const COMPLETE_SECTIONS: WizardSectionId[] = [...STANDARD_SECTIONS, "designDoc", "messagingDoc", "applyDrafts"];

export const WIZARD_STEPS: WizardStepDef[] = [
  {
    id: "ide-surface",
    section: "ide",
    title: "Which AI coding tool do you use?",
    why: "We wire project instructions to the path your IDE actually loads — Cursor rules, Copilot instructions, Claude agents, or AGENTS.md.",
    fields: ["ideSurface"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "product-summary",
    section: "product",
    title: "What does this product do?",
    why: "Agents need a concrete summary before they guess from folder names.",
    fields: ["productSummary"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "product-audience",
    section: "product",
    title: "Who is the primary user or buyer?",
    why: "Audience shapes UX, copy tone, and which workflows matter most.",
    fields: ["productCategory", "primaryAudience"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "product-workflows",
    section: "product",
    title: "What are the top workflows?",
    why: "Naming real workflows stops agents from inventing generic SaaS screens.",
    fields: ["primaryWorkflows"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "access-tenant",
    section: "access",
    title: "Who uses the system?",
    why: "Single-user, team, and tenant models need different auth and data boundaries.",
    fields: ["tenantModel", "owner"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "access-auth",
    section: "access",
    title: "What authentication model must agents preserve?",
    why: "Auth regressions are common when agents refactor routes or Supabase clients.",
    fields: ["authModel"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "ui-preferred",
    section: "ui",
    title: "How should the UI feel?",
    why: "Explicit direction reduces generic AI dashboard layouts.",
    fields: ["uiPreferred"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "ui-avoid",
    section: "ui",
    title: "What should the UI avoid?",
    why: "Anti-patterns are as important as positive direction for frontend agents.",
    fields: ["uiAvoid"],
    depth: ["quick", "standard", "complete", "undecided"],
    optional: true
  },
  {
    id: "messaging-value",
    section: "messaging",
    title: "What is the value proposition?",
    why: "Public copy agents need a stated outcome, not invented marketing fluff.",
    fields: ["valueProposition"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "messaging-proof",
    section: "messaging",
    title: "What proof supports your claims?",
    why: "Claims without proof should stay marked provisional in MESSAGING.md.",
    fields: ["proof", "objections"],
    depth: ["quick", "standard", "complete", "undecided"],
    optional: true
  },
  {
    id: "messaging-quality",
    section: "messaging",
    title: "What quality target fits this project now?",
    why: "Sets audit expectations: baseline setup vs aiming for a fully clean audit.",
    fields: ["qualityTarget"],
    depth: ["quick", "standard", "complete", "undecided"]
  },
  {
    id: "visual-qa-tier",
    section: "visualQa",
    title: "Which visual QA tier fits this project?",
    why: "TESTING.md should name the smallest reliable visual evidence for UI changes.",
    fields: ["visualQaTier"],
    depth: ["standard", "complete"],
    optional: true
  },
  {
    id: "design-intake",
    section: "designDoc",
    title: "Design direction intake",
    why: "DESIGN.md needs audience, content inventory, and anti-references before UI work.",
    fields: ["designAudience", "designContent", "designAntiReferences"],
    depth: ["complete"],
    optional: true
  },
  {
    id: "messaging-intake",
    section: "messagingDoc",
    title: "Messaging discovery intake",
    why: "MESSAGING.md needs audience pain, outcome, and objections in customer language.",
    fields: ["msgAudience", "msgPain", "msgOutcome"],
    depth: ["complete"],
    optional: true
  },
  {
    id: "apply-drafts",
    section: "applyDrafts",
    title: "Review and apply doc drafts",
    why: "Preview generated snippets before they update DESIGN.md or MESSAGING.md.",
    fields: [],
    depth: ["complete"],
    optional: true
  }
];

export function sectionsForDepth(depth: WizardDepth): WizardSectionId[] {
  if (depth === "complete") return COMPLETE_SECTIONS;
  if (depth === "standard") return STANDARD_SECTIONS;
  return QUICK_SECTIONS;
}

export function stepsForDepth(depth: WizardDepth): WizardStepDef[] {
  return WIZARD_STEPS.filter((step) => step.depth.includes(depth));
}
