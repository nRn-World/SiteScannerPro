import fs from 'fs';
import path from 'path';
import { getStripeClient } from './stripe.service';

export interface LicenseRecord {
  sessionId: string;
  createdAt: string;
  amountTotal?: number;
  currency?: string;
}

type LicenseStore = Record<string, LicenseRecord>;

const DATA_DIR = path.join(process.cwd(), 'data');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');

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

/**
 * Hanterar betalda Pro-licenser. En licens-token är Stripe-sessionens ID
 * (cs_...) som endast utfärdas efter att betalningen verifierats mot Stripe.
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
   * Validerar en licens-token. Kollar först den lokala lagringen; hittas den
   * inte där (t.ex. efter flytt av server) verifieras den på nytt mot Stripe.
   */
  public async validateLicense(token: string): Promise<LicenseRecord | null> {
    if (!token || !token.startsWith('cs_')) {
      return null;
    }

    const existing = this.find(token);
    if (existing) {
      return existing;
    }

    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(token);

      if (session.payment_status === 'paid') {
        return this.create(session.id, {
          amountTotal: session.amount_total ?? undefined,
          currency: session.currency ?? undefined
        });
      }
    } catch {
      // Ogiltig token eller Stripe ej konfigurerat
    }

    return null;
  }
}
