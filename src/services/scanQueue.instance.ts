import { getScanConcurrency, ScanQueue } from '../utils/scanQueue';

/** Delad skanningskö-instans – Pro (priority 0) körs före gratis (priority 1). */
export const scanQueue = new ScanQueue(getScanConcurrency());
