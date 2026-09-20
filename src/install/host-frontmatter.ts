import type { AgentHost } from "./roster-adapters.js";

/**
 * What each host documents for a project agent file. Kept here so `adapter validate`, `doctor`,
 * and the tests judge rendered files by the same rules the renderer wrote them to.
 */

/** Cursor subagent frontmatter, per cursor.com/docs/subagents. Anything else is silently ignored or breaks loading. */
export const CURSOR_AGENT_KEYS = new Set(["name", "description", "model", "readonly", "is_background"]);

/** Claude Code built-in tool names a subagent `tools:` list may reference. MCP tools are `mcp__*` patterns. */
export const CLAUDE_TOOL_NAMES = new Set([
  "Read",
  "Edit",
  "Write",
  "MultiEdit",
  "Bash",
  "Grep",
  "Glob",
  "Skill",
  "Task",
  "WebFetch",
  "WebSearch",
  "NotebookEdit",
  "TodoWrite",
  "AskUserQuestion"
]);

/** Top-level `key: value` pairs from a frontmatter block. Nested list items are folded into their parent key. */
export function frontmatterKeys(text: string): Map<string, string> {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  const out = new Map<string, string>();
  if (!match?.[1]) return out;
  let current: string | null = null;
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv?.[1] !== undefined) {
      current = kv[1];
      out.set(current, kv[2] ?? "");
    } else if (current && /^\s+-\s+/.test(line)) {
      out.set(current, `${out.get(current) ?? ""}\n${line.trim()}`);
    }
  }
  return out;
}

function splitList(value: string): string[] {
  const trimmed = value.trim();
  const inner = trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed;
  return inner
    .split(/[\n,]/)
    .map((item) => item.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

/** Problems with a rendered agent file for the given host. Empty means the host will load it as documented. */
export function validateHostAgentFile(host: AgentHost, text: string): string[] {
  const problems: string[] = [];
  const keys = frontmatterKeys(text);
  if (keys.size === 0) return ["missing frontmatter"];
  if (!keys.has("description")) problems.push("missing description");

  switch (host) {
    case "cursor": {
      for (const key of keys.keys()) {
        if (!CURSOR_AGENT_KEYS.has(key)) problems.push(`Cursor ignores frontmatter key "${key}"`);
      }
      break;
    }
    case "claude": {
      const tools = keys.get("tools");
      if (tools !== undefined) {
        const unknown = splitList(tools).filter((tool) => !CLAUDE_TOOL_NAMES.has(tool) && !tool.startsWith("mcp__"));
        if (unknown.length > 0) problems.push(`Claude cannot resolve tools: ${unknown.join(", ")}`);
      }
      if (!keys.has("name")) problems.push("missing name");
      break;
    }
    case "copilot": {
      break;
    }
    case "antigravity": {
      if (!keys.has("name")) problems.push("missing name");
      if (keys.get("subagent")?.trim() !== "true") problems.push("subagent is not true");
      break;
    }
    case "codex": {
      break;
    }
  }
  return problems;
}

/** The "Required tools" line every rendered agent carries when the canonical file names required tools. */
export function renderedRequiredTools(text: string): string[] {
  const match = text.match(/^> Required tools: (.+?)\. Do not drop them\.$/m);
  return match?.[1] ? match[1].split(",").map((item) => item.trim()) : [];
}
