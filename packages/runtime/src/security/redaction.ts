const SECRET_PATTERNS = [
  /gh[pousr]_[A-Za-z0-9_]{12,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /sk-(?:proj-|svcacct-|ant-api\d{2}-)?[A-Za-z0-9_-]{20,}/g,
  /xai-[A-Za-z0-9_-]{20,}/g,
  /AIza[0-9A-Za-z_-]{30,}/g,
  /\b(?:Authorization\s*:\s*)?Bearer\s+[A-Za-z0-9._~+/-]{8,}=*/gi,
  /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password)\s*[:=]\s*["']?[^\s"',}]{8,}/gi,
  /postgres(?:ql)?:\/\/[^\s)]+/gi,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
];

export function redactText(value: string): string {
  return SECRET_PATTERNS.reduce((text, pattern) => text.replace(pattern, "[REDACTED]"), value);
}

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item)]));
  }
  return value;
}

export function assertCredentialReference(value: string): void {
  if (!/^(?:env:[A-Z][A-Z0-9_]*|keychain:[a-zA-Z0-9_.:@/-]+)$/.test(value)) {
    throw new Error("Credential values must be env:NAME or keychain:account references; raw secrets are not accepted.");
  }
}
