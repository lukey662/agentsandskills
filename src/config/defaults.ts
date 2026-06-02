import type { AgentKitConfig } from "./types.js";

export const PACKAGE_NAME = "@afg/next-supabase-agent-kit";
export const PACKAGE_VERSION = "0.1.0";

export const DEFAULT_CONFIG: AgentKitConfig = {
  stack: "next-supabase",
  projectType: "saas",
  docsMode: "advisory",
  designProviders: ["stitch", "claude", "figma", "human"],
  research: {
    maxRepos: 100,
    githubTokenEnv: "GITHUB_TOKEN",
    workdir: "research/workdir"
  }
};

export const ROOT_DOCS = [
  "AGENTS.md",
  "SKILLS.md",
  "SPEC.md",
  "DECISIONS.md",
  "DOCS.md",
  "STYLE_GUIDE.md",
  "SECURITY.md",
  "TESTING.md",
  "DEPLOYMENT.md"
] as const;

export const LIBRARY_FOLDERS = [
  "agents",
  "skills",
  "prompts",
  "checklists",
  "design-adapters"
] as const;
