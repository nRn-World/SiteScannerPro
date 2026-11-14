import type { Language } from './translations';

export type ScanFailureKind =
  | 'timeout'
  | 'blocked'
  | 'unavailable'
  | 'rate_limit'
  | 'invalid_url'
  | 'network'
  | 'server';

interface ErrorCopy {
  title: string;
  message: string;
  steps: string[];
}

interface VerifyCopy {
  options: {
    title: string;
    subtitle: string;
    device: string;
    both: string;
    mobile: string;
    desktop: string;
    categories: string;
    categoryHint: string;
    thorough: string;
    thoroughHint: string;
    scope: (devices: string, categories: number) => string;
  };
  score: {
    title: string;
    intro: string;
    formula: string;
    category: string;
    contribution: string;
    total: string;
    scope: (categories: number, devices: number) => string;
    checks: (rules: number, axe: number) => string;
    partial: string;
    lowEvidence: (checks: number, categories: number) => string;
    lowFull: (checks: number) => string;
    noEvidence: string;
    disclaimer: string;
    points: (value: string) => string;
  };
  errors: Record<ScanFailureKind, ErrorCopy>;
  retry: string;
  retrying: string;
  dismiss: string;
  autoRetry: string;
  technical: string;
  previousKept: string;
  rescan: string;
  rescanning: string;
  rescanHint: string;
  diff: {
    title: string;
    subtitle: string;
    resolved: string;
    remaining: string;
    added: string;
    noChanges: string;
    score: string;
    unchanged: string;
    showAll: (count: number) => string;
    deviceBoth: string;
    deviceMobile: string;
    deviceDesktop: string;
    severity: { High: string; Medium: string; Low: string };
    matching: string;
    previousMissing: string;
    scopeChanged: (prevCategories: number, prevDevices: number, categories: number, devices: number) => string;
  };
  data: {
    scanTitle: string;
    scanBullets: string[];
    privacy: string;
    share: string;
    history: string;
    monitoring: string;
    report: string;
    clear: string;
    clearConfirm: string;
  };
}

const sv: VerifyCopy = {
  options: {
    title: 'Så skannar vi',
    subtitle: 'Välj omfattning. Färre val går snabbare; fler val ger ett bredare underlag.',
    device: 'Enhet',
    both: 'Mobil + dator',
    mobile: 'Endast mobil',
    desktop: 'Endast dator',
    categories: 'Kategorier',
    categoryHint: 'Minst en kategori måste vara vald.',
    thorough: 'Grundlig analys',
    thoroughHint: 'Inkluderar filmstrip och extra skärmdumpar. Stäng av för snabbare svar.',
    scope: (devices, categories) => `${devices} · ${categories} av 5 kategorier`
  },
  score: {
    title: 'Så räknas poängen',
    intro:
      'Totalpoängen är ett medelvärde av kategorierna. Varje vald kategori väger lika – det finns ingen dold viktning.',
    formula: 'Formel',
    category: 'Kategori',
    contribution: 'Bidrag',
    total: 'Total',
    scope: (categories, devices) =>
      `Underlag: ${categories} av 5 kategorier och ${devices} av 2 enheter.`,
    checks: (rules, axe) => `${rules} regelkontroller och ${axe} tillgänglighetskontroller.`,
    partial:
      'Partiell analys: poängen gäller bara de valda kategorierna och enheterna. Den kan inte jämföras rakt av med en full skanning.',
    lowEvidence: (checks, categories) =>
      `Lågt resultat med begränsat underlag. Poängen bygger på ${checks} kontroller i ${categories} kategorier. Kör en full skanning innan du drar säkra slutsatser.`,
    lowFull: (checks) =>
      `Poängen bygger på ${checks} kontroller. Ett lågt resultat är en signal om tekniska problem, inte ett definitivt kvalitetsmått.`,
    noEvidence:
      'Den här rapporten saknar information om hur många kontroller som låg bakom poängen. Skanna om för att göra underlaget verifierbart.',
    disclaimer:
      'Poängen sammanfattar tekniska fynd. Den mäter inte design, innehåll, trovärdighet eller affärsvärde.',
    points: (value) => `${value} p`
  },
  errors: {
    timeout: {
      title: 'Skanningen tog för lång tid',
      message:
        'Servern fick inte svar från webbplatsen inom tidsgränsen. Det kan bero på långsam server, tung JavaScript eller tillfällig överbelastning.',
      steps: [
        'Kontrollera att webbplatsen öppnas normalt i en webbläsare.',
        'Prova en lättare skanning: endast mobil och färre kategorier.',
        'Försök igen om en stund – tillfälliga timeouts försöks automatiskt en gång.'
      ]
    },
    blocked: {
      title: 'Adressen blockerades',
      message:
        'Av säkerhetsskäl skannar vi inte privata eller interna adresser, och vissa brandväggar eller bot-skydd stoppar skannern.',
      steps: [
        'Använd en publik https-adress, inte localhost eller ett privat IP.',
        'Kontrollera att sajten inte blockerar automatiska besök.',
        'Prova en annan publik sida på samma sajt om startsidan är skyddad.'
      ]
    },
    unavailable: {
      title: 'Webbplatsen kunde inte läsas',
      message:
        'Sajten svarade med ett fel eller nekade åtkomst. Det kan vara 403/404/5xx, ett bot-skydd eller att sajten tillfälligt är nere.',
      steps: [
        'Öppna adressen i en webbläsare och kontrollera att den fungerar utan inloggning.',
        'Säkerställ att sidan är publik och inte kräver cookies för att visa innehåll.',
        'Prova igen eller skanna en undersida som är tillgänglig.'
      ]
    },
    rate_limit: {
      title: 'För många skanningar',
      message: 'Du har nått gränsen för hur många skanningar som får köras under en kort period.',
      steps: [
        'Vänta någon minut och försök igen.',
        'Undvik att skanna samma adress upprepade gånger direkt efter varandra.',
        'Kontakta oss om gränsen känns felaktig.'
      ]
    },
    invalid_url: {
      title: 'Webbadressen är ogiltig',
      message: 'Adressen kunde inte tolkas som en publik http- eller https-URL.',
      steps: [
        'Skriv till exempel example.com eller https://example.com.',
        'Ta bort mellanslag och citattecken.',
        'Kontrollera att domänen är korrekt stavad.'
      ]
    },
    network: {
      title: 'Kunde inte nå servern',
      message:
        'Anslutningen till SiteScanner avbröts. Det kan bero på nätverksproblem eller att servern startar om.',
      steps: [
        'Kontrollera din internetanslutning.',
        'Försök igen – tillfälliga nätverksfel försöks automatiskt en gång.',
        'Ladda om sidan om problemet kvarstår.'
      ]
    },
    server: {
      title: 'Servern fick ett tillfälligt fel',
      message: 'SiteScanner kunde inte slutföra skanningen på grund av ett internt fel.',
      steps: [
        'Försök igen – tillfälliga serverfel försöks automatiskt en gång.',
        'Ladda om sidan.',
        'Kontakta oss med tidsstämpeln om felet återkommer.'
      ]
    }
  },
  retry: 'Försök igen',
  retrying: 'Försöker igen…',
  dismiss: 'Stäng',
  autoRetry: 'Tillfälligt fel – ett nytt försök görs automatiskt…',
  technical: 'Teknisk information',
  previousKept: 'Ditt tidigare resultat finns kvar nedan. Du kan försöka igen utan att tappa det.',
  rescan: 'Skanna om',
  rescanning: 'Skannar om…',
  rescanHint: 'Gjorde du en åtgärd? Skanna om för att se vad som försvann och vad som kvarstår.',
  diff: {
    title: 'Förändring sedan förra skanningen',
    subtitle: 'Jämfört med föregående skanning av samma URL.',
    resolved: 'Försvunna',
    remaining: 'Kvarstår',
    added: 'Nya',
    noChanges: 'Inga nya eller försvunna problem – resultatet är oförändrat.',
    score: 'Poäng',
    unchanged: 'oförändrad',
    showAll: (count) => `Visa alla ${count}`,
    deviceBoth: 'Båda enheter',
    deviceMobile: 'Mobil',
    deviceDesktop: 'Dator',
    severity: { High: 'Allvarlig', Medium: 'Medel', Low: 'Låg' },
    matching:
      'Matchning sker på kategori och problemtitel. Samma problem med ändrad allvarlighetsgrad räknas som kvarstående.',
    previousMissing: 'Föregående resultat saknas.',
    scopeChanged: (prevCategories, prevDevices, categories, devices) =>
      `Omfånget skiljer sig: föregående skanning hade ${prevCategories} kategorier och ${prevDevices} enheter, den nya har ${categories} kategorier och ${devices} enheter. Nya och försvunna fynd kan bero på det.`
  },
  data: {
    scanTitle: 'Integritet & datalagring',
    scanBullets: [
      'Till servern skickas webbadressen, sidans HTML och headers, tekniska mätvärden samt skärmdumpar.',
      'Skanningen kräver inget konto. Resultatet sparas som en delbar rapport i 30 dagar.',
      'Din lokala historik ligger bara i webbläsaren och kan rensas under Historik.'
    ],
    privacy: 'Läs integritetspolicyn',
    share: 'Alla med länken kan öppna rapporten. Den finns kvar i 30 dagar och innehåller skärmdumpar.',
    history: 'Historiken sparas endast lokalt i din webbläsare (localStorage). Den skickas inte till servern.',
    monitoring:
      'Ditt konto lagrar e-postadress och övervakade webbadresser tills du tar bort dem. Varje kontroll sparar en rapport i 30 dagar.',
    report: 'Sparad rapport · finns i 30 dagar · alla med länken kan öppna den.',
    clear: 'Rensa lokal historik',
    clearConfirm: 'Rensa hela den lokala historiken? Det går inte att ångra.'
  }
};

const en: VerifyCopy = {
  options: {
    title: 'How we scan',
    subtitle: 'Choose the scope. Fewer options are faster; more options give broader evidence.',
    device: 'Device',
    both: 'Mobile + desktop',
    mobile: 'Mobile only',
    desktop: 'Desktop only',
    categories: 'Categories',
    categoryHint: 'At least one category must be selected.',
    thorough: 'Thorough analysis',
    thoroughHint: 'Includes filmstrip and extra screenshots. Turn off for a faster response.',
    scope: (devices, categories) => `${devices} · ${categories} of 5 categories`
  },
  score: {
    title: 'How the score is calculated',
    intro:
      'The total score is the average of the categories. Every selected category is weighted equally – there is no hidden weighting.',
    formula: 'Formula',
    category: 'Category',
    contribution: 'Contribution',
    total: 'Total',
    scope: (categories, devices) => `Evidence: ${categories} of 5 categories and ${devices} of 2 devices.`,
    checks: (rules, axe) => `${rules} rule checks and ${axe} accessibility checks.`,
    partial:
      'Partial analysis: the score only covers the selected categories and devices. It cannot be compared directly with a full scan.',
    lowEvidence: (checks, categories) =>
      `Low score with limited evidence. The score is based on ${checks} checks across ${categories} categories. Run a full scan before drawing firm conclusions.`,
    lowFull: (checks) =>
      `The score is based on ${checks} checks. A low score signals technical problems; it is not a definitive measure of quality.`,
    noEvidence:
      'This report does not say how many checks produced the score. Rescan to make the evidence verifiable.',
    disclaimer:
      'The score summarises technical findings. It does not measure design, content, trust or business value.',
    points: (value) => `${value} pts`
  },
  errors: {
    timeout: {
      title: 'The scan took too long',
      message:
        'The server did not receive a response within the time limit. This can be caused by a slow server, heavy JavaScript or temporary overload.',
      steps: [
        'Check that the website opens normally in a browser.',
        'Try a lighter scan: mobile only and fewer categories.',
        'Try again shortly – temporary timeouts are retried automatically once.'
      ]
    },
    blocked: {
      title: 'The address was blocked',
      message:
        'For security reasons we do not scan private or internal addresses, and some firewalls or bot protection block the scanner.',
      steps: [
        'Use a public https address, not localhost or a private IP.',
        'Check that the site does not block automated visits.',
        'Try another public page on the same site if the home page is protected.'
      ]
    },
    unavailable: {
      title: 'The website could not be read',
      message:
        'The site returned an error or denied access. This can be a 403/404/5xx, bot protection or a temporary outage.',
      steps: [
        'Open the address in a browser and check that it works without signing in.',
        'Make sure the page is public and does not require cookies to render.',
        'Try again or scan a subpage that is reachable.'
      ]
    },
    rate_limit: {
      title: 'Too many scans',
      message: 'You have reached the limit for scans within a short period.',
      steps: [
        'Wait a minute and try again.',
        'Avoid scanning the same address repeatedly in quick succession.',
        'Contact us if the limit seems incorrect.'
      ]
    },
    invalid_url: {
      title: 'The web address is invalid',
      message: 'The address could not be parsed as a public http or https URL.',
      steps: [
        'Enter something like example.com or https://example.com.',
        'Remove spaces and quotation marks.',
        'Check that the domain is spelled correctly.'
      ]
    },
    network: {
      title: 'Could not reach the server',
      message:
        'The connection to SiteScanner was interrupted. This can be a network problem or a server restart.',
      steps: [
        'Check your internet connection.',
        'Try again – temporary network errors are retried automatically once.',
        'Reload the page if the problem persists.'
      ]
    },
    server: {
      title: 'The server hit a temporary error',
      message: 'SiteScanner could not complete the scan because of an internal error.',
      steps: [
        'Try again – temporary server errors are retried automatically once.',
        'Reload the page.',
        'Contact us with the timestamp if the error returns.'
      ]
    }
  },
  retry: 'Try again',
  retrying: 'Trying again…',
  dismiss: 'Dismiss',
  autoRetry: 'Temporary error – retrying automatically…',
  technical: 'Technical details',
  previousKept: 'Your previous result is still available below. You can retry without losing it.',
  rescan: 'Rescan',
  rescanning: 'Rescanning…',
  rescanHint: 'Made a change? Rescan to see what disappeared and what remains.',
  diff: {
    title: 'Change since the previous scan',
    subtitle: 'Compared with the previous scan of the same URL.',
    resolved: 'Resolved',
    remaining: 'Remaining',
    added: 'New',
    noChanges: 'No new or resolved issues – the result is unchanged.',
    score: 'Score',
    unchanged: 'unchanged',
    showAll: (count) => `Show all ${count}`,
    deviceBoth: 'Both devices',
    deviceMobile: 'Mobile',
    deviceDesktop: 'Desktop',
    severity: { High: 'High', Medium: 'Medium', Low: 'Low' },
    matching:
      'Matching uses category and issue title. The same issue with a changed severity counts as remaining.',
    previousMissing: 'The previous result is missing.',
    scopeChanged: (prevCategories, prevDevices, categories, devices) =>
      `The scope differs: the previous scan had ${prevCategories} categories and ${prevDevices} devices, the new one has ${categories} categories and ${devices} devices. New and resolved findings may be caused by that.`
  },
  data: {
    scanTitle: 'Privacy & data storage',
    scanBullets: [
      'The server receives the web address, the page HTML and headers, technical measurements and screenshots.',
      'Scanning does not require an account. The result is saved as a shareable report for 30 days.',
      'Your local history stays in the browser and can be cleared under History.'
    ],
    privacy: 'Read the privacy policy',
    share: 'Anyone with the link can open the report. It is kept for 30 days and contains screenshots.',
    history: 'History is stored only in your browser (localStorage). It is not sent to the server.',
    monitoring:
      'Your account stores the email address and monitored URLs until you delete them. Each check saves a report for 30 days.',
    report: 'Saved report · kept for 30 days · anyone with the link can open it.',
    clear: 'Clear local history',
    clearConfirm: 'Clear all local history? This cannot be undone.'
  }
};

export function getVerifyCopy(language: Language): VerifyCopy {
  return language === 'sv' ? sv : en;
}
