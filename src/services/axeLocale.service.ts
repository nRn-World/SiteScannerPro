import { createRequire } from 'module';
import axe from 'axe-core';
import type { Language } from '../i18n/translations';

const require = createRequire(import.meta.url);

const AXE_LOCALES: Partial<Record<Language, axe.Locale>> = {
  sv: require('axe-core/locales/sv.json'),
  es: require('axe-core/locales/es.json'),
  fr: require('axe-core/locales/fr.json')
};

export function getAxeLocale(language?: Language): axe.Locale | undefined {
  if (!language) return undefined;
  return AXE_LOCALES[language];
}

/** Konfigurerar axe-core med rätt språk (Node.js / jsdom). */
export function configureAxeLocale(language?: Language): void {
  const locale = getAxeLocale(language);
  if (locale) {
    axe.configure({ locale });
  } else if (typeof axe.resetLocale === 'function') {
    axe.resetLocale();
  }
}

export function parseScanLanguage(raw: unknown): Language {
  const supported: Language[] = ['en', 'sv', 'tr', 'es', 'fr', 'ar'];
  if (typeof raw === 'string' && supported.includes(raw as Language)) {
    return raw as Language;
  }
  return 'en';
}

/** Översätter axe-fel via regel-id – fungerar även om axe.configure misslyckas. */
export function localizeAxeViolation(
  ruleId: string,
  help: string,
  description: string,
  failureSummary: string | undefined,
  language?: Language
): { title: string; description: string } {
  const locale = getAxeLocale(language);
  const rule = locale?.rules?.[ruleId as keyof typeof locale.rules];

  const title =
    rule && typeof rule === 'object' && 'help' in rule && typeof rule.help === 'string'
      ? rule.help
      : help;

  let localizedDescription =
    rule && typeof rule === 'object' && 'description' in rule && typeof rule.description === 'string'
      ? rule.description
      : description;

  if (failureSummary) {
    localizedDescription = `${localizedDescription} (${failureSummary})`;
  }

  return { title, description: localizedDescription };
}
