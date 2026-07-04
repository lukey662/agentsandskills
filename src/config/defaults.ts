import type { AgentKitConfig } from "./types.js";

export const PACKAGE_NAME = "@appsforgood/next-supabase-kit";
export const PACKAGE_VERSION = "0.1.7";

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
  "LOOP_CODING.md",
  "DEPLOYMENT.md",
  "UPGRADE.md"
] as const;

export const LIBRARY_FOLDERS = [
  "agents",
  "skills",
  "prompts",
  "checklists",
  "runtime-skills",
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

export const CURSOR_SCOPED_ADAPTER_FILES = [
  {
    source: "assistant-adapters/cursor-planner.mdc",
    target: ".cursor/rules/cursor-planner.mdc"
  },
  {
    source: "assistant-adapters/cursor-security.mdc",
    target: ".cursor/rules/cursor-security.mdc"
  },
  {
    source: "assistant-adapters/cursor-frontend.mdc",
    target: ".cursor/rules/cursor-frontend.mdc"
  }
] as const;

export const COPILOT_INSTRUCTION_FILES = [
  {
    source: "assistant-adapters/github-copilot-instructions.md",
    target: ".github/copilot-instructions.md"
  },
  {
    source: "assistant-adapters/github-next-supabase.instructions.md",
    target: ".github/instructions/next-supabase.instructions.md"
  }
] as const;

export const CODEX_CONFIG_SOURCE = "assistant-adapters/model-selection/codex-config.example.toml";
export const CLAUDE_TEMPLATE = "templates/next-supabase/CLAUDE.md";

export const ANTIGRAVITY_PLUGIN_FILES = [
  {
    source: "antigravity/plugin.json",
    target: ".antigravity/agent-kit/plugin.json"
  },
  {
    source: "assistant-adapters/antigravity.md",
    target: ".antigravity/agent-kit/README.md"
  }
] as const;

export const ANTIGRAVITY_COMMANDS_SOURCE_DIR = "antigravity/commands";
export const ANTIGRAVITY_COMMANDS_TARGET_DIR = ".antigravity/agent-kit/commands";
export const RUNTIME_SKILLS_SOURCE_DIR = "runtime-skills";
export const ANTIGRAVITY_RUNTIME_SKILLS_TARGET_DIR = ".antigravity/runtime-skills";

export const CI_TEMPLATE_FILES = [
  {
    source: "templates/next-supabase/.github/workflows/agent-kit-audit.yml",
    target: ".github/workflows/agent-kit-audit.yml"
  }
] as const;
