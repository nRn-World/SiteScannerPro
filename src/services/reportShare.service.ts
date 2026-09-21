import crypto from 'crypto';

/**
 * FAS 3.1: signerade delbara rapport-URL:er med kontrollerad livslängd.
 * Samma HMAC-mönster som licenserna. Ingen persondata i nyckeln –
 * bara host, poäng och utgångstid.
 */

const SHARE_PREFIX = 'SSPR1';

export interface SharePayload {
  v: 1;
  host: string;        // endast host, aldrig path/query (integritet)
  score: number;       // totalpoäng 0-100
  metrics: { seo: number; performance: number; security: number; accessibility: number; code: number };
  issuedAt: string;
  /** Unix-sekunder – delningslänken går ut. */
  exp: number;
}

export interface ShareToken {
  token: string;
  expiresAt: string;
  shareUrlPath: string;
}

const DEFAULT_TTL_DAYS = 30;
const MAX_TTL_DAYS = 365;

export function getShareTtlSeconds(): number {
  const days = Number(process.env.REPORT_SHARE_TTL_DAYS || '') || DEFAULT_TTL_DAYS;
  const clamped = Math.min(Math.max(1, days), MAX_TTL_DAYS);
  return clamped * 24 * 60 * 60;
}

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
    .update(`share:${encodedPayload}`)
    .digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createShareToken(input: {
  url: string;
  score: number;
  metrics: { seo: number; performance: number; security: number; accessibility: number; code: number };
}): ShareToken {
  let host = '(invalid)';
  try {
    host = new URL(input.url).host;
  } catch {
    // behåll placeholder
  }

  const payload: SharePayload = {
    v: 1,
    host,
    score: Math.max(0, Math.min(100, Math.round(input.score))),
    metrics: input.metrics,
    issuedAt: new Date().toISOString(),
    exp: Math.floor(Date.now() / 1000) + getShareTtlSeconds()
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const token = `${SHARE_PREFIX}.${encodedPayload}.${sign(encodedPayload)}`;

  return {
    token,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    shareUrlPath: `/report?t=${encodeURIComponent(token)}`
  };
}

export function decodeShareToken(token: string): SharePayload | null {
  const normalized = (token || '').trim();
  const parts = normalized.split('.');
  if (parts.length !== 3 || parts[0] !== SHARE_PREFIX) return null;

  const [, encodedPayload, signature] = parts;
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SharePayload;
    if (payload.v !== 1 || typeof payload.host !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }
    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null; // utgången länk
    }
    if (
      !payload.metrics ||
      typeof payload.score !== 'number' ||
      payload.score < 0 ||
      payload.score > 100
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
