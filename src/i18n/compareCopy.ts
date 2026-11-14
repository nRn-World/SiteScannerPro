import type { Language } from './translations';

export interface CompareCopy {
  title: string;
  subtitle: string;
  openForm: string;
  collapseForm: string;
  yourSite: string;
  competitor: string;
  competitorPlaceholder: string;
  optional: string;
  run: string;
  running: string;
  runningHint: string;
  needCompetitor: string;
  error: string;
  errorInvalid: string;
  errorTooMany: string;
  errorDuplicate: string;
  errorFailed: string;
  errorTimeout: string;
  resultTitle: string;
  resultSubtitle: string;
  share: string;
  copied: string;
  openShare: string;
  print: string;
  newComparison: string;
  overall: string;
  score: string;
  metric: string;
  issues: string;
  topFindings: string;
  noIssues: string;
  high: string;
  medium: string;
  low: string;
  best: string;
  baseline: string;
  vsBaseline: string;
  mobile: string;
  desktop: string;
  vitals: string;
  lcp: string;
  cls: string;
  inp: string;
  ttfb: string;
  disclaimer: string;
  expires: string;
  loading: string;
  notFoundTitle: string;
  notFoundBody: string;
  back: string;
  saved: string;
  ruleset: string;
}

const english: CompareCopy = {
  title: 'Competitor comparison',
  subtitle: 'Compare your site with up to two competitors – same rules, same device, same moment.',
  openForm: 'Compare now',
  collapseForm: 'Hide',
  yourSite: 'Your site',
  competitor: 'Competitor',
  competitorPlaceholder: 'competitor.com',
  optional: 'optional',
  run: 'Compare sites',
  running: 'Scanning the sites…',
  runningHint: 'Two competitors can take up to a minute. Keep this tab open.',
  needCompetitor: 'Enter at least one competitor.',
  error: 'The comparison failed.',
  errorInvalid: 'One of the addresses is invalid.',
  errorTooMany: 'Compare with at most two competitors.',
  errorDuplicate: 'The same site cannot appear twice.',
  errorFailed: 'The comparison could not be completed. Try again.',
  errorTimeout: 'A site took too long to respond. Try again.',
  resultTitle: 'How the sites compare',
  resultSubtitle: 'Higher is better. The best value in each row is highlighted.',
  share: 'Copy comparison link',
  copied: 'Copied!',
  openShare: 'Open comparison',
  print: 'Print / PDF',
  newComparison: 'New comparison',
  overall: 'Overall',
  score: 'Score',
  metric: 'Metric',
  issues: 'Findings',
  topFindings: 'Most important finding',
  noIssues: 'No findings for this device.',
  high: 'Critical',
  medium: 'Warnings',
  low: 'Improvements',
  best: 'Best',
  baseline: 'Your site',
  vsBaseline: 'vs your site',
  mobile: 'Mobile',
  desktop: 'Desktop',
  vitals: 'Core Web Vitals',
  lcp: 'LCP',
  cls: 'CLS',
  inp: 'INP',
  ttfb: 'TTFB',
  disclaimer:
    'The comparison uses the same ruleset and device. Measurements can vary between runs.',
  expires: 'The link is saved for 30 days.',
  loading: 'Loading comparison…',
  notFoundTitle: 'Comparison not found',
  notFoundBody: 'The link is invalid or has expired.',
  back: 'Back to scanner',
  saved: 'Saved comparison',
  ruleset: 'Ruleset'
};

const swedish: CompareCopy = {
  title: 'Konkurrentjämförelse',
  subtitle: 'Jämför din sajt med upp till två konkurrenter – samma regler, samma enhet, samma tillfälle.',
  openForm: 'Jämför nu',
  collapseForm: 'Dölj',
  yourSite: 'Din sajt',
  competitor: 'Konkurrent',
  competitorPlaceholder: 'konkurrent.se',
  optional: 'valfritt',
  run: 'Jämför sajter',
  running: 'Skannar sajterna…',
  runningHint: 'Två konkurrenter kan ta upp till en minut. Låt fliken vara öppen.',
  needCompetitor: 'Ange minst en konkurrent.',
  error: 'Jämförelsen misslyckades.',
  errorInvalid: 'En av adresserna är ogiltig.',
  errorTooMany: 'Jämför med högst två konkurrenter.',
  errorDuplicate: 'Samma sajt kan inte förekomma två gånger.',
  errorFailed: 'Jämförelsen kunde inte genomföras. Försök igen.',
  errorTimeout: 'En sajt svarade för långsamt. Försök igen.',
  resultTitle: 'Så står sig sajterna',
  resultSubtitle: 'Högre är bättre. Bästa värdet i varje rad är markerat.',
  share: 'Kopiera jämförelselänk',
  copied: 'Kopierad!',
  openShare: 'Öppna jämförelsen',
  print: 'Skriv ut / PDF',
  newComparison: 'Ny jämförelse',
  overall: 'Totalt',
  score: 'Poäng',
  metric: 'Mätvärde',
  issues: 'Fynd',
  topFindings: 'Viktigaste fyndet',
  noIssues: 'Inga fynd för den här enheten.',
  high: 'Kritiska',
  medium: 'Varningar',
  low: 'Förbättringar',
  best: 'Bäst',
  baseline: 'Din sajt',
  vsBaseline: 'mot din sajt',
  mobile: 'Mobil',
  desktop: 'Dator',
  vitals: 'Core Web Vitals',
  lcp: 'LCP',
  cls: 'CLS',
  inp: 'INP',
  ttfb: 'TTFB',
  disclaimer:
    'Jämförelsen använder samma regelverk och enhet. Mätvärden kan variera mellan körningar.',
  expires: 'Länken sparas i 30 dagar.',
  loading: 'Laddar jämförelsen…',
  notFoundTitle: 'Jämförelsen kunde inte hittas',
  notFoundBody: 'Länken är felaktig eller har gått ut.',
  back: 'Till skannern',
  saved: 'Sparad jämförelse',
  ruleset: 'Regelverk'
};

export function getCompareCopy(language: Language): CompareCopy {
  return language === 'sv' ? swedish : english;
}
