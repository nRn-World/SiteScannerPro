import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface LicenseRecord {
  sessionId: string;
  createdAt: string;
  source: 'ko-fi' | 'vip' | 'local';
  vipId?: string;
  kind?: 'pro' | 'vip' | 'local';
  /** Unix-sekunder då sessionstoken går ut (saknas = äldre token utan exp). */
  exp?: number;
}

interface ActivationPayload {
  v: 1;
  id: string;
  issuedAt: string;
  kind?: 'pro' | 'vip' | 'local';
  vipId?: string;
  /** Sessionstokens bär exp (Unix-sekunder). Nyckeln i sig förblir evig. */
  exp?: number;
  /** "session" = kortlivad token utfärdad mot en licensnyckel. */
  typ?: 'session';
}

const LICENSE_PREFIX = 'SSPA1';
const LICENSE_FORMAT = /^SSP-PRO(?:-[A-Z0-9]{4}){3}$/;

/** Livstidsnyckeln är evig, men sessionstoken måste förnyas. */
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 dagar

/**
 * Nycklar per köp: varje unik nyckel spåras i data/license-keys.json.
 * Spärrlista gör att en läckt nyckel kan ogiltigförklaras utan att drabba andra.
 * Äldre "enda-nyckel"-upplägg (KOFI_LICENSE_KEY_HASH) fortsätter fungera.
 */
interface KeyRecord {
  hash: string; // sha256 av normaliserad nyckel
  createdAt: string;
  source: 'ko-fi' | 'manual';
  note?: string;
  revoked?: boolean;
  revokedAt?: string;
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const KEYS_PATH = path.join(DATA_DIR, 'license-keys.json');
const REVOKED_PATH = path.join(DATA_DIR, 'license-revoked.json');

function getSigningSecret(): string {
  const secret = process.env.LICENSE_SIGNING_SECRET || '';
  if (secret.length < 32) {
    throw new Error('LICENSE_SIGNING_SECRET måste vara minst 32 tecken.');
  }
  return secret;
}

function sign(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getSigningSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase().replace(/\s+/g, '');
}

function hashKey(normalizedKey: string): string {
  return crypto.createHash('sha256').update(normalizedKey).digest('hex');
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, value: unknown): void {
  ensureDataDir();
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function encodeToken(payload: ActivationPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${LICENSE_PREFIX}.${encodedPayload}.${sign(encodedPayload)}`;
}

export interface IssuedKey {
  key: string;
  hash: string;
  createdAt: string;
}

export class LicenseService {
  /**
   * Genererar en ny unik licensnyckel och registrerar dess hash.
   * Används vid varje Ko-fi-köp (manuellt eller via webhook).
   */
  public issueUniqueKey(source: 'ko-fi' | 'manual' = 'ko-fi', note?: string): IssuedKey {
    const groups = Array.from({ length: 3 }, () =>
      crypto.randomBytes(2).toString('hex').toUpperCase()
    );
    const key = `SSP-PRO-${groups.join('-')}`;
    const record: KeyRecord = {
      hash: hashKey(key),
      createdAt: new Date().toISOString(),
      source,
      ...(note ? { note } : {})
    };
    const keys = readJson<KeyRecord[]>(KEYS_PATH, []);
    keys.push(record);
    writeJson(KEYS_PATH, keys);
    return { key, hash: record.hash, createdAt: record.createdAt };
  }

  /** Spärra en nyckel (t.ex. vid läckage) utan att påverka andra kunder. */
  public revokeKey(licenseKey: string, note?: string): boolean {
    const normalized = normalizeLicenseKey(licenseKey);
    const hash = hashKey(normalized);
    const keys = readJson<KeyRecord[]>(KEYS_PATH, []);
    const record = keys.find((k) => k.hash === hash);
    if (!record) return false;
    record.revoked = true;
    record.revokedAt = new Date().toISOString();
    if (note) record.note = note;
    writeJson(KEYS_PATH, keys);
    return true;
  }

  /** Spärrlistan kan även fyllas extern via license-revoked.json (array av hashar). */
  private isRevoked(hash: string): boolean {
    const revokedList = readJson<string[]>(REVOKED_PATH, []);
    if (Array.isArray(revokedList) && revokedList.includes(hash)) return true;
    const keys = readJson<KeyRecord[]>(KEYS_PATH, []);
    return keys.some((k) => k.hash === hash && k.revoked);
  }

  private issueActivationToken(kind: 'pro' | 'local' = 'pro'): string {
    const payload: ActivationPayload = {
      v: 1,
      id: crypto.randomUUID(),
      issuedAt: new Date().toISOString(),
      kind,
      typ: 'session',
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
    };
    return encodeToken(payload);
  }

  public issueVipToken(vipId: string): string {
    const payload: ActivationPayload = {
      v: 1,
      id: crypto.randomUUID(),
      issuedAt: new Date().toISOString(),
      kind: 'vip',
      vipId,
      typ: 'session',
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
    };
    return encodeToken(payload);
  }

  public activateLicense(licenseKey: string): string | null {
    const normalizedKey = normalizeLicenseKey(licenseKey);
    if (!LICENSE_FORMAT.test(normalizedKey)) {
      return null;
    }
    const keyHash = hashKey(normalizedKey);

    // Migrering: äldre upplägg med en enda delad nyckel fortsätter gälla.
    const legacyHash = (process.env.KOFI_LICENSE_KEY_HASH || '').trim().toLowerCase();
    const isLegacy = /^[a-f0-9]{64}$/.test(legacyHash) && safeEqual(keyHash, legacyHash);

    if (isLegacy) {
      return this.issueActivationToken('pro');
    }

    // Nytt upplägg: nyckeln måste vara registrerad (per köp) och inte spärrad.
    const keys = readJson<KeyRecord[]>(KEYS_PATH, []);
    const record = keys.find((k) => k.hash === keyHash);
    if (!record || record.revoked || this.isRevoked(keyHash)) {
      return null;
    }

    return this.issueActivationToken('pro');
  }

  /** Endast för lokal utveckling. Ger Pro utan köpkod. */
  public activateLocalDevLicense(): string {
    return this.issueActivationToken('local');
  }

  public async validateLicense(token: string): Promise<LicenseRecord | null> {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3 || parts[0] !== LICENSE_PREFIX) {
      return null;
    }

    const [, encodedPayload, signature] = parts;
    if (!safeEqual(signature, sign(encodedPayload))) {
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8')
      ) as ActivationPayload;

      if (
        payload.v !== 1 ||
        !payload.id ||
        !payload.issuedAt
      ) {
        return null;
      }

      // FAS 1.2: kortlivade sessionstokens – exp valideras.
      // Äldre tokens utan exp (utfärdade före denna migrering) accepteras fortfarande,
      // så befintliga kunder låses inte ut.
      if (typeof payload.exp === 'number') {
        const nowSec = Math.floor(Date.now() / 1000);
        if (payload.exp <= nowSec) {
          return null;
        }
      }

      const kind = payload.kind ?? 'pro';
      if (kind === 'vip' && !payload.vipId) {
        return null;
      }

      const source: LicenseRecord['source'] =
        kind === 'vip' ? 'vip' : kind === 'local' ? 'local' : 'ko-fi';

      return {
        sessionId: token.trim(),
        createdAt: payload.issuedAt,
        source,
        kind,
        ...(payload.vipId ? { vipId: payload.vipId } : {}),
        ...(typeof payload.exp === 'number' ? { exp: payload.exp } : {})
      };
    } catch {
      return null;
    }
  }
}
