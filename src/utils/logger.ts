/**
 * Nivåbaserad strukturerad loggning med korrelations-ID.
 * Inga fullständiga skannade URL:er loggas (endast host), inga hemligheter.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

function minLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL || '').trim().toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw as LogLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

const RANK = { info: 1, warn: 2, error: 3, debug: 0 } as const;

/** Maskera allt som kan se ut som en nyckel/token/signeringshemlighet. */
export function maskSecrets(value: string): string {
  return value
    .replace(/(SSP-(?:PRO|V1)-[A-Z0-9-]+)/gi, 'SSP-***')
    .replace(/(sk_live_|sk_test_|rk_live_|rk_test_)[A-Za-z0-9]+/g, '$1***')
    .replace(/(Bearer\s+)\S+/gi, '$1***')
    .replace(/(LICENSE_SIGNING_SECRET|KOFI_LICENSE_KEY_HASH|VIP_ADMIN_SECRET|EMAIL_PASS|API_KEY)(=|:\s*")[^"\s,}]+/gi, '$1=***');
}

/** Logga endast host, aldrig path/query – skyddar besökarnas integritet. */
export function hostOnly(rawUrl: string): string {
  try {
    return new URL(rawUrl).host;
  } catch {
    return '(invalid)';
  }
}

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export function createLogger(correlationId?: string): Logger {
  const prefix = correlationId ? `[${correlationId}]` : '';
  const write = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    if (LEVEL_RANK[level] < LEVEL_RANK[minLevel()]) return;
    const clean = maskSecrets(String(msg));
    const metaStr = meta && Object.keys(meta).length
      ? ` ${maskSecrets(JSON.stringify(meta))}`
      : '';
    const line = `${new Date().toISOString()} ${RANK[level] >= RANK.warn ? 'W' : level === 'error' ? 'E' : 'I'} ${prefix} ${clean}${metaStr}`;
    if (RANK[level] >= RANK.warn || level === 'error') {
      console.error(line);
    } else {
      console.log(line);
    }
  };
  return {
    debug: (m, meta) => write('debug', m, meta),
    info: (m, meta) => write('info', m, meta),
    warn: (m, meta) => write('warn', m, meta),
    error: (m, meta) => write('error', m, meta)
  };
}

export function newCorrelationId(): string {
  return `scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
