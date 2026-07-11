import { randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);

export interface LocalHttpSecurity {
  readonly csrfToken: string;
  readonly host: string;
  port: number;
}

export class LocalHttpRequestError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "LocalHttpRequestError";
    this.statusCode = statusCode;
  }
}

export function isLoopbackHost(host: string): boolean {
  return LOOPBACK_HOSTS.has(
    host
      .trim()
      .toLowerCase()
      .replace(/^\[|\]$/g, "")
  );
}

export function createLocalHttpSecurity(host: string): LocalHttpSecurity {
  if (!isLoopbackHost(host)) {
    throw new Error(`Agent Studio only accepts loopback hosts (127.0.0.1, ::1, or localhost); received ${host}.`);
  }
  return {
    csrfToken: randomBytes(32).toString("base64url"),
    host,
    port: 0
  };
}

export function formatLocalUrl(host: string, port: number): string {
  const normalized = host.trim().replace(/^\[|\]$/g, "");
  return `http://${normalized.includes(":") ? `[${normalized}]` : normalized}:${port}`;
}

function parseAuthority(authority: string): URL {
  try {
    return new URL(`http://${authority}`);
  } catch {
    throw new LocalHttpRequestError(400, "Invalid Host header.");
  }
}

function safeTokenEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function assertSecureLocalRequest(request: IncomingMessage, security: LocalHttpSecurity): void {
  const hostHeader = request.headers.host;
  if (!hostHeader) throw new LocalHttpRequestError(400, "Host header is required.");

  const authority = parseAuthority(hostHeader);
  if (!isLoopbackHost(authority.hostname)) {
    throw new LocalHttpRequestError(403, "Host must resolve to a loopback address.");
  }
  const requestedPort = authority.port ? Number(authority.port) : 80;
  if (security.port > 0 && requestedPort !== security.port) {
    throw new LocalHttpRequestError(403, "Host port does not match the local server.");
  }

  const method = (request.method ?? "GET").toUpperCase();
  if (!MUTATING_METHODS.has(method)) return;

  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new LocalHttpRequestError(415, "Mutating requests require Content-Type: application/json.");
  }

  const token = request.headers["x-agent-kit-csrf"];
  if (typeof token !== "string" || !safeTokenEqual(token, security.csrfToken)) {
    throw new LocalHttpRequestError(403, "Missing or invalid local request token.");
  }

  const fetchSite = request.headers["sec-fetch-site"];
  if (typeof fetchSite === "string" && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new LocalHttpRequestError(403, "Cross-site requests are not allowed.");
  }

  const origin = request.headers.origin;
  if (typeof origin === "string") {
    let parsedOrigin: URL;
    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new LocalHttpRequestError(403, "Invalid Origin header.");
    }
    const originPort = parsedOrigin.port ? Number(parsedOrigin.port) : parsedOrigin.protocol === "https:" ? 443 : 80;
    if (parsedOrigin.protocol !== "http:" || !isLoopbackHost(parsedOrigin.hostname) || originPort !== security.port) {
      throw new LocalHttpRequestError(403, "Origin does not match the local server.");
    }
  }
}

export function baseSecurityHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  };
}

export function secureLocalHtml(html: string, security: LocalHttpSecurity): { body: string; csp: string } {
  const nonce = randomBytes(18).toString("base64url");
  const meta = `<meta name="agent-kit-csrf-token" content="${security.csrfToken}">`;
  const body = html
    .replace("</head>", `  ${meta}\n</head>`)
    .replace(/<style>/g, `<style nonce="${nonce}">`)
    .replace(/<script>/g, `<script nonce="${nonce}">`);
  const csp = [
    "default-src 'none'",
    "base-uri 'none'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src data:",
    "object-src 'none'",
    `script-src 'nonce-${nonce}'`,
    `style-src 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'"
  ].join("; ");
  return { body, csp };
}
