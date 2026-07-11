import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export interface OutboundUrlPolicy {
  allowedHosts: string[];
  allowPrivateNetwork: boolean;
  label: string;
}

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

export function isLiteralLoopbackHost(hostname: string): boolean {
  const normalized = normalizeHost(hostname);
  return normalized === "localhost" || normalized === "::1" || normalized.startsWith("127.");
}

function ipv4Address(address: string): number[] | undefined {
  const normalized = address.toLowerCase();
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  const value = mapped ?? (isIP(normalized) === 4 ? normalized : undefined);
  if (!value) return undefined;
  const octets = value.split(".").map(Number);
  return octets.length === 4 && octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255) ? octets : undefined;
}

export function isLoopbackAddress(address: string): boolean {
  const normalized = normalizeHost(address);
  if (normalized === "::1") return true;
  return ipv4Address(normalized)?.[0] === 127;
}

export function isPrivateOrSpecialAddress(address: string): boolean {
  const normalized = normalizeHost(address);
  if (normalized === "::" || normalized === "::1") return true;
  if (/^f[cd]/.test(normalized) || /^fe[89ab]/.test(normalized) || normalized.startsWith("ff")) return true;
  if (normalized.startsWith("2001:db8:") || normalized.startsWith("2001:2:") || normalized.startsWith("2001:10:")) return true;
  const octets = ipv4Address(normalized);
  if (!octets) return false;
  const [first = -1, second = -1, third = -1] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

export async function assertSafeOutboundUrl(url: URL, policy: OutboundUrlPolicy): Promise<void> {
  if (url.username || url.password) throw new Error(`${policy.label} URLs must not contain embedded credentials.`);
  if (url.hash) throw new Error(`${policy.label} URLs must not contain fragments.`);
  const hostname = normalizeHost(url.hostname);
  const allowed = policy.allowedHosts.map(normalizeHost);
  if (!allowed.includes(hostname)) throw new Error(`${policy.label} host is not allowlisted: ${hostname}`);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLiteralLoopbackHost(hostname))) {
    throw new Error(`${policy.label} requires HTTPS; HTTP is permitted only for a literal loopback host.`);
  }
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0) throw new Error(`${policy.label} host did not resolve: ${hostname}`);
  const forbidden = addresses.find(
    ({ address }) => isPrivateOrSpecialAddress(address) && !policy.allowPrivateNetwork && !(isLiteralLoopbackHost(hostname) && isLoopbackAddress(address))
  );
  if (forbidden) throw new Error(`${policy.label} host resolves to a private or special-use address: ${forbidden.address}`);
}
