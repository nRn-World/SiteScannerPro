import { getScanConcurrency, ScanQueue } from '../utils/scanQueue';

/** Delad skanningskö-instans med begränsad samtidighet. */
export const scanQueue = new ScanQueue(getScanConcurrency());
