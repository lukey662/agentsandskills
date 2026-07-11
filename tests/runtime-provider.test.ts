import { createServer, type RequestListener, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { RuntimeConfigContract } from "../packages/runtime/src/config.js";
import type { CredentialStore } from "../packages/runtime/src/credentials.js";
import { AnthropicAdapter } from "../packages/runtime/src/providers/anthropic.js";
import { GeminiAdapter } from "../packages/runtime/src/providers/gemini.js";
import { fetchJson, joinUrl } from "../packages/runtime/src/providers/http.js";
import { OpenAICompatibleAdapter } from "../packages/runtime/src/providers/openai-compatible.js";

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))));
});

async function listen(handler: RequestListener): Promise<string> {
  const server = createServer(handler);
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test server address.");
  return `http://127.0.0.1:${address.port}/v1`;
}

function listenAsync(handler: (request: Parameters<RequestListener>[0], response: Parameters<RequestListener>[1]) => Promise<void>): Promise<string> {
  return listen((request, response) => {
    void handler(request, response).catch((error: unknown) => response.destroy(error instanceof Error ? error : new Error(String(error))));
  });
}

async function requestBody(request: Parameters<RequestListener>[0]): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request as AsyncIterable<unknown>) {
    if (typeof chunk === "string") chunks.push(Buffer.from(chunk));
    else if (chunk instanceof Uint8Array) chunks.push(Buffer.from(chunk));
    else throw new Error("Unexpected request body chunk type.");
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

const credentials: CredentialStore = {
  resolve() {
    return Promise.resolve("test-credential");
  },
  set() {
    return Promise.resolve();
  },
  delete() {
    return Promise.resolve(false);
  }
};

describe("OpenAI-compatible provider adapter", () => {
  it("normalizes models, tool calls, usage, and provider ids", async () => {
    const baseUrl = await listen((request, response) => {
      response.setHeader("Content-Type", "application/json");
      if (request.url === "/v1/models") {
        response.end(JSON.stringify({ data: [{ id: "tool-model" }] }));
        return;
      }
      response.end(
        JSON.stringify({
          id: "response-1",
          choices: [
            {
              finish_reason: "tool_calls",
              message: {
                content: "",
                tool_calls: [{ id: "call-1", function: { name: "read_file", arguments: '{"path":"README.md"}' } }]
              }
            }
          ],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
        })
      );
    });
    const provider = RuntimeConfigContract.parse({
      schemaVersion: 1,
      providers: { mock: { kind: "openai-compatible", baseUrl, credentialRef: "env:MOCK_KEY", capabilities: ["text", "tools"] } }
    }).providers.mock!;
    const adapter = new OpenAICompatibleAdapter("mock", provider, credentials);
    await expect(adapter.probe()).resolves.toMatchObject({ available: true, models: ["tool-model"] });
    const result = await adapter.invoke({
      model: "tool-model",
      messages: [{ role: "user", content: "Read the file" }],
      tools: [{ name: "read_file", description: "Read", inputSchema: { type: "object" }, risk: "read" }]
    });
    expect(result.providerResponseId).toBe("response-1");
    expect(result.toolCalls).toEqual([{ id: "call-1", name: "read_file", arguments: { path: "README.md" } }]);
    expect(result.usage?.totalTokens).toBe(15);
  });

  it("rejects provider redirects", async () => {
    const baseUrl = await listen((_request, response) => {
      response.statusCode = 302;
      response.setHeader("Location", "http://127.0.0.1:9/blocked");
      response.end();
    });
    const provider = RuntimeConfigContract.parse({
      schemaVersion: 1,
      providers: { mock: { kind: "openai-compatible", baseUrl } }
    }).providers.mock!;
    const result = await new OpenAICompatibleAdapter("mock", provider, credentials).probe();
    expect(result.available).toBe(false);
    expect(result.error).toMatch(/redirect|fetch failed/i);
  });

  it("reports provider HTTP failures without exposing response internals", async () => {
    const baseUrl = await listen((_request, response) => {
      response.statusCode = 401;
      response.end("credential rejected");
    });
    const provider = RuntimeConfigContract.parse({ schemaVersion: 1, providers: { mock: { kind: "openai-compatible", baseUrl } } }).providers.mock!;
    const result = await new OpenAICompatibleAdapter("mock", provider, credentials).probe();
    expect(result).toMatchObject({ available: false, providerId: "mock" });
    expect(result.error).toContain("credential rejected");
  });

  it("rejects invalid tool arguments and non-object success payloads", async () => {
    let mode: "invalid-tool" | "array" = "invalid-tool";
    const baseUrl = await listen((_request, response) => {
      response.setHeader("Content-Type", "application/json");
      response.end(
        mode === "array" ? "[]" : JSON.stringify({ choices: [{ message: { tool_calls: [{ function: { name: "write_file", arguments: "{" } }] } }] })
      );
    });
    const provider = RuntimeConfigContract.parse({ schemaVersion: 1, providers: { mock: { kind: "openai-compatible", baseUrl } } }).providers.mock!;
    const adapter = new OpenAICompatibleAdapter("mock", provider, credentials);
    await expect(adapter.invoke({ model: "mock", messages: [] })).rejects.toThrow(/invalid JSON arguments/);
    mode = "array";
    await expect(adapter.invoke({ model: "mock", messages: [] })).rejects.toThrow(/non-object JSON/);
  });
});

describe("Anthropic provider adapter", () => {
  it("normalizes model discovery, messages, tools, usage, and fallback tool ids", async () => {
    let sent: Record<string, unknown> | undefined;
    const baseUrl = await listenAsync(async (request, response) => {
      response.setHeader("Content-Type", "application/json");
      if (request.url?.endsWith("/models")) {
        response.end(JSON.stringify({ data: [{ id: "claude-test" }, { id: 42 }, null] }));
        return;
      }
      sent = await requestBody(request);
      response.end(
        JSON.stringify({
          id: "anthropic-response",
          stop_reason: "tool_use",
          content: [
            { type: "text", text: "Inspecting" },
            { type: "tool_use", name: "read_file", input: { path: "README.md" } },
            { type: "tool_use", id: "call-2", name: "search", input: [] },
            { type: "image", source: {} }
          ],
          usage: { input_tokens: 12, output_tokens: 4 }
        })
      );
    });
    const config = RuntimeConfigContract.parse({
      schemaVersion: 1,
      providers: { anthropic: { kind: "anthropic", baseUrl, credentialRef: "env:ANTHROPIC_TEST" } }
    }).providers.anthropic!;
    const adapter = new AnthropicAdapter("anthropic", config, credentials);
    await expect(adapter.probe()).resolves.toMatchObject({ available: true, models: ["claude-test"] });
    const result = await adapter.invoke({
      model: "claude-test",
      messages: [
        { role: "system", content: "System one" },
        { role: "system", content: "System two" },
        { role: "assistant", content: "Prior" },
        { role: "tool", name: "read_file", toolCallId: "tool-1", content: "contents" },
        { role: "user", content: "Continue" }
      ],
      tools: [{ name: "read_file", description: "Read", inputSchema: { type: "object" }, risk: "read" }],
      temperature: 0,
      maxOutputTokens: 500
    });
    expect(sent).toMatchObject({ model: "claude-test", system: "System one\n\nSystem two", temperature: 0, max_tokens: 500 });
    expect(JSON.stringify(sent)).toContain("tool_result");
    expect(result).toMatchObject({
      text: "Inspecting",
      finishReason: "tool_use",
      providerResponseId: "anthropic-response",
      usage: { inputTokens: 12, outputTokens: 4, totalTokens: 16 }
    });
    expect(result.toolCalls).toEqual([
      { id: "read_file-tool", name: "read_file", arguments: { path: "README.md" } },
      { id: "call-2", name: "search", arguments: {} }
    ]);
  });

  it("returns an unavailable probe for malformed or failed endpoints", async () => {
    const baseUrl = await listen((_request, response) => {
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: { message: "temporarily unavailable" } }));
    });
    const config = RuntimeConfigContract.parse({ schemaVersion: 1, providers: { anthropic: { kind: "anthropic", baseUrl } } }).providers.anthropic!;
    await expect(new AnthropicAdapter("anthropic", config, credentials).probe()).resolves.toMatchObject({
      available: false,
      error: expect.stringContaining("temporarily unavailable")
    });
  });
});

describe("Gemini provider adapter", () => {
  it("normalizes model discovery, function calls, request content, and usage", async () => {
    let sent: Record<string, unknown> | undefined;
    const baseUrl = await listenAsync(async (request, response) => {
      response.setHeader("Content-Type", "application/json");
      if (request.url?.endsWith("/models")) {
        response.end(JSON.stringify({ models: [{ name: "models/gemini-test" }, { name: 3 }, null] }));
        return;
      }
      sent = await requestBody(request);
      response.end(
        JSON.stringify({
          candidates: [
            {
              finishReason: "STOP",
              content: {
                parts: [
                  { text: "Done" },
                  { functionCall: { name: "read_file", args: { path: "README.md" } } },
                  { functionCall: { name: "search", args: [] } },
                  null
                ]
              }
            }
          ],
          usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 3, totalTokenCount: 11 }
        })
      );
    });
    const config = RuntimeConfigContract.parse({
      schemaVersion: 1,
      providers: { gemini: { kind: "gemini", baseUrl, credentialRef: "env:GEMINI_TEST" } }
    }).providers.gemini!;
    const adapter = new GeminiAdapter("gemini", config, credentials);
    await expect(adapter.probe()).resolves.toMatchObject({ available: true, models: ["gemini-test"] });
    const result = await adapter.invoke({
      model: "gemini/test",
      messages: [
        { role: "system", content: "System" },
        { role: "assistant", content: "Prior" },
        { role: "tool", name: "read_file", content: "contents" },
        { role: "user", content: "Continue" }
      ],
      tools: [{ name: "read_file", description: "Read", inputSchema: { type: "object" }, risk: "read" }],
      temperature: 0.2,
      maxOutputTokens: 256
    });
    expect(sent).toMatchObject({ generationConfig: { temperature: 0.2, maxOutputTokens: 256 } });
    expect(JSON.stringify(sent)).toContain("functionResponse");
    expect(result).toMatchObject({ text: "Done", finishReason: "STOP", usage: { inputTokens: 8, outputTokens: 3, totalTokens: 11 } });
    expect(result.toolCalls).toEqual([
      { id: "gemini-1-read_file", name: "read_file", arguments: { path: "README.md" } },
      { id: "gemini-2-search", name: "search", arguments: {} }
    ]);
  });

  it("returns an unavailable probe when the endpoint fails", async () => {
    const baseUrl = await listen((_request, response) => {
      response.statusCode = 500;
      response.end("failed");
    });
    const config = RuntimeConfigContract.parse({ schemaVersion: 1, providers: { gemini: { kind: "gemini", baseUrl } } }).providers.gemini!;
    await expect(new GeminiAdapter("gemini", config, credentials).probe()).resolves.toMatchObject({ available: false });
  });
});

describe("provider HTTP helpers", () => {
  it("joins URL segments and propagates caller cancellation", async () => {
    expect(joinUrl("https://example.com/v1/", "/models")).toBe("https://example.com/v1/models");
    const baseUrl = await listen((_request, response) => setTimeout(() => response.end("{}"), 100));
    const controller = new AbortController();
    controller.abort(new Error("caller cancelled"));
    await expect(fetchJson(`${baseUrl}/slow`, {}, { timeoutMs: 1_000, signal: controller.signal })).rejects.toThrow(/cancelled|aborted/i);
  });
});
