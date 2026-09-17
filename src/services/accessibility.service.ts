import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import type { Language } from '../i18n/translations';
import { configureAxeLocale, localizeAxeViolation } from './axeLocale.service';
import { ScannerIssue, Severity } from '../rules/types';
import { scanMsg } from '../i18n/scanLocale';

function mapImpact(impact: string | null | undefined): Severity {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'High';
    case 'moderate':
      return 'Medium';
    default:
      return 'Low';
  }
}

/**
 * Kör axe-core (WCAG-tillgänglighet) mot hämtad HTML i en headless DOM.
 */
export async function runAxeAudit(html: string, url: string, language?: Language): Promise<ScannerIssue[]> {
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  const { window } = dom;

  // axe-core kräver window/document som globala i Node.js
  const priorWindow = globalThis.window;
  const priorDocument = globalThis.document;
  (globalThis as Record<string, unknown>).window = window;
  (globalThis as Record<string, unknown>).document = window.document;

  try {
    configureAxeLocale(language);

    const results = await axe.run(window.document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
      }
    });

    const issues: ScannerIssue[] = [];

    for (const violation of results.violations) {
      const nodes = violation.nodes.slice(0, 4);
      nodes.forEach((node, index) => {
        const target = node?.target?.join(' ') ?? '';
        const failure = node?.failureSummary ?? '';
        const localized = localizeAxeViolation(
          violation.id,
          violation.help,
          violation.description,
          failure || undefined,
          language
        );
        const suffix = nodes.length > 1 ? ` (#${index + 1})` : '';

        issues.push({
          category: 'Accessibility',
          severity: mapImpact(violation.impact),
          title: `${localized.title}${suffix}`,
          description: `${localized.description}${target ? ` – Element: ${target}` : ''}${
            violation.nodes.length > nodes.length
              ? language === 'sv'
                ? ` (${violation.nodes.length} förekomster totalt)`
                : ` (${violation.nodes.length} occurrences total)`
              : ''
          }`,
          recommendation: scanMsg(language, 'a11y.axe.fix', 'recommendation', { title: localized.title, description: localized.description, url: violation.helpUrl }),
          codeSnippet: node?.html?.slice(0, 500),
          selector: target || undefined,
          source: 'axe' as const,
          device: 'both'
        });
      });
    }

    return issues;
  } finally {
    if (priorWindow === undefined) {
      delete (globalThis as Record<string, unknown>).window;
    } else {
      (globalThis as Record<string, unknown>).window = priorWindow;
    }
    if (priorDocument === undefined) {
      delete (globalThis as Record<string, unknown>).document;
    } else {
      (globalThis as Record<string, unknown>).document = priorDocument;
    }
    dom.window.close();
  }
}

export function countAxeRules(): number {
  return axe.getRules().length;
}
