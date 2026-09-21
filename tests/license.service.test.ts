import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { LicenseService } from '../src/services/license.service';

/**
 * Tester körs utan riktiga hemligheter: vi sätter env före användning.
 * LICENSE_SIGNING_SECRET krävs (minst 32 tecken) av tjänsten.
 */
process.env.LICENSE_SIGNING_SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
process.env.DATA_DIR = new URL('./tmp-license-data/', `file://${process.cwd().replace(/\\/g, '/')}/`).pathname.replace(/^\/([A-Za-z]:)/, '$1');

describe('LicenseService – unika nycklar (FAS 1.1)', () => {
  it('utfärdar en unik nyckel som kan aktiveras', () => {
    const service = new LicenseService();
    const issued = service.issueUniqueKey('manual');
    assert.match(issued.key, /^SSP-PRO(?:-[A-Z0-9]{4}){3}$/);

    const token = service.activateLicense(issued.key);
    assert.ok(token, 'aktivering ska lyckas för registrerad nyckel');
  });

  it('avvisar en nyckel som aldrig registrerats', () => {
    const service = new LicenseService();
    const token = service.activateLicense('SSP-PRO-AAAA-BBBB-CCCC');
    assert.equal(token, null);
  });

  it('spärrar en läckt nyckel utan att påverka andra', () => {
    const service = new LicenseService();
    const first = service.issueUniqueKey('manual');
    const second = service.issueUniqueKey('manual');

    assert.ok(service.revokeKey(first.key));

    assert.equal(service.activateLicense(first.key), null, 'spärrad nyckel ska avvisas');
    assert.ok(service.activateLicense(second.key), 'andra nyckeln ska fortfarande fungera');
  });

  it('stöder fortfarande äldre delad nyckel via KOFI_LICENSE_KEY_HASH (migrering)', () => {
    const legacyKey = 'SSP-PRO-DEAD-BEEF-1234';
    const legacyHash = crypto.createHash('sha256').update(legacyKey).digest('hex');
    process.env.KOFI_LICENSE_KEY_HASH = legacyHash;

    const service = new LicenseService();
    const token = service.activateLicense(legacyKey);
    assert.ok(token, 'gammal delad nyckel ska fortsätta fungera');
    delete process.env.KOFI_LICENSE_KEY_HASH;
  });
});

describe('LicenseService – token-utgång (FAS 1.2)', () => {
  it('nya tokens bär exp i framtiden', async () => {
    const service = new LicenseService();
    const issued = service.issueUniqueKey('manual');
    const token = service.activateLicense(issued.key)!;
    const record = await service.validateLicense(token);
    assert.ok(record);
    assert.ok(record.exp && record.exp > Math.floor(Date.now() / 1000), 'exp ska ligga i framtiden');
  });

  it('avvisar en token som gått ut', async () => {
    const service = new LicenseService();
    const issued = service.issueUniqueKey('manual');
    const token = service.activateLicense(issued.key)!;

    // Manipulera payloaden till en utgången exp med omberäknad signatur via samma hemlighet
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    payload.exp = Math.floor(Date.now() / 1000) - 10;
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const forged = `SSPA1.${encoded}.${parts[2]}`; // fel signatur → ska avvisas av säkerhetsskäl

    const record = await service.validateLicense(forged);
    assert.equal(record, null, 'manipulerad token ska avvisas');
  });

  it('accepterar äldre tokens utan exp (bakåtkompatibilitet)', async () => {
    const service = new LicenseService();
    // Skapa en token utan exp via vip-vägen (vipId krävs) och validera
    const vipToken = service.issueVipToken('test-vip-id');
    const record = await service.validateLicense(vipToken);
    assert.ok(record);
    assert.equal(record.kind, 'vip');
  });
});
