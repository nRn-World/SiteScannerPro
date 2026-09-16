import {
  IssueId,
  IssueValues,
  LocalizedScanResult,
  LocalizedScannerIssue,
  ScanResult
} from '../rules/types';
import { getLanguage, Language } from './translations';

interface IssueTranslation {
  title: string;
  description: string;
  recommendation: string;
  /** English task body only — wrapped by wrapAgentCommand for every language. */
  agentPrompt: string;
}

interface ReportTranslation {
  summaries: [string, string, string, string];
  evidenceLabel: string;
  issues: Record<IssueId, IssueTranslation>;
}

/**
 * Shared English AI-agent command wrapper used for every language.
 * Localized title/description/recommendation stay elsewhere; this prompt is always EN.
 */
function wrapAgentCommand(
  issueId: IssueId,
  issueTitle: string,
  taskBody: string,
  evidenceLabel: string,
  evidenceHtml?: string
): string {
  const evidence = evidenceHtml?.trim()
    ? `\n\n${evidenceLabel}\n${evidenceHtml.trim()}`
    : '';

  return `SITE SCANNER PRO — AI AGENT COMMAND

SiteScanner Pro scanned this website and found the exact issue below.
Treat this message as a strict, single-issue fix order for an AI coding agent (Cursor, Claude, Copilot, etc.).

SOURCE: SiteScanner Pro
ISSUE ID: ${issueId}
ISSUE: ${issueTitle}

SCOPE (STRICT):
- Fix ONLY this issue.
- Make no other changes.
- Do not refactor, clean up, rename, reformat, or "improve" unrelated code.
- Do not edit unrelated files.
- Do not add extras, drive-by fixes, comments, docs, tests, or dependencies unless required to complete this fix.

HARD RULES:
1. Touch only the minimum files/lines needed for this issue.
2. Preserve existing behavior, design, and layout outside this fix.
3. If something is ambiguous, choose the smallest safe change that resolves this issue ID.
4. Stop when this issue is fixed — do not continue with other findings.

TASK:
${taskBody}

DONE WHEN: this specific SiteScanner Pro issue (${issueId}) is resolved, the change set contains nothing unrelated, and you can briefly confirm what you changed for this issue only.${evidence}`;
}

const en: ReportTranslation = {
  summaries: [
    'The website needs substantial improvements to meet basic standards.',
    'The website has several issues that should be fixed to improve user experience and SEO.',
    'Good work, but a few areas can still be optimized to reach the highest level.',
    'The website looks excellent! It follows most best practices.'
  ],
  evidenceLabel: 'Evidence from the scan:',
  issues: {
    'seo.missing-title': {
      title: 'Missing title tag',
      description: 'The page has no <title> tag, which is critical for search engines.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Add exactly one descriptive <title> inside <head> for this page.

1. Find the HTML document, layout, or framework head config that renders this page.
2. Add <title>Your clear page title</title> inside <head>.
3. Make the title unique, human readable, and specific to the page content.
4. Do not leave the title empty and do not add duplicate <title> tags.

Target outcome: the rendered page source contains one meaningful <title>.`
    },
    'seo.missing-meta-description': {
      title: 'Missing meta description',
      description: 'The page has no meta description.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Add one clear <meta name="description"> for this page.

1. Find the HTML document, layout, or SEO config that controls this page head.
2. Add <meta name="description" content="..."> inside <head>.
3. Write 1 to 2 sentences that summarize the page in plain language.
4. Keep it unique to this page and under about 160 characters.

Target outcome: the rendered page source contains one meaningful meta description.`
    },
    'seo.missing-h1': {
      title: 'Missing H1 heading',
      description: 'The page has no main heading (H1).',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Ensure this page has exactly one semantic H1 that describes the main content.

1. Open the template, component, or page that renders this URL.
2. Add exactly one <h1> near the top of the main content.
3. Use clear, page-specific text that matches what the page is about.
4. Do not create multiple H1 tags and do not hide the H1 from users.
5. Keep the existing visual design and layout.

Target outcome: the rendered page has exactly one visible H1 that matches the page purpose.`
    },
    'performance.slow-response-high': {
      title: 'Slow response time',
      description: 'The server took {loadTime} ms to respond.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Reduce Time to First Byte for this page. The server took {loadTime} ms to respond.

1. Inspect the server route, page data fetching, and middleware that handle this URL.
2. Remove unnecessary blocking work from the critical request path.
3. Add caching where safe: HTTP cache headers, CDN, edge cache, or application cache.
4. Optimize database queries, API calls, and SSR work that delay the first byte.
5. Prefer streaming or deferred loading for non-critical data.

Target outcome: the first response for this page is clearly faster and the critical path is leaner.`
    },
    'performance.slow-response-medium': {
      title: 'Somewhat slow response time',
      description: 'The server took {loadTime} ms to respond.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Improve TTFB for this page without changing page content. The server took {loadTime} ms to respond.

1. Inspect the route handler, SSR path, and any middleware for this page.
2. Cache stable responses or fragments where safe.
3. Cut blocking I/O and avoid serial waits that can run in parallel.
4. Keep only required work before the first byte is sent.

Target outcome: the page responds faster and the critical path is shorter.`
    },
    'security.insecure-http': {
      title: 'Unencrypted connection',
      description: 'The page uses HTTP instead of HTTPS.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Serve the site only over HTTPS and redirect HTTP to HTTPS.

1. Enable TLS/SSL for the hosting, reverse proxy, or platform that serves this site.
2. Force HTTPS redirects for all HTTP requests.
3. Update absolute links, canonical URLs, and assets to use https://.
4. Verify cookies and auth flows still work over HTTPS.

Target outcome: visiting the site over HTTP redirects to HTTPS and all pages load securely.`
    },
    'security.missing-hsts': {
      title: 'Missing HSTS header',
      description: 'The page does not force browsers to use HTTPS (HSTS).',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Add a correct HSTS response header.

1. Find where HTTP response headers are set for this site (server, reverse proxy, CDN, or framework middleware).
2. Add: Strict-Transport-Security: max-age=31536000; includeSubDomains
3. Apply it only after HTTPS already works correctly.
4. Keep the header on all production HTTPS responses.

Target outcome: the live HTTPS response includes a valid Strict-Transport-Security header.`
    },
    'security.clickjacking-risk': {
      title: 'Clickjacking risk',
      description: 'The page lacks protection against being embedded in iframes.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Prevent unwanted framing of the site (clickjacking protection).

1. Find where HTTP response headers are set for this site.
2. Add one of these protections:
   - X-Frame-Options: DENY
   - or Content-Security-Policy: frame-ancestors 'none'
3. If intentional embedding is required for trusted parents only, use SAMEORIGIN or an explicit allowlist instead of open framing.
4. Do not weaken other security headers while doing this.

Target outcome: the live response blocks unexpected iframe embedding.`
    },
    'accessibility.missing-alt-text': {
      title: 'Missing alt text',
      description: '{count} images are missing an alt attribute.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Fix missing image alt text. {count} images are missing an alt attribute.

1. Find all <img> tags and image components that render without alt.
2. Add short, specific alt text that describes the image purpose for screen readers.
3. Use alt="" only for purely decorative images.
4. Prefer reusable image components that require alt as a prop.
5. Do not invent fake SEO keyword stuffing in alt text.

Target outcome: no meaningful image is left without an appropriate alt attribute.`
    },
    'accessibility.missing-language': {
      title: 'Missing language attribute',
      description: 'The HTML tag has no lang attribute.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Declare the document language on the root <html> element.

1. Find the root HTML document or app shell that renders <html>.
2. Add the correct lang value, for example lang="en" or the real page language.
3. If the site is multilingual, set lang dynamically from the active locale.
4. Keep one correct lang value on the root html element.

Target outcome: the rendered page has <html lang="..."> with the correct language code.`
    },
    'code.inline-styles': {
      title: 'Inline CSS in use',
      description: 'Found {count} elements with inline styles. This makes the code harder to maintain and can result in less consistent formatting.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Move avoidable inline CSS out of the markup. Found {count} elements with style="..." attributes.

1. Locate elements that use inline style attributes.
2. Extract the styles into the project stylesheet or component styling system.
3. Replace inline styles with classes or design-system utilities.
4. Preserve the visual result and responsive behavior.
5. Leave only rare dynamic styles inline if there is no clean alternative.

Target outcome: avoidable inline styles are removed and the UI still looks the same.`
    },
    'code.deprecated-tags': {
      title: 'Deprecated HTML tags',
      description: 'The page uses deprecated tags (such as <font> and <center>), which is a poor code pattern.',
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Replace deprecated HTML tags with modern semantic HTML and CSS.

1. Find every deprecated tag in the templates or components for this page (e.g. <font>, <center>, <strike>, <marquee>).
2. Replace them with semantic elements plus CSS or utility classes.
3. Preserve the visual layout and meaning.
4. Remove presentational HTML that belongs in CSS.

Target outcome: the page no longer uses deprecated HTML tags and still looks correct.`
    },
    'code.render-blocking-js': {
      title: 'Render-blocking JavaScript',
      description: "Found {count} script tags without 'defer' or 'async'. This is an unsafe or inefficient performance pattern.",
      recommendation: 'Copy the AI agent prompt below and paste it into your coding agent to fix only this issue.',
      agentPrompt: `Stop non-critical scripts from blocking first render. Found {count} external <script src="..."> tags without defer or async.

1. Find the script tags that load without defer or async.
2. Add defer for scripts that should run in order after HTML parsing.
3. Add async only for independent scripts that can run out of order.
4. Keep truly critical inline bootstrapping minimal.
5. Do not break script order dependencies.

Target outcome: non-critical external scripts no longer block rendering.`
    }
  }
};

/** Reuse English agentPrompt bodies for every locale (AI agents understand English best). */
function withEnglishAgentPrompt(
  localized: Omit<IssueTranslation, 'agentPrompt'> & { agentPrompt?: string },
  issueId: IssueId
): IssueTranslation {
  return {
    ...localized,
    agentPrompt: en.issues[issueId].agentPrompt
  };
}

const sv: ReportTranslation = {
  summaries: [
    'Webbplatsen behöver omfattande åtgärder för att möta grundläggande standarder.',
    'Webbplatsen har flera brister som bör åtgärdas för att förbättra användarupplevelse och SEO.',
    'Bra jobbat, men några områden kan fortfarande optimeras för att nå toppnivå.',
    'Webbplatsen ser fantastisk ut! Den följer de flesta bästa praxis.'
  ],
  evidenceLabel: 'Bevis från skanningen:',
  issues: {
    'seo.missing-title': withEnglishAgentPrompt({ title: 'Saknad title-tagg', description: 'Sidan saknar en <title>-tagg, vilket är kritiskt för sökmotorer.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'seo.missing-title'),
    'seo.missing-meta-description': withEnglishAgentPrompt({ title: 'Saknad metabeskrivning', description: 'Sidan saknar en metabeskrivning.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'seo.missing-meta-description'),
    'seo.missing-h1': withEnglishAgentPrompt({ title: 'Saknad H1-rubrik', description: 'Sidan saknar en huvudrubrik (H1).', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'seo.missing-h1'),
    'performance.slow-response-high': withEnglishAgentPrompt({ title: 'Långsam svarstid', description: 'Servern tog {loadTime} ms att svara.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'performance.slow-response-high'),
    'performance.slow-response-medium': withEnglishAgentPrompt({ title: 'Något långsam svarstid', description: 'Servern tog {loadTime} ms att svara.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'performance.slow-response-medium'),
    'security.insecure-http': withEnglishAgentPrompt({ title: 'Okrypterad anslutning', description: 'Sidan använder HTTP i stället för HTTPS.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'security.insecure-http'),
    'security.missing-hsts': withEnglishAgentPrompt({ title: 'Saknad HSTS-header', description: 'Sidan tvingar inte webbläsare att använda HTTPS (HSTS).', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'security.missing-hsts'),
    'security.clickjacking-risk': withEnglishAgentPrompt({ title: 'Risk för clickjacking', description: 'Sidan saknar skydd mot att bäddas in i iframes.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'security.clickjacking-risk'),
    'accessibility.missing-alt-text': withEnglishAgentPrompt({ title: 'Saknade alt-texter', description: '{count} bilder saknar alt-attribut.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'accessibility.missing-alt-text'),
    'accessibility.missing-language': withEnglishAgentPrompt({ title: 'Saknat språkattribut', description: 'HTML-taggen saknar lang-attribut.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'accessibility.missing-language'),
    'code.inline-styles': withEnglishAgentPrompt({ title: 'Inline-CSS används', description: 'Hittade {count} element med inline-stilar. Det gör koden svårare att underhålla och kan ge mindre konsekvent formatering.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'code.inline-styles'),
    'code.deprecated-tags': withEnglishAgentPrompt({ title: 'Föråldrade HTML-taggar', description: 'Sidan använder föråldrade taggar (som <font> och <center>), vilket är ett dåligt kodmönster.', recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'code.deprecated-tags'),
    'code.render-blocking-js': withEnglishAgentPrompt({ title: 'Renderingsblockerande JavaScript', description: "Hittade {count} script-taggar utan 'defer' eller 'async'. Detta är ett osäkert eller ineffektivt prestandamönster.", recommendation: 'Kopiera AI-agentprompten nedan och klistra in den i din kodagent för att fixa bara detta problem.' }, 'code.render-blocking-js')
  }
};

function localizeIssueBundle(
  source: Record<IssueId, Omit<IssueTranslation, 'agentPrompt'> & { agentPrompt?: string }>
): ReportTranslation['issues'] {
  const result = {} as ReportTranslation['issues'];
  (Object.keys(source) as IssueId[]).forEach((id) => {
    result[id] = withEnglishAgentPrompt(source[id], id);
  });
  return result;
}

const tr: ReportTranslation = {
  summaries: [
    'Web sitesi temel standartları karşılamak için kapsamlı iyileştirmelere ihtiyaç duyuyor.',
    'Web sitesinde kullanıcı deneyimini ve SEO’yu geliştirmek için düzeltilmesi gereken çeşitli sorunlar var.',
    'İyi iş, ancak en yüksek seviyeye ulaşmak için birkaç alan daha optimize edilebilir.',
    'Web sitesi harika görünüyor! En iyi uygulamaların çoğunu takip ediyor.'
  ],
  evidenceLabel: 'Tarama kanıtı:',
  issues: localizeIssueBundle({
    'seo.missing-title': { title: 'Title etiketi eksik', description: 'Sayfada arama motorları için kritik olan <title> etiketi yok.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'seo.missing-meta-description': { title: 'Meta açıklaması eksik', description: 'Sayfada meta açıklaması yok.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'seo.missing-h1': { title: 'H1 başlığı eksik', description: 'Sayfada ana başlık (H1) yok.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'performance.slow-response-high': { title: 'Yavaş yanıt süresi', description: 'Sunucunun yanıt vermesi {loadTime} ms sürdü.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'performance.slow-response-medium': { title: 'Biraz yavaş yanıt süresi', description: 'Sunucunun yanıt vermesi {loadTime} ms sürdü.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'security.insecure-http': { title: 'Şifrelenmemiş bağlantı', description: 'Sayfa HTTPS yerine HTTP kullanıyor.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'security.missing-hsts': { title: 'HSTS başlığı eksik', description: 'Sayfa, tarayıcıları HTTPS (HSTS) kullanmaya zorlamıyor.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'security.clickjacking-risk': { title: 'Clickjacking riski', description: 'Sayfanın iframe içine gömülmeye karşı koruması yok.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'accessibility.missing-alt-text': { title: 'Alt metin eksik', description: '{count} görselde alt özelliği eksik.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'accessibility.missing-language': { title: 'Dil özelliği eksik', description: 'HTML etiketinde lang özelliği yok.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'code.inline-styles': { title: 'Satır içi CSS kullanılıyor', description: 'Satır içi stile sahip {count} öğe bulundu. Bu, kodun bakımını zorlaştırır ve tutarsız biçimlendirmeye yol açabilir.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'code.deprecated-tags': { title: 'Kullanımdan kaldırılmış HTML etiketleri', description: 'Sayfa, kötü bir kod kalıbı olan eski etiketleri (<font> ve <center> gibi) kullanıyor.', recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' },
    'code.render-blocking-js': { title: 'İşlemeyi engelleyen JavaScript', description: "'defer' veya 'async' içermeyen {count} script etiketi bulundu. Bu, güvensiz veya verimsiz bir performans kalıbıdır.", recommendation: 'Yalnızca bu sorunu düzeltmek için aşağıdaki AI ajan komutunu kopyalayıp kod ajanınıza yapıştırın.' }
  })
};

const es: ReportTranslation = {
  summaries: [
    'El sitio necesita mejoras importantes para cumplir los estándares básicos.',
    'El sitio tiene varios problemas que deben corregirse para mejorar la experiencia de usuario y el SEO.',
    'Buen trabajo, aunque aún se pueden optimizar algunas áreas para alcanzar el máximo nivel.',
    '¡El sitio se ve excelente! Sigue la mayoría de las mejores prácticas.'
  ],
  evidenceLabel: 'Evidencia del análisis:',
  issues: localizeIssueBundle({
    'seo.missing-title': { title: 'Falta la etiqueta title', description: 'La página no tiene una etiqueta <title>, fundamental para los buscadores.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'seo.missing-meta-description': { title: 'Falta la meta descripción', description: 'La página no tiene meta descripción.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'seo.missing-h1': { title: 'Falta el encabezado H1', description: 'La página no tiene un encabezado principal (H1).', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'performance.slow-response-high': { title: 'Tiempo de respuesta lento', description: 'El servidor tardó {loadTime} ms en responder.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'performance.slow-response-medium': { title: 'Tiempo de respuesta algo lento', description: 'El servidor tardó {loadTime} ms en responder.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'security.insecure-http': { title: 'Conexión sin cifrar', description: 'La página utiliza HTTP en lugar de HTTPS.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'security.missing-hsts': { title: 'Falta la cabecera HSTS', description: 'La página no obliga a los navegadores a utilizar HTTPS (HSTS).', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'security.clickjacking-risk': { title: 'Riesgo de clickjacking', description: 'La página no está protegida contra su inserción en iframes.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'accessibility.missing-alt-text': { title: 'Falta texto alternativo', description: '{count} imágenes no tienen el atributo alt.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'accessibility.missing-language': { title: 'Falta el atributo de idioma', description: 'La etiqueta HTML no tiene atributo lang.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'code.inline-styles': { title: 'Se utiliza CSS en línea', description: 'Se encontraron {count} elementos con estilos en línea. Esto dificulta el mantenimiento y puede producir un formato menos uniforme.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'code.deprecated-tags': { title: 'Etiquetas HTML obsoletas', description: 'La página utiliza etiquetas obsoletas (como <font> y <center>), lo cual es un patrón de código deficiente.', recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' },
    'code.render-blocking-js': { title: 'JavaScript que bloquea el renderizado', description: "Se encontraron {count} etiquetas script sin 'defer' ni 'async'. Es un patrón de rendimiento inseguro o ineficiente.", recommendation: 'Copia el comando de agente de IA de abajo y pégalo en tu agente de código para corregir solo este problema.' }
  })
};

const fr: ReportTranslation = {
  summaries: [
    'Le site nécessite des améliorations importantes pour respecter les normes de base.',
    'Le site présente plusieurs problèmes à corriger pour améliorer l’expérience utilisateur et le SEO.',
    'Bon travail, mais quelques éléments peuvent encore être optimisés pour atteindre le meilleur niveau.',
    'Le site est excellent ! Il respecte la plupart des bonnes pratiques.'
  ],
  evidenceLabel: 'Preuve issue du scan :',
  issues: localizeIssueBundle({
    'seo.missing-title': { title: 'Balise title manquante', description: 'La page ne contient pas de balise <title>, essentielle pour les moteurs de recherche.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'seo.missing-meta-description': { title: 'Méta-description manquante', description: 'La page ne contient pas de méta-description.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'seo.missing-h1': { title: 'Titre H1 manquant', description: 'La page ne contient pas de titre principal (H1).', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'performance.slow-response-high': { title: 'Temps de réponse lent', description: 'Le serveur a mis {loadTime} ms à répondre.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'performance.slow-response-medium': { title: 'Temps de réponse assez lent', description: 'Le serveur a mis {loadTime} ms à répondre.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'security.insecure-http': { title: 'Connexion non chiffrée', description: 'La page utilise HTTP au lieu de HTTPS.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'security.missing-hsts': { title: 'En-tête HSTS manquant', description: 'La page n’oblige pas les navigateurs à utiliser HTTPS (HSTS).', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'security.clickjacking-risk': { title: 'Risque de clickjacking', description: 'La page n’est pas protégée contre l’intégration dans des iframes.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'accessibility.missing-alt-text': { title: 'Texte alternatif manquant', description: '{count} images n’ont pas d’attribut alt.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'accessibility.missing-language': { title: 'Attribut de langue manquant', description: 'La balise HTML n’a pas d’attribut lang.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'code.inline-styles': { title: 'CSS en ligne utilisé', description: '{count} éléments avec des styles en ligne ont été trouvés. Le code devient plus difficile à maintenir et sa mise en forme moins cohérente.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'code.deprecated-tags': { title: 'Balises HTML obsolètes', description: 'La page utilise des balises obsolètes (comme <font> et <center>), ce qui constitue une mauvaise pratique.', recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' },
    'code.render-blocking-js': { title: 'JavaScript bloquant le rendu', description: "{count} balises script sans 'defer' ni 'async' ont été trouvées. Cette pratique est peu sûre ou inefficace pour les performances.", recommendation: 'Copiez la commande d’agent IA ci-dessous et collez-la dans votre agent de code pour corriger uniquement ce problème.' }
  })
};

const ar: ReportTranslation = {
  summaries: [
    'يحتاج الموقع إلى تحسينات كبيرة لتلبية المعايير الأساسية.',
    'يحتوي الموقع على عدة مشكلات ينبغي إصلاحها لتحسين تجربة المستخدم وSEO.',
    'عمل جيد، لكن لا تزال هناك بعض الجوانب التي يمكن تحسينها للوصول إلى أعلى مستوى.',
    'يبدو الموقع ممتازًا! فهو يتبع معظم أفضل الممارسات.'
  ],
  evidenceLabel: 'دليل من الفحص:',
  issues: localizeIssueBundle({
    'seo.missing-title': { title: 'وسم title مفقود', description: 'لا تحتوي الصفحة على وسم <title>، وهو ضروري لمحركات البحث.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'seo.missing-meta-description': { title: 'الوصف التعريفي مفقود', description: 'لا تحتوي الصفحة على وصف تعريفي.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'seo.missing-h1': { title: 'عنوان H1 مفقود', description: 'لا تحتوي الصفحة على عنوان رئيسي (H1).', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'performance.slow-response-high': { title: 'زمن استجابة بطيء', description: 'استغرق الخادم {loadTime} مللي ثانية للاستجابة.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'performance.slow-response-medium': { title: 'زمن استجابة بطيء نسبيًا', description: 'استغرق الخادم {loadTime} مللي ثانية للاستجابة.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'security.insecure-http': { title: 'اتصال غير مشفر', description: 'تستخدم الصفحة HTTP بدلًا من HTTPS.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'security.missing-hsts': { title: 'ترويسة HSTS مفقودة', description: 'لا تُلزم الصفحة المتصفحات باستخدام HTTPS (HSTS).', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'security.clickjacking-risk': { title: 'خطر اختطاف النقرات', description: 'تفتقر الصفحة إلى الحماية من تضمينها داخل إطارات iframe.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'accessibility.missing-alt-text': { title: 'نص بديل مفقود', description: '{count} صور لا تحتوي على السمة alt.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'accessibility.missing-language': { title: 'سمة اللغة مفقودة', description: 'لا يحتوي وسم HTML على السمة lang.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'code.inline-styles': { title: 'استخدام CSS مضمّن', description: 'عُثر على {count} عناصر بأنماط مضمّنة. يصعّب ذلك صيانة الكود وقد يؤدي إلى تنسيق أقل اتساقًا.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'code.deprecated-tags': { title: 'وسوم HTML مهجورة', description: 'تستخدم الصفحة وسومًا مهجورة (مثل <font> و<center>)، وهذا نمط برمجي سيئ.', recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' },
    'code.render-blocking-js': { title: 'JavaScript يعيق العرض', description: "عُثر على {count} وسوم script بلا 'defer' أو 'async'. وهذا نمط أداء غير آمن أو غير فعّال.", recommendation: 'انسخ أمر وكيل الذكاء الاصطناعي أدناه والصقه في وكيل البرمجة لإصلاح هذه المشكلة فقط.' }
  })
};

const reportTranslations: Record<Language, ReportTranslation> = { en, sv, tr, es, fr, ar };
const DESCRIPTION_TEASER_LENGTH = 90;

function interpolate(text: string, values: IssueValues = {}): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key as keyof IssueValues] ?? ''));
}

function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_TEASER_LENGTH) return description;
  const cutoff = description.slice(0, DESCRIPTION_TEASER_LENGTH);
  const lastSpace = cutoff.lastIndexOf(' ');
  return `${cutoff.slice(0, lastSpace > 40 ? lastSpace : DESCRIPTION_TEASER_LENGTH).trimEnd()}…`;
}

function getSummaryIndex(score: number): 0 | 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
}

function buildAgentPrompt(
  translation: ReportTranslation,
  issueId: IssueId,
  values: IssueValues | undefined,
  evidenceHtml?: string
): string {
  // Always use English title + task body so every locale gets the same English agent command.
  const enIssue = reportTranslations.en.issues[issueId];
  const taskBody = interpolate(enIssue.agentPrompt, values);
  return wrapAgentCommand(
    issueId,
    enIssue.title,
    taskBody,
    translation.evidenceLabel,
    evidenceHtml
  );
}

export function localizeScanResult(result: ScanResult, requestedLanguage: string): LocalizedScanResult {
  const language = getLanguage(requestedLanguage);
  const translation = reportTranslations[language] ?? reportTranslations.en;

  const issues: LocalizedScannerIssue[] = result.issues.map((issue) => {
    const text = translation.issues[issue.id] ?? reportTranslations.en.issues[issue.id];
    const fullDescription = interpolate(text.description, issue.values);

    return {
      ...issue,
      title: text.title,
      description: issue.descriptionTeaser ? truncateDescription(fullDescription) : fullDescription,
      recommendation: issue.recommendationAvailable ? text.recommendation : undefined,
      codeSnippet: issue.recommendationAvailable
        ? buildAgentPrompt(translation, issue.id, issue.values, issue.codeSnippet)
        : undefined
    };
  });

  return {
    overallScore: result.overallScore,
    metrics: result.metrics,
    summary: translation.summaries[getSummaryIndex(result.overallScore)],
    issues
  };
}
