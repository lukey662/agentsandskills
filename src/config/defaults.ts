export const PACKAGE_NAME = "@appsforgood/next-supabase-kit";
export const PACKAGE_VERSION = "0.5.3";

export const ROOT_DOCS = ["AGENTS.md", "USER_GUIDE.md", "USER_GUIDE.html"] as const;

/** The always-on Cursor rule. Written on every init so Cursor users get the launch order even without --activate cursor. */
export const CURSOR_RULE_FILE = {
  source: "templates/next-supabase/.cursor/rules/cursor-agent-kit.mdc",
  target: ".cursor/rules/cursor-agent-kit.mdc"
} as const;

/** Antigravity reads workspace rules from .agents/rules/. Same body as the Cursor rule. */
export const AGENTS_RULE_FILE = {
  source: "templates/next-supabase/.cursor/rules/cursor-agent-kit.mdc",
  target: ".agents/rules/agent-kit.md"
} as const;

export const CLAUDE_TEMPLATE = "templates/next-supabase/CLAUDE.md";
export const USER_GUIDE_SOURCE = "USER_GUIDE.md";
export const USER_GUIDE_HTML_SOURCE = "USER_GUIDE.html";
export const AGENTS_DOC_SOURCE = "templates/next-supabase/AGENTS.md";
