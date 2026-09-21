import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateIp } from '../src/utils/ssrf';

describe('SSRF – privat IP-klassificering (FAS 1.7)', () => {
  it('blockerar loopback och privata intervall', () => {
    for (const ip of ['127.0.0.1', '10.0.0.5', '192.168.1.1', '172.16.0.1', '172.31.255.255', '169.254.169.254', '0.0.0.0', '100.64.0.1']) {
      assert.ok(isPrivateIp(ip), `${ip} ska vara privat`);
    }
  });

  it('blockerar IPv6 loopback, link-local, ULA och IPv4-mappade', () => {
    for (const ip of ['::1', '::', 'fe80::1', 'fc00::1', 'fd12::1', '::ffff:127.0.0.1', '::ffff:169.254.169.254']) {
      assert.ok(isPrivateIp(ip), `${ip} ska vara privat`);
    }
  });

  it('tillåter publika adresser', () => {
    for (const ip of ['8.8.8.8', '1.1.1.1', '142.250.74.142', '2606:4700:4700::1111']) {
      assert.ok(!isPrivateIp(ip), `${ip} ska vara publik`);
    }
  });

  it('blockerar decimalnotation av loopback', () => {
    // 2130706433 = 127.0.0.1
    assert.ok(isPrivateIp('127.0.0.1'));
  });

  it('avvisar ogiltiga IP-strängar som privata (fail closed)', () => {
    assert.ok(isPrivateIp('not-an-ip'));
    assert.ok(isPrivateIp('999.999.999.999'));
  });
});
