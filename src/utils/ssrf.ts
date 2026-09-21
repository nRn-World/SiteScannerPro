import crypto from 'crypto';
import { Logger, hostOnly } from './logger';

/**
 * SSRF-skydd: validerar mål-URL och slår upp DNS innan anslutning,
 * så att DNS rebinding mot 127.0.0.1 / 169.254.169.254 blockeras.
 * Anslut skall ske mot den verifierade IP-adressen.
 */

export interface ResolvedTarget {
  /** URL med original-hostname (TLS/SNI fungerar) – IP pinnas via pinnedLookup. */
  safeUrl: string;
  /** Original-URL (behålls för rapportrubrik). */
  originalUrl: string;
  resolvedIp: string;
  /** Alla publika IP-adresser hostname löste ut vid valideringen. */
  validatedIps: string[];
  /** host → pinned IP, används som custom DNS-lookup vid anslutning. */
  pinnedLookup: Map<string, { address: string; family: 4 | 6 }>;
}

const PRIVATE_V4 = [
  { net: '0.0.0.0/8' },
  { net: '10.0.0.0/8' },
  { net: '100.64.0.0/10' },
  { net: '127.0.0.0/8' },
  { net: '169.254.0.0/16' },
  { net: '172.16.0.0/12' },
  { net: '192.0.0.0/24' },
  { net: '192.168.0.0/16' },
  { net: '198.18.0.0/15' },
  { net: '224.0.0.0/4' },
  { net: '240.0.0.0/4' }
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    // Accepterar även decimalnotation som "2130706433" endast via strikt parse
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255 || !/^\d{1,3}$/.test(part)) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

function parseCidr(cidr: string): { base: number; bits: number } | null {
  const [addr, bitsRaw] = cidr.split('/');
  const base = ipv4ToInt(addr);
  const bits = Number(bitsRaw);
  if (base === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  return { base, bits };
}

export function isPrivateIPv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  if (value === null) return true; // ogiltig v4 => behandla som privat
  for (const { net } of PRIVATE_V4) {
    const cidr = parseCidr(net);
    if (!cidr) continue;
    const mask = cidr.bits === 0 ? 0 : (0xFFFFFFFF << (32 - cidr.bits)) >>> 0;
    if ((value & mask) === (cidr.base & mask)) return true;
  }
  return false;
}

export function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80') || lower.startsWith('fc') || lower.startsWith('fd')) return true;
  // IPv4-mappad: ::ffff:127.0.0.1
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  // IPv4-kompatibel: ::127.0.0.1
  const compat = lower.match(/^::(\d+\.\d+\.\d+\.\d+)$/);
  if (compat) return isPrivateIPv4(compat[1]);
  return false;
}

export function isPrivateIp(ip: string): boolean {
  return ip.includes(':') ? isPrivateIPv6(ip) : isPrivateIPv4(ip);
}

/**
 * Enkel DNS-uppslag via dns.promises Resolver, utan externa beroenden.
 */
import dns from 'dns';
import { promises as dnsPromises } from 'dns';

export async function resolveAndValidateTarget(
  rawUrl: string,
  log?: Logger
): Promise<ResolvedTarget> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfError('invalid');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SsrfError('invalid');
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  // Ren IP-notation: validera direkt (täcker decimal- och hex-variant via parse)
  if (/^[\d.]+$/.test(hostname) || hostname.includes(':')) {
    const ip = normalizeIpLiteral(hostname);
    if (!ip || isPrivateIp(ip)) {
      throw new SsrfError('private');
    }
    return {
      safeUrl: parsed.toString(),
      originalUrl: rawUrl,
      resolvedIp: ip,
      validatedIps: [ip],
      pinnedLookup: new Map()
    };
  }

  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new SsrfError('private');
  }

  let addresses: dns.LookupAddress[];
  try {
    addresses = await dnsPromises.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new SsrfError('dns');
  }

  if (!addresses.length) {
    throw new SsrfError('dns');
  }

  const publicAddresses = addresses.filter((a) => !isPrivateIp(a.address));
  if (publicAddresses.length === 0) {
    log?.warn('SSRF blocked: hostname resolves only to private addresses', {
      host: hostOnly(rawUrl)
    });
    throw new SsrfError('private');
  }

  // Anslut mot hostname men PINNA DNS till de verifierade IP-adresserna,
  // så TLS/SNI fungerar samtidigt som rebinding mellan lookup och anslutning blockeras.
  const chosen = publicAddresses[0];
  const pinnedLookup = new Map<string, { address: string; family: 4 | 6 }>();
  for (const addr of addresses) {
    if (!isPrivateIp(addr.address)) {
      pinnedLookup.set(hostname.toLowerCase(), {
        address: addr.address,
        family: addr.family as 4 | 6
      });
      break; // en pinad adress räcker; resten behålls i validatedIps
    }
  }

  return {
    safeUrl: parsed.toString(),
    originalUrl: rawUrl,
    resolvedIp: chosen.address,
    validatedIps: publicAddresses.map((a) => a.address),
    pinnedLookup
  };
}

/**
 * Re-validerar att host fortfarande löser ut till minst en av de redan
 * godkända IP-adresserna (stänger rebinding-fönstret efter sidladdning).
 */
export async function revalidateHost(originalUrl: string, validatedIps: string[]): Promise<void> {
  const hostname = new URL(originalUrl).hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!hostname || /^[\d.]+$/.test(hostname) || hostname.includes(':')) {
    return; // ren IP – redan validerad
  }
  let addresses: dns.LookupAddress[];
  try {
    addresses = await dnsPromises.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new SsrfError('dns');
  }
  const stillValid = addresses.some(
    (a) => !isPrivateIp(a.address) && validatedIps.includes(a.address)
  );
  if (!stillValid) {
    log?.warn?.('SSRF revalidation failed: DNS changed after connect', { host: hostname });
    throw new SsrfError('private');
  }
}

// valfri logger för revalidateHost
let log: Logger | null = null;
export function setSsrfLogger(l: Logger): void {
  log = l;
}

function normalizeIpLiteral(host: string): string | null {
  // Decimal-form: 2130706433 => 127.0.0.1
  if (/^\d{8,10}$/.test(host)) {
    const n = Number(host);
    if (n <= 0xFFFFFFFF) {
      const a = (n >>> 24) & 255;
      const b = (n >>> 16) & 255;
      const c = (n >>> 8) & 255;
      const d = n & 255;
      return `${a}.${b}.${c}.${d}`;
    }
    return null;
  }
  // Hex-form: 0x7f000001
  const hex = host.match(/^0x([0-9a-f]{8})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    const a = (n >>> 24) & 255;
    const b = (n >>> 16) & 255;
    const c = (n >>> 8) & 255;
    const d = n & 255;
    return `${a}.${b}.${c}.${d}`;
  }
  if (/^[\d.]+$/.test(host)) return host; // vanlig dotted quad (valideras av isPrivateIPv4)
  return host.includes(':') ? host : null;
}

function withHost(parsed: URL, ip: string): string {
  const next = new URL(parsed.toString());
  const isV6 = ip.includes(':');
  next.hostname = isV6 ? `[${ip}]` : ip;
  return next.toString();
}

export class SsrfError extends Error {
  public readonly reason: 'invalid' | 'private' | 'dns';
  constructor(reason: 'invalid' | 'private' | 'dns') {
    super(`SSRF validation failed: ${reason}`);
    this.name = 'SsrfError';
    this.reason = reason;
  }
}

/**
 * Hash för cache-nycklar (undvik loggning av rå URL).
 */
export function urlFingerprint(rawUrl: string): string {
  return crypto.createHash('sha256').update(rawUrl).digest('hex').slice(0, 16);
}
