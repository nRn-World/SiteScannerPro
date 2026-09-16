import crypto from 'crypto';

export interface LicenseRecord {
  sessionId: string;
  createdAt: string;
  source: 'ko-fi' | 'vip' | 'local';
  vipId?: string;
  kind?: 'pro' | 'vip' | 'local';
}

interface ActivationPayload {
  v: 1;
  id: string;
  issuedAt: string;
  kind?: 'pro' | 'vip' | 'local';
  vipId?: string;
}

const LICENSE_PREFIX = 'SSPA1';
const LICENSE_FORMAT = /^SSP-PRO(?:-[A-Z0-9]{4}){3}$/;

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

function encodeToken(payload: ActivationPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${LICENSE_PREFIX}.${encodedPayload}.${sign(encodedPayload)}`;
}

export class LicenseService {
  private issueActivationToken(kind: 'pro' | 'local' = 'pro'): string {
    const payload: ActivationPayload = {
      v: 1,
      id: crypto.randomUUID(),
      issuedAt: new Date().toISOString(),
      kind
    };
    return encodeToken(payload);
  }

  public issueVipToken(vipId: string): string {
    const payload: ActivationPayload = {
      v: 1,
      id: crypto.randomUUID(),
      issuedAt: new Date().toISOString(),
      kind: 'vip',
      vipId
    };
    return encodeToken(payload);
  }

  public activateLicense(licenseKey: string): string | null {
    const normalizedKey = normalizeLicenseKey(licenseKey);
    const expectedHash = (process.env.KOFI_LICENSE_KEY_HASH || '').trim().toLowerCase();
    if (!LICENSE_FORMAT.test(normalizedKey) || !/^[a-f0-9]{64}$/.test(expectedHash)) {
      return null;
    }

    const actualHash = crypto
      .createHash('sha256')
      .update(normalizedKey)
      .digest('hex');
    if (!safeEqual(actualHash, expectedHash)) {
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
        ...(payload.vipId ? { vipId: payload.vipId } : {})
      };
    } catch {
      return null;
    }
  }
}
