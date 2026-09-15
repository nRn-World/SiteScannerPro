import crypto from 'crypto';

const groups = Array.from({ length: 3 }, () => crypto.randomBytes(2).toString('hex').toUpperCase());
const key = `SSP-PRO-${groups.join('-')}`;
const hash = crypto.createHash('sha256').update(`SSP-LICENSE-v1|${key}`).digest('hex');

console.log('Ko-fi thank-you page code:');
console.log(key);
console.log('');
console.log('Add this hash to SITE_SCANNER_PRO_LICENSE_HASHES:');
console.log(hash);
