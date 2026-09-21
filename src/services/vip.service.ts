import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { LicenseService } from './license.service';

export interface VipLink {
  id: string;
  code: string;
  createdAt: string;
  scansAllowed: number;
  scansUsed: number;
}

export interface VipStatus {
  code: string;
  scansAllowed: number;
  scansUsed: number;
  scansRemaining: number;
  exhausted: boolean;
}

interface VipPayload {
  v: 1;
  id: string;
  scansAllowed: number;
  issuedAt: string;
}

const VIP_PREFIX = 'SSPV1';
/**
 * FAS 1.5: Render har flyktigt filsystem – tillståndet måste överleva deploy.
 * Sätt DATA_DIR till en monterad Render Disk (render.yaml konfigurerar detta).
 * Lokalt hamnar det i projektets data/-katalog som vanligt.
 * Läses lazily så tester kan sätta DATA_DIR innan första anropet.
 */
function getStoreDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), 'data');
}
function getConsumedPath(): string {
  return path.join(getStoreDir(), 'vip-consumed.json');
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
    .update(`vip:${encodedPayload}`)
    .digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function encodeVipCode(payload: VipPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${VIP_PREFIX}.${encodedPayload}.${sign(encodedPayload)}`;
}

function decodeVipCode(code: string): VipPayload | null {
  const normalized = code.trim();
  const parts = normalized.split('.');
  if (parts.length !== 3 || parts[0] !== VIP_PREFIX) {
    return null;
  }

  const [, encodedPayload, signature] = parts;
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as VipPayload;

    if (
      payload.v !== 1 ||
      typeof payload.id !== 'string' ||
      !payload.id ||
      typeof payload.issuedAt !== 'string' ||
      !Number.isInteger(payload.scansAllowed) ||
      payload.scansAllowed < 1
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export class VipService {
  private licenseService = new LicenseService();

  private ensureStore(): void {
    if (!fs.existsSync(getStoreDir())) {
      fs.mkdirSync(getStoreDir(), { recursive: true });
    }
    if (!fs.existsSync(getConsumedPath())) {
      fs.writeFileSync(getConsumedPath(), '[]\n', 'utf8');
    }
  }

  private readConsumed(): string[] {
    this.ensureStore();
    try {
      const raw = fs.readFileSync(getConsumedPath(), 'utf8');
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  private writeConsumed(ids: string[]): void {
    this.ensureStore();
    fs.writeFileSync(getConsumedPath(), `${JSON.stringify(ids, null, 2)}\n`, 'utf8');
  }

  private isConsumed(vipId: string): boolean {
    return this.readConsumed().includes(vipId);
  }

  /** True when the VIP link still has at least one scan left. */
  public isAvailable(vipId: string): boolean {
    return !!vipId && !this.isConsumed(vipId);
  }

  public createLink(): VipLink {
    const issuedAt = new Date().toISOString();
    const payload: VipPayload = {
      v: 1,
      id: crypto.randomUUID(),
      scansAllowed: 1,
      issuedAt
    };
    const code = encodeVipCode(payload);

    return {
      id: payload.id,
      code,
      createdAt: issuedAt,
      scansAllowed: 1,
      scansUsed: 0
    };
  }

  public redeem(code: string): { token: string; scansRemaining: number } | null {
    const payload = decodeVipCode(code);
    if (!payload) {
      return null;
    }
    if (this.isConsumed(payload.id)) {
      return null;
    }

    const token = this.licenseService.issueVipToken(payload.id);
    return {
      token,
      scansRemaining: payload.scansAllowed
    };
  }

  public consumeScan(vipId: string): boolean {
    if (!vipId || this.isConsumed(vipId)) {
      return false;
    }

    const consumed = this.readConsumed();
    consumed.push(vipId);
    this.writeConsumed(consumed);
    return true;
  }

  public getStatus(code: string): VipStatus | null {
    const payload = decodeVipCode(code);
    if (!payload) {
      return null;
    }

    const exhausted = this.isConsumed(payload.id);
    const scansUsed = exhausted ? payload.scansAllowed : 0;
    const scansRemaining = Math.max(0, payload.scansAllowed - scansUsed);

    return {
      code: code.trim(),
      scansAllowed: payload.scansAllowed,
      scansUsed,
      scansRemaining,
      exhausted
    };
  }
}
