import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { getDefaultEnvironment, StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { McpServerConfig } from "./config.js";
import type { CredentialStore } from "./credentials.js";
import { assertSafeOutboundUrl } from "./security/network.js";
import type { ModelToolDefinition } from "./types.js";

type RuntimeTransport = StdioClientTransport | StreamableHTTPClientTransport;

interface ConnectedServer {
  client: Client;
  transport: RuntimeTransport;
  config: McpServerConfig;
}

export interface McpToolResult {
  output: string;
  data?: Record<string, unknown>;
  isError: boolean;
}

function namespaceSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function namespacedTool(server: string, tool: string): string {
  return `mcp__${namespaceSegment(server)}__${namespaceSegment(tool)}`;
}

export async function assertSafeMcpUrl(url: URL, config: Extract<McpServerConfig, { transport: "streamable-http" }>): Promise<void> {
  await assertSafeOutboundUrl(url, {
    allowedHosts: config.allowedHosts,
    allowPrivateNetwork: config.allowPrivateNetwork,
    label: "MCP"
  });
}

function riskFromAnnotations(
  annotations: { readOnlyHint?: boolean | undefined; destructiveHint?: boolean | undefined; openWorldHint?: boolean | undefined } | undefined
): ModelToolDefinition["risk"] {
  if (annotations?.destructiveHint) return "destructive";
  if (annotations?.openWorldHint) return "network";
  return annotations?.readOnlyHint ? "read" : "write";
}

export class McpClientBroker {
  private readonly connections = new Map<string, ConnectedServer>();
  private readonly toolNames = new Map<string, { server: string; tool: string }>();

  constructor(
    private readonly servers: Record<string, McpServerConfig>,
    private readonly credentials: CredentialStore,
    private readonly cwd: string
  ) {}

  async definitions(): Promise<ModelToolDefinition[]> {
    const definitions: ModelToolDefinition[] = [];
    for (const server of Object.keys(this.servers).sort()) {
      const configured = this.servers[server];
      if (!configured || configured.allowedTools.length === 0) continue;
      if (configured.transport === "stdio" && !configured.allowHostExecution) continue;
      const connection = await this.connect(server);
      const response = await connection.client.listTools();
      for (const tool of response.tools) {
        if (!connection.config.allowedTools.includes(tool.name)) continue;
        const name = namespacedTool(server, tool.name);
        if (this.toolNames.has(name)) throw new Error(`MCP tool namespace collision: ${name}`);
        this.toolNames.set(name, { server, tool: tool.name });
        definitions.push({
          name,
          description: `[MCP ${server}] ${tool.description ?? tool.title ?? tool.name}`,
          inputSchema: tool.inputSchema,
          risk: riskFromAnnotations(tool.annotations)
        });
      }
    }
    return definitions;
  }

  async call(name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<McpToolResult> {
    signal?.throwIfAborted();
    const mapping = this.toolNames.get(name);
    if (!mapping) throw new Error(`Unknown or disallowed MCP tool: ${name}`);
    const connection = await this.connect(mapping.server);
    const result = await connection.client.callTool({ name: mapping.tool, arguments: args }, undefined, signal ? { signal } : undefined);
    if ("toolResult" in result) {
      return { output: JSON.stringify(result.toolResult), data: { server: mapping.server, tool: mapping.tool }, isError: false };
    }
    const output = result.content
      .map((item) => {
        if (item.type === "text") return item.text;
        if (item.type === "resource" && "text" in item.resource) return item.resource.text;
        if (item.type === "resource_link") return item.uri;
        return `[${item.type} content omitted]`;
      })
      .join("\n");
    return {
      output,
      ...(result.structuredContent ? { data: result.structuredContent } : {}),
      isError: result.isError === true
    };
  }

  async probe(server: string): Promise<{ server: string; tools: string[]; transport: McpServerConfig["transport"] }> {
    const connection = await this.connect(server);
    await connection.client.ping();
    const tools = await connection.client.listTools();
    return {
      server,
      tools: tools.tools
        .filter((tool) => connection.config.allowedTools.includes(tool.name))
        .map((tool) => tool.name)
        .sort(),
      transport: connection.config.transport
    };
  }

  async close(): Promise<void> {
    const connections = [...this.connections.values()];
    this.connections.clear();
    this.toolNames.clear();
    await Promise.allSettled(connections.map(({ transport }) => transport.close()));
  }

  private async connect(server: string): Promise<ConnectedServer> {
    const existing = this.connections.get(server);
    if (existing) return existing;
    const config = this.servers[server];
    if (!config) throw new Error(`Unknown MCP server: ${server}`);
    const client = new Client({ name: "appsforgood-agent-kit", version: "0.1.0" }, { capabilities: {} });
    let transport: RuntimeTransport;
    if (config.transport === "stdio") {
      if (!config.allowHostExecution) {
        throw new Error(`Local MCP server ${server} requires allowHostExecution=true and the runtime host-mutation approval gate.`);
      }
      const env = { ...getDefaultEnvironment() };
      for (const [name, reference] of Object.entries(config.envRefs)) env[name] = await this.credentials.resolve(reference);
      transport = new StdioClientTransport({ command: config.command, args: config.args, env, cwd: this.cwd, stderr: "pipe" });
    } else {
      const url = new URL(config.url);
      await assertSafeMcpUrl(url, config);
      const authorization = config.authRef ? `Bearer ${await this.credentials.resolve(config.authRef)}` : undefined;
      const guardedFetch: typeof fetch = async (input, init) => {
        const requestUrl = input instanceof URL ? input : new URL(typeof input === "string" ? input : input.url);
        await assertSafeMcpUrl(requestUrl, config);
        return fetch(input, { ...init, redirect: "error" });
      };
      transport = new StreamableHTTPClientTransport(url, {
        ...(authorization ? { requestInit: { headers: { Authorization: authorization }, redirect: "error" } } : { requestInit: { redirect: "error" } }),
        fetch: guardedFetch
      });
    }
    try {
      await client.connect(transport as unknown as Transport);
    } catch (error) {
      await transport.close().catch(() => undefined);
      throw error;
    }
    const connection = { client, transport, config };
    this.connections.set(server, connection);
    return connection;
  }
}
