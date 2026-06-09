import type { AgentKitConfig } from "./types.js";

export const PACKAGE_NAME = "@appsforgood/next-supabase-kit";
export const PACKAGE_VERSION = "0.1.2";

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
  "MESSAGING.md",
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

export const CURSOR_ADAPTER_FILES = [
  {
    source: "assistant-adapters/cursor-agent-kit.mdc",
    target: ".cursor/rules/cursor-agent-kit.mdc"
  },
  {
    source: "assistant-adapters/model-selection/cursor-model-selection.mdc",
    target: ".cursor/rules/cursor-model-selection.mdc"
  }
] as const;
