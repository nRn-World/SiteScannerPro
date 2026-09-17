import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface LicenseRecord {
  sessionId: string;
  createdAt: string;
  amountTotal?: number;
  currency?: string;
  source?: 'ko-fi' | 'legacy';
}

type LicenseStore = Record<string, LicenseRecord>;

const DATA_DIR = path.join(process.cwd(), 'data');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');
const LICENSE_SALT = 'SSP-LICENSE-v1|';
const LICENSE_FORMAT = /^SSP-PRO(?:-[A-Z0-9]{4}){2,4}$/;
const HASH_FORMAT = /^[a-f0-9]{64}$/i;

// Plaintext-koden läggs bara på Ko-fi tack-sidan. Appen/servern jämför hash.
const DEFAULT_LICENSE_KEY_HASHES = [
  '1fe3f613134fab1fc2f03131f559c8a652eb2217a234f38de126165dfed92880'
];

function readStore(): LicenseStore {
  try {
    if (!fs.existsSync(LICENSES_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(LICENSES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as LicenseStore;
    }
    return {};
  } catch (error) {
    console.warn('Kunde inte läsa licensdatabasen, startar med tom lagring.', error);
    return {};
  }
}

function writeStore(store: LicenseStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${LICENSES_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tempFile, LICENSES_FILE);
}

function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase().replace(/\s+/g, '');
}

function hashLicenseKey(normalizedKey: string): string {
  return crypto.createHash('sha256').update(`${LICENSE_SALT}${normalizedKey}`).digest('hex');
}

function validLicenseHashes(): Set<string> {
  const envHashes = (process.env.SITE_SCANNER_PRO_LICENSE_HASHES || process.env.KOFI_LICENSE_HASHES || '')
    .split(',')
    .map((hash) => hash.trim().toLowerCase())
    .filter((hash) => HASH_FORMAT.test(hash));

  return new Set([...DEFAULT_LICENSE_KEY_HASHES, ...envHashes]);
}

/**
 * Hanterar betalda Pro-licenser. Ko-fi visar plaintext-koden efter köp,
 * men SiteScanner sparar och accepterar bara SHA-256-digesten som token.
 */
export class LicenseService {
  public find(sessionId: string): LicenseRecord | null {
    return readStore()[sessionId] ?? null;
  }

  public create(sessionId: string, meta: Partial<LicenseRecord> = {}): LicenseRecord {
    const record: LicenseRecord = {
      sessionId,
      createdAt: new Date().toISOString(),
      ...meta
    };

    const store = readStore();
    store[sessionId] = record;
    writeStore(store);

    return record;
  }

  /**
   * Validerar antingen en plaintext Ko-fi-kod eller en tidigare utfärdad digest-token.
   */
  public async validateLicense(token: string): Promise<LicenseRecord | null> {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const normalized = normalizeLicenseKey(token);
    const hashes = validLicenseHashes();
    const digest = HASH_FORMAT.test(normalized.toLowerCase())
      ? normalized.toLowerCase()
      : LICENSE_FORMAT.test(normalized)
        ? hashLicenseKey(normalized)
        : '';

    if (!digest || !hashes.has(digest)) {
      return null;
    }

    const existing = this.find(digest);
    if (existing) {
      return existing;
    }

    return this.create(digest, { source: 'ko-fi' });
  }

  public looksLikeLicenseKey(key: string): boolean {
    return LICENSE_FORMAT.test(normalizeLicenseKey(key));
  }
}
