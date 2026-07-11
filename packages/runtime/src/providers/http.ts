export async function fetchJson(url: string, init: RequestInit, options: { timeoutMs: number; signal?: AbortSignal }): Promise<Record<string, unknown>> {
  options.signal?.throwIfAborted();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(`Provider request timed out after ${options.timeoutMs}ms.`)), options.timeoutMs);
  const abort = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(url, { ...init, redirect: "error", signal: controller.signal });
    const raw = await response.text();
    let parsed: unknown = {};
    if (raw.trim()) {
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        parsed = { error: { message: raw.slice(0, 500) } };
      }
    }
    if (!response.ok) {
      const record = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
      const error = record.error && typeof record.error === "object" ? (record.error as Record<string, unknown>) : record;
      const message = typeof error.message === "string" ? error.message : `HTTP ${response.status}`;
      throw new Error(`Provider request failed (${response.status}): ${message.slice(0, 500)}`);
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Provider returned a non-object JSON response.");
    return parsed as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}

export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function assertSafeProviderUrl(baseUrl: string, requestUrl: string, allowPrivateNetwork: boolean): Promise<void> {
  const base = new URL(baseUrl);
  await assertSafeOutboundUrl(new URL(requestUrl), {
    allowedHosts: [base.hostname],
    allowPrivateNetwork,
    label: "Provider"
  });
}
import { assertSafeOutboundUrl } from "../security/network.js";
