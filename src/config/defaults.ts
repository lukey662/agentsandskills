import type { AgentKitConfig } from "./types.js";

export const PACKAGE_NAME = "@appsforgood/next-supabase-kit";
export const PACKAGE_VERSION = "0.4.1";

export const DEFAULT_CONFIG: AgentKitConfig = {
  stack: "next-supabase",
  projectType: "saas",
  docsMode: "advisory",
  githubActions: {
    mode: "off"
  },
  agentCouncil: {
    required: false,
    rosterPath: "",
    defaultWorkflow: "planning",
    coreChangeWorkflow: "core-change"
  },
  modelRouting: {
    required: false,
    routingPath: "",
    reviewCadence: "when-needed"
  },
  designProviders: ["stitch", "claude", "figma", "human"],
  research: {
    maxRepos: 40,
    githubTokenEnv: "GITHUB_TOKEN",
    workdir: "research/workdir"
  }
};

export const ROOT_DOCS = ["AGENTS.md", "USER_GUIDE.md", "USER_GUIDE.html"] as const;

export const CURSOR_RULE_FILE = {
  source: "assistant-adapters/cursor-agent-kit.mdc",
  target: ".cursor/rules/cursor-agent-kit.mdc"
} as const;

export const CLAUDE_TEMPLATE = "templates/next-supabase/CLAUDE.md";
export const USER_GUIDE_SOURCE = "USER_GUIDE.md";
export const USER_GUIDE_HTML_SOURCE = "USER_GUIDE.html";
export const AGENTS_DOC_SOURCE = "templates/next-supabase/AGENTS.md";

export const COPILOT_INSTRUCTION_TARGET = ".github/copilot-instructions.md";
export const CODEX_CONFIG_TARGET = ".codex/config.toml";

export const ANTIGRAVITY_PLUGIN_TARGET = ".antigravity/agent-kit/plugin.json";
export const ANTIGRAVITY_COMMANDS = ["plan", "browser-qa", "security", "frontend", "copy", "test", "ship"] as const;

/** Legacy constants kept so leftover studio/audit modules still typecheck. */
export const LIBRARY_FOLDERS = [] as const;
export const DEFAULT_AGENT_ROSTER_SOURCE = "rosters/next-supabase-default-council.json";
export const DEFAULT_AGENT_ROSTER_TARGET = ".agent-kit/agent-roster.json";
export const DEFAULT_MODEL_ROUTING_SOURCE = "model-routing/default-model-routing.json";
export const DEFAULT_MODEL_ROUTING_TARGET = ".agent-kit/model-routing.json";
export const DEFAULT_ORCHESTRATOR_SOURCE = "templates/next-supabase/.agent-kit/orchestrator.json";
export const DEFAULT_ORCHESTRATOR_TARGET = ".agent-kit/orchestrator.json";
export const DEFAULT_RUNTIME_IGNORE_SOURCE = "templates/next-supabase/.agent-kit/runtime/gitignore.template";
export const DEFAULT_RUNTIME_IGNORE_TARGET = ".agent-kit/runtime/.gitignore";
export const CURSOR_ADAPTER_FILES = [CURSOR_RULE_FILE] as const;
export const CURSOR_SCOPED_ADAPTER_FILES = [] as const;
export const COPILOT_INSTRUCTION_FILES = [{ source: "assistant-adapters/github-copilot-instructions.md", target: COPILOT_INSTRUCTION_TARGET }] as const;
export const CODEX_CONFIG_SOURCE = "assistant-adapters/model-selection/codex-config.example.toml";
export const ANTIGRAVITY_PLUGIN_FILES = [{ source: "antigravity/plugin.json", target: ANTIGRAVITY_PLUGIN_TARGET }] as const;
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
