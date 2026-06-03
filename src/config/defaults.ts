import type { AgentKitConfig } from "./types.js";

export const PACKAGE_NAME = "@agent-skills/next-supabase-kit";
export const PACKAGE_VERSION = "0.1.0";

export const DEFAULT_CONFIG: AgentKitConfig = {
  stack: "next-supabase",
  projectType: "saas",
  docsMode: "advisory",
  agentCouncil: {
    required: true,
    rosterPath: ".agent-kit/agent-roster.json",
    defaultWorkflow: "planning",
    coreChangeWorkflow: "core-change"
  },
  modelRouting: {
    required: true,
    routingPath: ".agent-kit/model-routing.json",
    reviewCadence: "quarterly-or-when-model-docs-change"
  },
  designProviders: ["stitch", "claude", "figma", "human"],
  research: {
    maxRepos: 100,
    githubTokenEnv: "GITHUB_TOKEN",
    workdir: "research/workdir"
  }
};

export const ROOT_DOCS = [
  "AGENTS.md",
  "AGENT_ROSTER.md",
  "ASSISTANT_ADAPTERS.md",
  "COUNCIL.md",
  "SKILLS.md",
  "SPEC.md",
  "DECISIONS.md",
  "DOCS.md",
  "DESIGN.md",
  "MODEL_ROUTING.md",
  "QUALITY_GATES.md",
  "STYLE_GUIDE.md",
  "SECURITY.md",
  "TESTING.md",
  "DEPLOYMENT.md",
  "UPGRADE.md"
] as const;

export const LIBRARY_FOLDERS = [
  "agents",
  "skills",
  "prompts",
  "checklists",
  "design-adapters",
  "assistant-adapters",
  "design-briefs",
  "profiles",
  "rosters",
  "schemas"
] as const;

export const DEFAULT_AGENT_ROSTER_SOURCE = "rosters/next-supabase-default-council.json";
export const DEFAULT_AGENT_ROSTER_TARGET = ".agent-kit/agent-roster.json";
export const DEFAULT_MODEL_ROUTING_SOURCE = "model-routing/default-model-routing.json";
export const DEFAULT_MODEL_ROUTING_TARGET = ".agent-kit/model-routing.json";
