import type { Language } from './translations';

export interface MonitorCopy {
  title: string;
  subtitle: string;
  accountRequired: string;
  accountBody: string;
  signIn: string;
  addTitle: string;
  urlLabel: string;
  urlPlaceholder: string;
  intervalLabel: string;
  interval24: string;
  interval72: string;
  interval168: string;
  add: string;
  adding: string;
  loading: string;
  empty: string;
  emptyBody: string;
  lastCheck: string;
  nextCheck: string;
  never: string;
  score: string;
  delta: string;
  critical: string;
  warnings: string;
  improvements: string;
  runNow: string;
  checking: string;
  delete: string;
  confirmDelete: string;
  enabled: string;
  paused: string;
  pause: string;
  resume: string;
  report: string;
  noReport: string;
  history: string;
  schedulerNote: string;
  alertScoreDown: string;
  alertNewCritical: string;
  invalidUrl: string;
  invalidInterval: string;
  duplicate: string;
  limit: string;
  notFound: string;
  scanFailed: string;
  running: string;
  storageFailed: string;
  firstCheck: string;
}

const english: MonitorCopy = {
  title: 'Site monitoring',
  subtitle: 'Save up to three sites. We re-scan them on a schedule and keep the score history here.',
  accountRequired: 'Sign in to start monitoring',
  accountBody: 'Monitoring saves your sites to your account. Create a free account or sign in to continue.',
  signIn: 'Sign in',
  addTitle: 'Add a site',
  urlLabel: 'Website',
  urlPlaceholder: 'your-site.com',
  intervalLabel: 'Check interval',
  interval24: 'Every day',
  interval72: 'Every 3 days',
  interval168: 'Every week',
  add: 'Start monitoring',
  adding: 'Adding…',
  loading: 'Loading monitored sites…',
  empty: 'No monitored sites yet',
  emptyBody: 'Add your site above. The first check normally runs within a few minutes.',
  lastCheck: 'Last check',
  nextCheck: 'Next check',
  never: 'Not checked yet',
  score: 'Score',
  delta: 'Change',
  critical: 'Critical',
  warnings: 'Warnings',
  improvements: 'Improvements',
  runNow: 'Check now',
  checking: 'Checking…',
  delete: 'Remove',
  confirmDelete: 'Remove this monitored site? The score history will be deleted.',
  enabled: 'Active',
  paused: 'Paused',
  pause: 'Pause',
  resume: 'Resume',
  report: 'Open report',
  noReport: 'No report yet',
  history: 'Score history',
  schedulerNote:
    'Checks run while the server is awake. This self-hosted version shows alerts here; it does not send email.',
  alertScoreDown: 'Score dropped',
  alertNewCritical: 'New critical finding',
  invalidUrl: 'Enter a valid website address.',
  invalidInterval: 'Choose a valid interval.',
  duplicate: 'That site is already being monitored.',
  limit: 'You can monitor up to {max} sites. Remove one to add another.',
  notFound: 'The monitored site could not be found.',
  scanFailed: 'The check failed. It will be retried automatically.',
  running: 'A check is already running for this site.',
  storageFailed: 'The change could not be saved. Try again.',
  firstCheck: 'First check runs shortly.'
};

const swedish: MonitorCopy = {
  title: 'Sajtövervakning',
  subtitle: 'Spara upp till tre sajter. Vi skannar om dem enligt schema och behåller poänghistoriken här.',
  accountRequired: 'Logga in för att börja övervaka',
  accountBody: 'Övervakning sparar dina sajter i ditt konto. Skapa ett gratis konto eller logga in för att fortsätta.',
  signIn: 'Logga in',
  addTitle: 'Lägg till en sajt',
  urlLabel: 'Webbplats',
  urlPlaceholder: 'din-sajt.se',
  intervalLabel: 'Kontrollintervall',
  interval24: 'Varje dag',
  interval72: 'Var 3:e dag',
  interval168: 'Varje vecka',
  add: 'Starta övervakning',
  adding: 'Lägger till…',
  loading: 'Laddar övervakade sajter…',
  empty: 'Inga övervakade sajter ännu',
  emptyBody: 'Lägg till din sajt ovan. Första kontrollen körs normalt inom några minuter.',
  lastCheck: 'Senaste kontroll',
  nextCheck: 'Nästa kontroll',
  never: 'Inte kontrollerad ännu',
  score: 'Poäng',
  delta: 'Ändring',
  critical: 'Kritiska',
  warnings: 'Varningar',
  improvements: 'Förbättringar',
  runNow: 'Kör nu',
  checking: 'Kontrollerar…',
  delete: 'Ta bort',
  confirmDelete: 'Ta bort den övervakade sajten? Poänghistoriken försvinner.',
  enabled: 'Aktiv',
  paused: 'Pausad',
  pause: 'Pausa',
  resume: 'Återuppta',
  report: 'Öppna rapport',
  noReport: 'Ingen rapport ännu',
  history: 'Poänghistorik',
  schedulerNote:
    'Kontrollerna körs medan servern är vaken. Den här självhostade versionen visar larm här; den skickar ingen e-post.',
  alertScoreDown: 'Poängen sjönk',
  alertNewCritical: 'Nytt kritiskt fynd',
  invalidUrl: 'Ange en giltig webbplatsadress.',
  invalidInterval: 'Välj ett giltigt intervall.',
  duplicate: 'Den sajten övervakas redan.',
  limit: 'Du kan övervaka upp till {max} sajter. Ta bort en för att lägga till en annan.',
  notFound: 'Den övervakade sajten kunde inte hittas.',
  scanFailed: 'Kontrollen misslyckades. Den försöks igen automatiskt.',
  running: 'En kontroll körs redan för den här sajten.',
  storageFailed: 'Ändringen kunde inte sparas. Försök igen.',
  firstCheck: 'Första kontrollen körs inom kort.'
};

export function getMonitorCopy(language: Language): MonitorCopy {
  return language === 'sv' ? swedish : english;
}
