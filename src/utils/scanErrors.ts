import type { Language } from '../i18n/translations';
import { getVerifyCopy, type ScanFailureKind } from '../i18n/verifyCopy';

export interface ScanFailure {
  kind: ScanFailureKind;
  title: string;
  message: string;
  steps: string[];
  retryable: boolean;
  autoRetry: boolean;
  detail?: string;
  status?: number;
}

const AUTO_RETRY: ScanFailureKind[] = ['timeout', 'network', 'unavailable', 'server'];
const RETRYABLE: ScanFailureKind[] = [...AUTO_RETRY, 'rate_limit'];

export class ScanFailureError extends Error {
  constructor(public failure: ScanFailure) {
    super(failure.title);
    this.name = 'ScanFailureError';
  }
}

export function createScanFailure(
  kind: ScanFailureKind,
  language: Language,
  detail?: string,
  status?: number
): ScanFailure {
  const copy = getVerifyCopy(language).errors[kind];
  return {
    kind,
    title: copy.title,
    message: copy.message,
    steps: copy.steps,
    retryable: RETRYABLE.includes(kind),
    autoRetry: AUTO_RETRY.includes(kind),
    detail: detail?.trim() || undefined,
    status
  };
}

function kindFromResponse(status: number, code: string | undefined): ScanFailureKind {
  if (status === 401 || status === 403) return 'license';
  if (status === 408 || status === 504 || code === 'timeout') return 'timeout';
  if (status === 429) return 'rate_limit';
  if (code === 'blocked') return 'blocked';
  if (status === 400) return 'invalid_url';
  if (code === 'unavailable') return 'unavailable';
  if (status >= 500) return 'server';
  return 'server';
}

export async function failureFromResponse(
  res: Response,
  language: Language
): Promise<ScanFailure> {
  let payload: { error?: unknown; code?: unknown } | null = null;
  try {
    payload = await res.json();
  } catch {
    // Error bodies are optional; the status still identifies the failure class.
  }

  const code = typeof payload?.code === 'string' ? payload.code : undefined;
  const detail = typeof payload?.error === 'string' ? payload.error : undefined;
  return createScanFailure(kindFromResponse(res.status, code), language, detail, res.status);
}

export function failureFromException(error: unknown, language: Language): ScanFailure {
  if (error instanceof ScanFailureError) return error.failure;

  const name = (error as { name?: string } | null)?.name;
  if (name === 'TimeoutError' || name === 'AbortError') {
    return createScanFailure('timeout', language);
  }

  const detail = error instanceof Error ? error.message : undefined;
  return createScanFailure('network', language, detail);
}
