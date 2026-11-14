import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pathForViewChange } from '../src/utils/viewNavigation';

const REPORT = '/r/3570e862a115b454';
const COMPARISON = '/c/3570e862a115b454';

describe('viewNavigation – rensar sparade rapportlänkar', () => {
  for (const view of ['contact', 'about', 'terms'] as const) {
    it(`rensar ${REPORT} vid byte till ${view}`, () => {
      assert.equal(pathForViewChange(view, REPORT, ''), '/');
    });
  }

  it('rensar rapportlänk med avslutande snedstreck', () => {
    assert.equal(pathForViewChange('contact', `${REPORT}/`, ''), '/');
  });

  it('rensar även jämförelselänkar och behåller baspath', () => {
    assert.equal(pathForViewChange('about', COMPARISON, ''), '/');
    assert.equal(pathForViewChange('terms', REPORT, '/SiteScannerPro'), '/SiteScannerPro/');
  });

  it('lämnar vanliga sidor orörda', () => {
    assert.equal(pathForViewChange('contact', '/', ''), null);
    assert.equal(pathForViewChange('about', '/SiteScannerPro/', '/SiteScannerPro'), null);
  });

  it('går till /monitors och rensar monitorvägen vid hemgång', () => {
    assert.equal(pathForViewChange('monitors', REPORT, ''), '/monitors');
    assert.equal(pathForViewChange('home', '/monitors', ''), '/');
  });
});
