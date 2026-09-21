import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { VipService } from '../src/services/vip.service';

// Isolerad datakatalog per testkörning
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vip-test-'));
process.env.DATA_DIR = tmpDir;
process.env.LICENSE_SIGNING_SECRET = 'test-secret-0123456789abcdef0123456789abcdef';

describe('VipService – engångslänkar med beständigt tillstånd (FAS 1.5)', () => {
  it('skapar, löser in och förbrukar en VIP-länk', () => {
    const service = new VipService();
    const link = service.createLink();
    assert.ok(link.code.startsWith('SSPV1.'));

    assert.ok(service.isAvailable(link.id), 'ny länk ska vara tillgänglig');

    const redeemed = service.redeem(link.code);
    assert.ok(redeemed, 'inlösen ska lyckas');

    assert.ok(service.consumeScan(link.id), 'skanning ska kunna förbrukas');
    assert.ok(!service.isAvailable(link.id), 'länken ska vara förbrukad');
    assert.equal(service.redeem(link.code), null, 'andra inlösen ska misslyckas');
  });

  it('avvisar ogiltiga koder', () => {
    const service = new VipService();
    assert.equal(service.redeem('ogiltig'), null);
    assert.equal(service.getStatus('ogiltig'), null);
  });

  it('skriver tillstånd till DATA_DIR (överlever omstart)', () => {
    const service = new VipService();
    const link = service.createLink();
    service.consumeScan(link.id);

    const consumedPath = path.join(tmpDir, 'vip-consumed.json');
    assert.ok(fs.existsSync(consumedPath), 'filen ska finnas i DATA_DIR');
    const raw = JSON.parse(fs.readFileSync(consumedPath, 'utf8')) as string[];
    assert.ok(raw.includes(link.id), 'förbrukad id ska vara sparad på disk');

    // Ny instans (som efter omstart) ska se samma tillstånd
    const freshService = new VipService();
    assert.ok(!freshService.isAvailable(link.id), 'tillståndet ska finnas kvar efter ny instans');
  });
});
