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
 * Compact JSON command for AI coding agents.
 * Same English payload for every UI language.
 */
function wrapAgentCommand(
  issueId: IssueId,
  issueTitle: string,
  fix: string,
  evidenceHtml?: string
): string {
  const command: Record<string, unknown> = {
    source: 'SiteScanner Pro',
    op: 'fix',
    scope: 'only_this_issue',
    issue_id: issueId,
    issue: issueTitle,
    fix,
    rules: [
      'fix_only_this_issue',
      'no_refactor',
      'no_unrelated_files',
      'no_extras',
      'stop_when_fixed'
    ]
  };

  const evidence = evidenceHtml?.trim();
  if (evidence) {
    command.evidence = evidence;
  }

  return JSON.stringify(command, null, 2);
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
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Add exactly one descriptive <title> in <head>. Keep it unique and page-specific. No duplicates.`
    },
    'seo.missing-meta-description': {
      title: 'Missing meta description',
      description: 'The page has no meta description.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Add one <meta name="description"> in <head>, ~160 chars, unique to this page.`
    },
    'seo.missing-h1': {
      title: 'Missing H1 heading',
      description: 'The page has no main heading (H1).',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Add exactly one semantic <h1> near main content. Keep layout. No multiple H1s.`
    },
    'performance.slow-response-high': {
      title: 'Slow response time',
      description: 'The server took {loadTime} ms to respond.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Reduce TTFB for this page (measured {loadTime} ms): cut blocking work, add safe caching, optimize SSR/DB/API on the critical path.`
    },
    'performance.slow-response-medium': {
      title: 'Somewhat slow response time',
      description: 'The server took {loadTime} ms to respond.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Improve TTFB for this page (measured {loadTime} ms) without changing visible content: cache where safe, remove blocking I/O.`
    },
    'security.insecure-http': {
      title: 'Unencrypted connection',
      description: 'The page uses HTTP instead of HTTPS.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Enforce HTTPS only: enable TLS, redirect HTTP→HTTPS, update absolute links/assets to https://.`
    },
    'security.missing-hsts': {
      title: 'Missing HSTS header',
      description: 'The page does not force browsers to use HTTPS (HSTS).',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Add response header Strict-Transport-Security: max-age=31536000; includeSubDomains on HTTPS responses.`
    },
    'security.clickjacking-risk': {
      title: 'Clickjacking risk',
      description: 'The page lacks protection against being embedded in iframes.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Add X-Frame-Options: DENY or CSP frame-ancestors 'none' (or SAMEORIGIN/allowlist if framing is required).`
    },
    'accessibility.missing-alt-text': {
      title: 'Missing alt text',
      description: '{count} images are missing an alt attribute.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Add descriptive alt on {count} images missing alt. Use alt="" only for decorative images.`
    },
    'accessibility.missing-language': {
      title: 'Missing language attribute',
      description: 'The HTML tag has no lang attribute.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Set correct lang on root <html> (static or from active locale).`
    },
    'code.inline-styles': {
      title: 'Inline CSS in use',
      description: 'Found {count} elements with inline styles. This makes the code harder to maintain and can result in less consistent formatting.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Move {count} inline style="..." usages into CSS/classes/utilities. Preserve visuals.`
    },
    'code.deprecated-tags': {
      title: 'Deprecated HTML tags',
      description: 'The page uses deprecated tags (such as <font> and <center>), which is a poor code pattern.',
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Replace deprecated tags (font/center/strike/marquee) with semantic HTML + CSS. Preserve layout.`
    },
    'code.render-blocking-js': {
      title: 'Render-blocking JavaScript',
      description: "Found {count} script tags without 'defer' or 'async'. This is an unsafe or inefficient performance pattern.",
      recommendation: 'Copy the JSON below and paste it into your AI coding agent.',
      agentPrompt: `Add defer/async to {count} render-blocking external scripts. Preserve required load order.`
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
    'seo.missing-title': withEnglishAgentPrompt({ title: 'Saknad title-tagg', description: 'Sidan saknar en <title>-tagg, vilket är kritiskt för sökmotorer.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'seo.missing-title'),
    'seo.missing-meta-description': withEnglishAgentPrompt({ title: 'Saknad metabeskrivning', description: 'Sidan saknar en metabeskrivning.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'seo.missing-meta-description'),
    'seo.missing-h1': withEnglishAgentPrompt({ title: 'Saknad H1-rubrik', description: 'Sidan saknar en huvudrubrik (H1).', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'seo.missing-h1'),
    'performance.slow-response-high': withEnglishAgentPrompt({ title: 'Långsam svarstid', description: 'Servern tog {loadTime} ms att svara.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'performance.slow-response-high'),
    'performance.slow-response-medium': withEnglishAgentPrompt({ title: 'Något långsam svarstid', description: 'Servern tog {loadTime} ms att svara.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'performance.slow-response-medium'),
    'security.insecure-http': withEnglishAgentPrompt({ title: 'Okrypterad anslutning', description: 'Sidan använder HTTP i stället för HTTPS.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'security.insecure-http'),
    'security.missing-hsts': withEnglishAgentPrompt({ title: 'Saknad HSTS-header', description: 'Sidan tvingar inte webbläsare att använda HTTPS (HSTS).', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'security.missing-hsts'),
    'security.clickjacking-risk': withEnglishAgentPrompt({ title: 'Risk för clickjacking', description: 'Sidan saknar skydd mot att bäddas in i iframes.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'security.clickjacking-risk'),
    'accessibility.missing-alt-text': withEnglishAgentPrompt({ title: 'Saknade alt-texter', description: '{count} bilder saknar alt-attribut.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'accessibility.missing-alt-text'),
    'accessibility.missing-language': withEnglishAgentPrompt({ title: 'Saknat språkattribut', description: 'HTML-taggen saknar lang-attribut.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'accessibility.missing-language'),
    'code.inline-styles': withEnglishAgentPrompt({ title: 'Inline-CSS används', description: 'Hittade {count} element med inline-stilar. Det gör koden svårare att underhålla och kan ge mindre konsekvent formatering.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'code.inline-styles'),
    'code.deprecated-tags': withEnglishAgentPrompt({ title: 'Föråldrade HTML-taggar', description: 'Sidan använder föråldrade taggar (som <font> och <center>), vilket är ett dåligt kodmönster.', recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'code.deprecated-tags'),
    'code.render-blocking-js': withEnglishAgentPrompt({ title: 'Renderingsblockerande JavaScript', description: "Hittade {count} script-taggar utan 'defer' eller 'async'. Detta är ett osäkert eller ineffektivt prestandamönster.", recommendation: 'Kopiera JSON-kommandot nedan och klistra in det i din AI-kodagent.' }, 'code.render-blocking-js')
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
    'seo.missing-title': { title: 'Title etiketi eksik', description: 'Sayfada arama motorları için kritik olan <title> etiketi yok.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'seo.missing-meta-description': { title: 'Meta açıklaması eksik', description: 'Sayfada meta açıklaması yok.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'seo.missing-h1': { title: 'H1 başlığı eksik', description: 'Sayfada ana başlık (H1) yok.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'performance.slow-response-high': { title: 'Yavaş yanıt süresi', description: 'Sunucunun yanıt vermesi {loadTime} ms sürdü.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'performance.slow-response-medium': { title: 'Biraz yavaş yanıt süresi', description: 'Sunucunun yanıt vermesi {loadTime} ms sürdü.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'security.insecure-http': { title: 'Şifrelenmemiş bağlantı', description: 'Sayfa HTTPS yerine HTTP kullanıyor.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'security.missing-hsts': { title: 'HSTS başlığı eksik', description: 'Sayfa, tarayıcıları HTTPS (HSTS) kullanmaya zorlamıyor.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'security.clickjacking-risk': { title: 'Clickjacking riski', description: 'Sayfanın iframe içine gömülmeye karşı koruması yok.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'accessibility.missing-alt-text': { title: 'Alt metin eksik', description: '{count} görselde alt özelliği eksik.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'accessibility.missing-language': { title: 'Dil özelliği eksik', description: 'HTML etiketinde lang özelliği yok.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'code.inline-styles': { title: 'Satır içi CSS kullanılıyor', description: 'Satır içi stile sahip {count} öğe bulundu. Bu, kodun bakımını zorlaştırır ve tutarsız biçimlendirmeye yol açabilir.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'code.deprecated-tags': { title: 'Kullanımdan kaldırılmış HTML etiketleri', description: 'Sayfa, kötü bir kod kalıbı olan eski etiketleri (<font> ve <center> gibi) kullanıyor.', recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' },
    'code.render-blocking-js': { title: 'İşlemeyi engelleyen JavaScript', description: "'defer' veya 'async' içermeyen {count} script etiketi bulundu. Bu, güvensiz veya verimsiz bir performans kalıbıdır.", recommendation: 'Aşağıdaki JSON komutunu kopyalayıp AI kod ajanınıza yapıştırın.' }
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
    'seo.missing-title': { title: 'Falta la etiqueta title', description: 'La página no tiene una etiqueta <title>, fundamental para los buscadores.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'seo.missing-meta-description': { title: 'Falta la meta descripción', description: 'La página no tiene meta descripción.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'seo.missing-h1': { title: 'Falta el encabezado H1', description: 'La página no tiene un encabezado principal (H1).', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'performance.slow-response-high': { title: 'Tiempo de respuesta lento', description: 'El servidor tardó {loadTime} ms en responder.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'performance.slow-response-medium': { title: 'Tiempo de respuesta algo lento', description: 'El servidor tardó {loadTime} ms en responder.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'security.insecure-http': { title: 'Conexión sin cifrar', description: 'La página utiliza HTTP en lugar de HTTPS.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'security.missing-hsts': { title: 'Falta la cabecera HSTS', description: 'La página no obliga a los navegadores a utilizar HTTPS (HSTS).', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'security.clickjacking-risk': { title: 'Riesgo de clickjacking', description: 'La página no está protegida contra su inserción en iframes.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'accessibility.missing-alt-text': { title: 'Falta texto alternativo', description: '{count} imágenes no tienen el atributo alt.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'accessibility.missing-language': { title: 'Falta el atributo de idioma', description: 'La etiqueta HTML no tiene atributo lang.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'code.inline-styles': { title: 'Se utiliza CSS en línea', description: 'Se encontraron {count} elementos con estilos en línea. Esto dificulta el mantenimiento y puede producir un formato menos uniforme.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'code.deprecated-tags': { title: 'Etiquetas HTML obsoletas', description: 'La página utiliza etiquetas obsoletas (como <font> y <center>), lo cual es un patrón de código deficiente.', recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' },
    'code.render-blocking-js': { title: 'JavaScript que bloquea el renderizado', description: "Se encontraron {count} etiquetas script sin 'defer' ni 'async'. Es un patrón de rendimiento inseguro o ineficiente.", recommendation: 'Copia el JSON de abajo y pégalo en tu agente de IA.' }
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
    'seo.missing-title': { title: 'Balise title manquante', description: 'La page ne contient pas de balise <title>, essentielle pour les moteurs de recherche.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'seo.missing-meta-description': { title: 'Méta-description manquante', description: 'La page ne contient pas de méta-description.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'seo.missing-h1': { title: 'Titre H1 manquant', description: 'La page ne contient pas de titre principal (H1).', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'performance.slow-response-high': { title: 'Temps de réponse lent', description: 'Le serveur a mis {loadTime} ms à répondre.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'performance.slow-response-medium': { title: 'Temps de réponse assez lent', description: 'Le serveur a mis {loadTime} ms à répondre.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'security.insecure-http': { title: 'Connexion non chiffrée', description: 'La page utilise HTTP au lieu de HTTPS.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'security.missing-hsts': { title: 'En-tête HSTS manquant', description: 'La page n’oblige pas les navigateurs à utiliser HTTPS (HSTS).', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'security.clickjacking-risk': { title: 'Risque de clickjacking', description: 'La page n’est pas protégée contre l’intégration dans des iframes.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'accessibility.missing-alt-text': { title: 'Texte alternatif manquant', description: '{count} images n’ont pas d’attribut alt.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'accessibility.missing-language': { title: 'Attribut de langue manquant', description: 'La balise HTML n’a pas d’attribut lang.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'code.inline-styles': { title: 'CSS en ligne utilisé', description: '{count} éléments avec des styles en ligne ont été trouvés. Le code devient plus difficile à maintenir et sa mise en forme moins cohérente.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'code.deprecated-tags': { title: 'Balises HTML obsolètes', description: 'La page utilise des balises obsolètes (comme <font> et <center>), ce qui constitue une mauvaise pratique.', recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' },
    'code.render-blocking-js': { title: 'JavaScript bloquant le rendu', description: "{count} balises script sans 'defer' ni 'async' ont été trouvées. Cette pratique est peu sûre ou inefficace pour les performances.", recommendation: 'Copiez le JSON ci-dessous et collez-le dans votre agent IA.' }
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
    'seo.missing-title': { title: 'وسم title مفقود', description: 'لا تحتوي الصفحة على وسم <title>، وهو ضروري لمحركات البحث.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'seo.missing-meta-description': { title: 'الوصف التعريفي مفقود', description: 'لا تحتوي الصفحة على وصف تعريفي.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'seo.missing-h1': { title: 'عنوان H1 مفقود', description: 'لا تحتوي الصفحة على عنوان رئيسي (H1).', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'performance.slow-response-high': { title: 'زمن استجابة بطيء', description: 'استغرق الخادم {loadTime} مللي ثانية للاستجابة.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'performance.slow-response-medium': { title: 'زمن استجابة بطيء نسبيًا', description: 'استغرق الخادم {loadTime} مللي ثانية للاستجابة.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'security.insecure-http': { title: 'اتصال غير مشفر', description: 'تستخدم الصفحة HTTP بدلًا من HTTPS.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'security.missing-hsts': { title: 'ترويسة HSTS مفقودة', description: 'لا تُلزم الصفحة المتصفحات باستخدام HTTPS (HSTS).', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'security.clickjacking-risk': { title: 'خطر اختطاف النقرات', description: 'تفتقر الصفحة إلى الحماية من تضمينها داخل إطارات iframe.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'accessibility.missing-alt-text': { title: 'نص بديل مفقود', description: '{count} صور لا تحتوي على السمة alt.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'accessibility.missing-language': { title: 'سمة اللغة مفقودة', description: 'لا يحتوي وسم HTML على السمة lang.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'code.inline-styles': { title: 'استخدام CSS مضمّن', description: 'عُثر على {count} عناصر بأنماط مضمّنة. يصعّب ذلك صيانة الكود وقد يؤدي إلى تنسيق أقل اتساقًا.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'code.deprecated-tags': { title: 'وسوم HTML مهجورة', description: 'تستخدم الصفحة وسومًا مهجورة (مثل <font> و<center>)، وهذا نمط برمجي سيئ.', recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' },
    'code.render-blocking-js': { title: 'JavaScript يعيق العرض', description: "عُثر على {count} وسوم script بلا 'defer' أو 'async'. وهذا نمط أداء غير آمن أو غير فعّال.", recommendation: 'انسخ أمر JSON أدناه والصقه في وكيل الذكاء الاصطناعي.' }
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
  return wrapAgentCommand(issueId, enIssue.title, taskBody, evidenceHtml);
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
