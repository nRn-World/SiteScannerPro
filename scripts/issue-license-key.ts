/**
 * FAS 1.1: Generera unika licensnycklar per köp.
 *
 * Användning:
 *   npm run license:issue                    # 1 nyckel
 *   npx tsx scripts/issue-license-key.ts 5   # 5 nycklar
 *
 * Nyckeln skrivs ut EN gång (ska klistras in på Ko-fi tack-sidan till kunden).
 * Hashen sparas i data/license-keys.json – aldrig själva nyckeln.
 */
import { LicenseService } from '../src/services/license.service';

async function main(): Promise<void> {
  const countArg = Number(process.argv[2] || '1');
  const count = Number.isInteger(countArg) && countArg >= 1 && countArg <= 50 ? countArg : 1;

  const service = new LicenseService();
  console.log(`Genererar ${count} unika licensnyckel${count > 1 ? 'r' : ''}...\n`);

  for (let i = 0; i < count; i++) {
    const issued = service.issueUniqueKey('manual', 'issued via CLI');
    console.log(`--- Nyckel ${i + 1} (klistras in på kundens Ko-fi tack-sida) ---`);
    console.log(issued.key);
    console.log(`Hash registrerad: ${issued.hash.slice(0, 12)}…\n`);
  }

  console.log('Klart. Hasharna är sparade i data/license-keys.json.');
  console.log('Spärra en läckt nyckel: npx tsx -e "new (await import(\'./src/services/license.service\')).LicenseService().revokeKey(\'SSP-PRO-XX-XX-XX\')"');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
