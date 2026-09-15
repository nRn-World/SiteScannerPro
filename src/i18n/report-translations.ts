import {
  IssueId,
  LocalizedScanResult,
  LocalizedScannerIssue,
  ScanResult
} from '../rules/types';
import { getLanguage, Language } from './translations';

interface IssueTranslation {
  title: string;
  description: string;
  recommendation: string;
  codeSnippet?: string;
}

interface ReportTranslation {
  summaries: [string, string, string, string];
  issues: Record<IssueId, IssueTranslation>;
}

const en: ReportTranslation = {
  summaries: [
    'The website needs substantial improvements to meet basic standards.',
    'The website has several issues that should be fixed to improve user experience and SEO.',
    'Good work, but a few areas can still be optimized to reach the highest level.',
    'The website looks excellent! It follows most best practices.'
  ],
  issues: {
    'seo.missing-title': { title: 'Missing title tag', description: 'The page has no <title> tag, which is critical for search engines.', recommendation: 'Add a descriptive <title> inside <head>.', codeSnippet: '<head>\n  <!-- Missing: <title>Your page title</title> -->\n</head>' },
    'seo.missing-meta-description': { title: 'Missing meta description', description: 'The page has no meta description.', recommendation: 'Add <meta name="description" content="...">.', codeSnippet: '<head>\n  <!-- Missing: <meta name="description" content="..."> -->\n</head>' },
    'seo.missing-h1': { title: 'Missing H1 heading', description: 'The page has no main heading (H1).', recommendation: 'Make sure every page has exactly one H1 heading.', codeSnippet: '<body>\n  <!-- Missing: <h1>Main heading</h1> -->\n</body>' },
    'performance.slow-response-high': { title: 'Slow response time', description: 'The server took {loadTime} ms to respond.', recommendation: 'Optimize the server and use caching or a CDN.' },
    'performance.slow-response-medium': { title: 'Somewhat slow response time', description: 'The server took {loadTime} ms to respond.', recommendation: 'Optimize TTFB (Time to First Byte).' },
    'security.insecure-http': { title: 'Unencrypted connection', description: 'The page uses HTTP instead of HTTPS.', recommendation: 'Install an SSL certificate and enforce HTTPS.' },
    'security.missing-hsts': { title: 'Missing HSTS header', description: 'The page does not force browsers to use HTTPS (HSTS).', recommendation: 'Add Strict-Transport-Security to the server headers.' },
    'security.clickjacking-risk': { title: 'Clickjacking risk', description: 'The page lacks protection against being embedded in iframes.', recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN.' },
    'accessibility.missing-alt-text': { title: 'Missing alt text', description: '{count} images are missing an alt attribute.', recommendation: 'Add descriptive alt text to every image for screen readers.' },
    'accessibility.missing-language': { title: 'Missing language attribute', description: 'The HTML tag has no lang attribute.', recommendation: 'Add lang="en" (or the current language) to the <html> tag.', codeSnippet: '<html>\n  <!-- Should be: <html lang="en"> -->\n</html>' },
    'code.inline-styles': { title: 'Inline CSS in use', description: 'Found {count} elements with inline styles. This makes the code harder to maintain and can result in less consistent formatting.', recommendation: 'Move all styling to external CSS files.' },
    'code.deprecated-tags': { title: 'Deprecated HTML tags', description: 'The page uses deprecated tags (such as <font> and <center>), which is a poor code pattern.', recommendation: 'Replace deprecated tags with modern CSS.' },
    'code.render-blocking-js': { title: 'Render-blocking JavaScript', description: "Found {count} script tags without 'defer' or 'async'. This is an unsafe or inefficient performance pattern.", recommendation: "Add 'defer' or 'async' to external scripts." }
  }
};

const sv: ReportTranslation = {
  summaries: [
    'Webbplatsen behöver omfattande åtgärder för att möta grundläggande standarder.',
    'Webbplatsen har flera brister som bör åtgärdas för att förbättra användarupplevelse och SEO.',
    'Bra jobbat, men några områden kan fortfarande optimeras för att nå toppnivå.',
    'Webbplatsen ser fantastisk ut! Den följer de flesta bästa praxis.'
  ],
  issues: {
    'seo.missing-title': { title: 'Saknad title-tagg', description: 'Sidan saknar en <title>-tagg, vilket är kritiskt för sökmotorer.', recommendation: 'Lägg till en beskrivande <title> i <head>.', codeSnippet: '<head>\n  <!-- Saknas: <title>Din sidtitel</title> -->\n</head>' },
    'seo.missing-meta-description': { title: 'Saknad metabeskrivning', description: 'Sidan saknar en metabeskrivning.', recommendation: 'Lägg till <meta name="description" content="...">.', codeSnippet: '<head>\n  <!-- Saknas: <meta name="description" content="..."> -->\n</head>' },
    'seo.missing-h1': { title: 'Saknad H1-rubrik', description: 'Sidan saknar en huvudrubrik (H1).', recommendation: 'Se till att varje sida har exakt en H1-rubrik.', codeSnippet: '<body>\n  <!-- Saknas: <h1>Huvudrubrik</h1> -->\n</body>' },
    'performance.slow-response-high': { title: 'Långsam svarstid', description: 'Servern tog {loadTime} ms att svara.', recommendation: 'Optimera servern och använd cachelagring eller ett CDN.' },
    'performance.slow-response-medium': { title: 'Något långsam svarstid', description: 'Servern tog {loadTime} ms att svara.', recommendation: 'Optimera TTFB (Time to First Byte).' },
    'security.insecure-http': { title: 'Okrypterad anslutning', description: 'Sidan använder HTTP i stället för HTTPS.', recommendation: 'Installera ett SSL-certifikat och tvinga HTTPS.' },
    'security.missing-hsts': { title: 'Saknad HSTS-header', description: 'Sidan tvingar inte webbläsare att använda HTTPS (HSTS).', recommendation: 'Lägg till Strict-Transport-Security i serverns headers.' },
    'security.clickjacking-risk': { title: 'Risk för clickjacking', description: 'Sidan saknar skydd mot att bäddas in i iframes.', recommendation: 'Lägg till X-Frame-Options: DENY eller SAMEORIGIN.' },
    'accessibility.missing-alt-text': { title: 'Saknade alt-texter', description: '{count} bilder saknar alt-attribut.', recommendation: 'Lägg till beskrivande alt-texter på alla bilder för skärmläsare.' },
    'accessibility.missing-language': { title: 'Saknat språkattribut', description: 'HTML-taggen saknar lang-attribut.', recommendation: 'Lägg till lang="sv" (eller aktuellt språk) i <html>-taggen.', codeSnippet: '<html>\n  <!-- Bör vara: <html lang="sv"> -->\n</html>' },
    'code.inline-styles': { title: 'Inline-CSS används', description: 'Hittade {count} element med inline-stilar. Det gör koden svårare att underhålla och kan ge mindre konsekvent formatering.', recommendation: 'Flytta all styling till externa CSS-filer.' },
    'code.deprecated-tags': { title: 'Föråldrade HTML-taggar', description: 'Sidan använder föråldrade taggar (som <font> och <center>), vilket är ett dåligt kodmönster.', recommendation: 'Ersätt föråldrade taggar med modern CSS.' },
    'code.render-blocking-js': { title: 'Renderingsblockerande JavaScript', description: "Hittade {count} script-taggar utan 'defer' eller 'async'. Detta är ett osäkert eller ineffektivt prestandamönster.", recommendation: "Lägg till 'defer' eller 'async' på externa script." }
  }
};

const tr: ReportTranslation = {
  summaries: ['Web sitesi temel standartları karşılamak için kapsamlı iyileştirmelere ihtiyaç duyuyor.', 'Web sitesinde kullanıcı deneyimini ve SEO’yu geliştirmek için düzeltilmesi gereken çeşitli sorunlar var.', 'İyi iş, ancak en yüksek seviyeye ulaşmak için birkaç alan daha optimize edilebilir.', 'Web sitesi harika görünüyor! En iyi uygulamaların çoğunu takip ediyor.'],
  issues: {
    'seo.missing-title': { title: 'Title etiketi eksik', description: 'Sayfada arama motorları için kritik olan <title> etiketi yok.', recommendation: '<head> içine açıklayıcı bir <title> ekleyin.', codeSnippet: '<head>\n  <!-- Eksik: <title>Sayfa başlığınız</title> -->\n</head>' },
    'seo.missing-meta-description': { title: 'Meta açıklaması eksik', description: 'Sayfada meta açıklaması yok.', recommendation: '<meta name="description" content="..."> ekleyin.', codeSnippet: '<head>\n  <!-- Eksik: <meta name="description" content="..."> -->\n</head>' },
    'seo.missing-h1': { title: 'H1 başlığı eksik', description: 'Sayfada ana başlık (H1) yok.', recommendation: 'Her sayfada tam olarak bir H1 başlığı olduğundan emin olun.', codeSnippet: '<body>\n  <!-- Eksik: <h1>Ana başlık</h1> -->\n</body>' },
    'performance.slow-response-high': { title: 'Yavaş yanıt süresi', description: 'Sunucunun yanıt vermesi {loadTime} ms sürdü.', recommendation: 'Sunucuyu optimize edin ve önbellekleme veya CDN kullanın.' },
    'performance.slow-response-medium': { title: 'Biraz yavaş yanıt süresi', description: 'Sunucunun yanıt vermesi {loadTime} ms sürdü.', recommendation: 'TTFB’yi (İlk Bayta Kadar Geçen Süre) optimize edin.' },
    'security.insecure-http': { title: 'Şifrelenmemiş bağlantı', description: 'Sayfa HTTPS yerine HTTP kullanıyor.', recommendation: 'SSL sertifikası yükleyin ve HTTPS kullanımını zorunlu kılın.' },
    'security.missing-hsts': { title: 'HSTS başlığı eksik', description: 'Sayfa, tarayıcıları HTTPS (HSTS) kullanmaya zorlamıyor.', recommendation: 'Sunucu başlıklarına Strict-Transport-Security ekleyin.' },
    'security.clickjacking-risk': { title: 'Clickjacking riski', description: 'Sayfanın iframe içine gömülmeye karşı koruması yok.', recommendation: 'X-Frame-Options: DENY veya SAMEORIGIN ekleyin.' },
    'accessibility.missing-alt-text': { title: 'Alt metin eksik', description: '{count} görselde alt özelliği eksik.', recommendation: 'Ekran okuyucular için tüm görsellere açıklayıcı alt metin ekleyin.' },
    'accessibility.missing-language': { title: 'Dil özelliği eksik', description: 'HTML etiketinde lang özelliği yok.', recommendation: '<html> etiketine lang="tr" (veya geçerli dili) ekleyin.', codeSnippet: '<html>\n  <!-- Şöyle olmalı: <html lang="tr"> -->\n</html>' },
    'code.inline-styles': { title: 'Satır içi CSS kullanılıyor', description: 'Satır içi stile sahip {count} öğe bulundu. Bu, kodun bakımını zorlaştırır ve tutarsız biçimlendirmeye yol açabilir.', recommendation: 'Tüm stilleri harici CSS dosyalarına taşıyın.' },
    'code.deprecated-tags': { title: 'Kullanımdan kaldırılmış HTML etiketleri', description: 'Sayfa, kötü bir kod kalıbı olan eski etiketleri (<font> ve <center> gibi) kullanıyor.', recommendation: 'Eski etiketleri modern CSS ile değiştirin.' },
    'code.render-blocking-js': { title: 'İşlemeyi engelleyen JavaScript', description: "'defer' veya 'async' içermeyen {count} script etiketi bulundu. Bu, güvensiz veya verimsiz bir performans kalıbıdır.", recommendation: "Harici scriptlere 'defer' veya 'async' ekleyin." }
  }
};

const es: ReportTranslation = {
  summaries: ['El sitio necesita mejoras importantes para cumplir los estándares básicos.', 'El sitio tiene varios problemas que deben corregirse para mejorar la experiencia de usuario y el SEO.', 'Buen trabajo, aunque aún se pueden optimizar algunas áreas para alcanzar el máximo nivel.', '¡El sitio se ve excelente! Sigue la mayoría de las mejores prácticas.'],
  issues: {
    'seo.missing-title': { title: 'Falta la etiqueta title', description: 'La página no tiene una etiqueta <title>, fundamental para los buscadores.', recommendation: 'Añade un <title> descriptivo dentro de <head>.', codeSnippet: '<head>\n  <!-- Falta: <title>Título de tu página</title> -->\n</head>' },
    'seo.missing-meta-description': { title: 'Falta la meta descripción', description: 'La página no tiene meta descripción.', recommendation: 'Añade <meta name="description" content="...">.', codeSnippet: '<head>\n  <!-- Falta: <meta name="description" content="..."> -->\n</head>' },
    'seo.missing-h1': { title: 'Falta el encabezado H1', description: 'La página no tiene un encabezado principal (H1).', recommendation: 'Asegúrate de que cada página tenga exactamente un encabezado H1.', codeSnippet: '<body>\n  <!-- Falta: <h1>Encabezado principal</h1> -->\n</body>' },
    'performance.slow-response-high': { title: 'Tiempo de respuesta lento', description: 'El servidor tardó {loadTime} ms en responder.', recommendation: 'Optimiza el servidor y utiliza caché o una CDN.' },
    'performance.slow-response-medium': { title: 'Tiempo de respuesta algo lento', description: 'El servidor tardó {loadTime} ms en responder.', recommendation: 'Optimiza el TTFB (tiempo hasta el primer byte).' },
    'security.insecure-http': { title: 'Conexión sin cifrar', description: 'La página utiliza HTTP en lugar de HTTPS.', recommendation: 'Instala un certificado SSL y fuerza HTTPS.' },
    'security.missing-hsts': { title: 'Falta la cabecera HSTS', description: 'La página no obliga a los navegadores a utilizar HTTPS (HSTS).', recommendation: 'Añade Strict-Transport-Security a las cabeceras del servidor.' },
    'security.clickjacking-risk': { title: 'Riesgo de clickjacking', description: 'La página no está protegida contra su inserción en iframes.', recommendation: 'Añade X-Frame-Options: DENY o SAMEORIGIN.' },
    'accessibility.missing-alt-text': { title: 'Falta texto alternativo', description: '{count} imágenes no tienen el atributo alt.', recommendation: 'Añade texto alternativo descriptivo a todas las imágenes para los lectores de pantalla.' },
    'accessibility.missing-language': { title: 'Falta el atributo de idioma', description: 'La etiqueta HTML no tiene atributo lang.', recommendation: 'Añade lang="es" (o el idioma actual) a la etiqueta <html>.', codeSnippet: '<html>\n  <!-- Debería ser: <html lang="es"> -->\n</html>' },
    'code.inline-styles': { title: 'Se utiliza CSS en línea', description: 'Se encontraron {count} elementos con estilos en línea. Esto dificulta el mantenimiento y puede producir un formato menos uniforme.', recommendation: 'Mueve todos los estilos a archivos CSS externos.' },
    'code.deprecated-tags': { title: 'Etiquetas HTML obsoletas', description: 'La página utiliza etiquetas obsoletas (como <font> y <center>), lo cual es un patrón de código deficiente.', recommendation: 'Sustituye las etiquetas obsoletas por CSS moderno.' },
    'code.render-blocking-js': { title: 'JavaScript que bloquea el renderizado', description: "Se encontraron {count} etiquetas script sin 'defer' ni 'async'. Es un patrón de rendimiento inseguro o ineficiente.", recommendation: "Añade 'defer' o 'async' a los scripts externos." }
  }
};

const fr: ReportTranslation = {
  summaries: ['Le site nécessite des améliorations importantes pour respecter les normes de base.', 'Le site présente plusieurs problèmes à corriger pour améliorer l’expérience utilisateur et le SEO.', 'Bon travail, mais quelques éléments peuvent encore être optimisés pour atteindre le meilleur niveau.', 'Le site est excellent ! Il respecte la plupart des bonnes pratiques.'],
  issues: {
    'seo.missing-title': { title: 'Balise title manquante', description: 'La page ne contient pas de balise <title>, essentielle pour les moteurs de recherche.', recommendation: 'Ajoutez un <title> descriptif dans <head>.', codeSnippet: '<head>\n  <!-- Manquant : <title>Titre de votre page</title> -->\n</head>' },
    'seo.missing-meta-description': { title: 'Méta-description manquante', description: 'La page ne contient pas de méta-description.', recommendation: 'Ajoutez <meta name="description" content="...">.', codeSnippet: '<head>\n  <!-- Manquant : <meta name="description" content="..."> -->\n</head>' },
    'seo.missing-h1': { title: 'Titre H1 manquant', description: 'La page ne contient pas de titre principal (H1).', recommendation: 'Assurez-vous que chaque page contient exactement un titre H1.', codeSnippet: '<body>\n  <!-- Manquant : <h1>Titre principal</h1> -->\n</body>' },
    'performance.slow-response-high': { title: 'Temps de réponse lent', description: 'Le serveur a mis {loadTime} ms à répondre.', recommendation: 'Optimisez le serveur et utilisez la mise en cache ou un CDN.' },
    'performance.slow-response-medium': { title: 'Temps de réponse assez lent', description: 'Le serveur a mis {loadTime} ms à répondre.', recommendation: 'Optimisez le TTFB (temps jusqu’au premier octet).' },
    'security.insecure-http': { title: 'Connexion non chiffrée', description: 'La page utilise HTTP au lieu de HTTPS.', recommendation: 'Installez un certificat SSL et imposez HTTPS.' },
    'security.missing-hsts': { title: 'En-tête HSTS manquant', description: 'La page n’oblige pas les navigateurs à utiliser HTTPS (HSTS).', recommendation: 'Ajoutez Strict-Transport-Security aux en-têtes du serveur.' },
    'security.clickjacking-risk': { title: 'Risque de clickjacking', description: 'La page n’est pas protégée contre l’intégration dans des iframes.', recommendation: 'Ajoutez X-Frame-Options: DENY ou SAMEORIGIN.' },
    'accessibility.missing-alt-text': { title: 'Texte alternatif manquant', description: '{count} images n’ont pas d’attribut alt.', recommendation: 'Ajoutez un texte alternatif descriptif à chaque image pour les lecteurs d’écran.' },
    'accessibility.missing-language': { title: 'Attribut de langue manquant', description: 'La balise HTML n’a pas d’attribut lang.', recommendation: 'Ajoutez lang="fr" (ou la langue actuelle) à la balise <html>.', codeSnippet: '<html>\n  <!-- Devrait être : <html lang="fr"> -->\n</html>' },
    'code.inline-styles': { title: 'CSS en ligne utilisé', description: '{count} éléments avec des styles en ligne ont été trouvés. Le code devient plus difficile à maintenir et sa mise en forme moins cohérente.', recommendation: 'Déplacez tous les styles vers des fichiers CSS externes.' },
    'code.deprecated-tags': { title: 'Balises HTML obsolètes', description: 'La page utilise des balises obsolètes (comme <font> et <center>), ce qui constitue une mauvaise pratique.', recommendation: 'Remplacez les balises obsolètes par du CSS moderne.' },
    'code.render-blocking-js': { title: 'JavaScript bloquant le rendu', description: "{count} balises script sans 'defer' ni 'async' ont été trouvées. Cette pratique est peu sûre ou inefficace pour les performances.", recommendation: "Ajoutez 'defer' ou 'async' aux scripts externes." }
  }
};

const ar: ReportTranslation = {
  summaries: ['يحتاج الموقع إلى تحسينات كبيرة لتلبية المعايير الأساسية.', 'يحتوي الموقع على عدة مشكلات ينبغي إصلاحها لتحسين تجربة المستخدم وSEO.', 'عمل جيد، لكن لا تزال هناك بعض الجوانب التي يمكن تحسينها للوصول إلى أعلى مستوى.', 'يبدو الموقع ممتازًا! فهو يتبع معظم أفضل الممارسات.'],
  issues: {
    'seo.missing-title': { title: 'وسم title مفقود', description: 'لا تحتوي الصفحة على وسم <title>، وهو ضروري لمحركات البحث.', recommendation: 'أضف وسم <title> وصفيًا داخل <head>.', codeSnippet: '<head>\n  <!-- مفقود: <title>عنوان صفحتك</title> -->\n</head>' },
    'seo.missing-meta-description': { title: 'الوصف التعريفي مفقود', description: 'لا تحتوي الصفحة على وصف تعريفي.', recommendation: 'أضف <meta name="description" content="...">.', codeSnippet: '<head>\n  <!-- مفقود: <meta name="description" content="..."> -->\n</head>' },
    'seo.missing-h1': { title: 'عنوان H1 مفقود', description: 'لا تحتوي الصفحة على عنوان رئيسي (H1).', recommendation: 'تأكد من وجود عنوان H1 واحد بالضبط في كل صفحة.', codeSnippet: '<body>\n  <!-- مفقود: <h1>العنوان الرئيسي</h1> -->\n</body>' },
    'performance.slow-response-high': { title: 'زمن استجابة بطيء', description: 'استغرق الخادم {loadTime} مللي ثانية للاستجابة.', recommendation: 'حسّن الخادم واستخدم التخزين المؤقت أو شبكة CDN.' },
    'performance.slow-response-medium': { title: 'زمن استجابة بطيء نسبيًا', description: 'استغرق الخادم {loadTime} مللي ثانية للاستجابة.', recommendation: 'حسّن TTFB (الوقت حتى أول بايت).' },
    'security.insecure-http': { title: 'اتصال غير مشفر', description: 'تستخدم الصفحة HTTP بدلًا من HTTPS.', recommendation: 'ثبّت شهادة SSL وافرض استخدام HTTPS.' },
    'security.missing-hsts': { title: 'ترويسة HSTS مفقودة', description: 'لا تُلزم الصفحة المتصفحات باستخدام HTTPS (HSTS).', recommendation: 'أضف Strict-Transport-Security إلى ترويسات الخادم.' },
    'security.clickjacking-risk': { title: 'خطر اختطاف النقرات', description: 'تفتقر الصفحة إلى الحماية من تضمينها داخل إطارات iframe.', recommendation: 'أضف X-Frame-Options: DENY أو SAMEORIGIN.' },
    'accessibility.missing-alt-text': { title: 'نص بديل مفقود', description: '{count} صور لا تحتوي على السمة alt.', recommendation: 'أضف نصًا بديلًا وصفيًا إلى كل الصور لقارئات الشاشة.' },
    'accessibility.missing-language': { title: 'سمة اللغة مفقودة', description: 'لا يحتوي وسم HTML على السمة lang.', recommendation: 'أضف lang="ar" (أو اللغة الحالية) إلى وسم <html>.', codeSnippet: '<html>\n  <!-- ينبغي أن يكون: <html lang="ar"> -->\n</html>' },
    'code.inline-styles': { title: 'استخدام CSS مضمّن', description: 'عُثر على {count} عناصر بأنماط مضمّنة. يصعّب ذلك صيانة الكود وقد يؤدي إلى تنسيق أقل اتساقًا.', recommendation: 'انقل جميع الأنماط إلى ملفات CSS خارجية.' },
    'code.deprecated-tags': { title: 'وسوم HTML مهجورة', description: 'تستخدم الصفحة وسومًا مهجورة (مثل <font> و<center>)، وهذا نمط برمجي سيئ.', recommendation: 'استبدل الوسوم المهجورة باستخدام CSS حديث.' },
    'code.render-blocking-js': { title: 'JavaScript يعيق العرض', description: "عُثر على {count} وسوم script بلا 'defer' أو 'async'. وهذا نمط أداء غير آمن أو غير فعّال.", recommendation: "أضف 'defer' أو 'async' إلى البرامج النصية الخارجية." }
  }
};

const reportTranslations: Record<Language, ReportTranslation> = { en, sv, tr, es, fr, ar };
const DESCRIPTION_TEASER_LENGTH = 90;

function interpolate(text: string, values: Record<string, number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
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
      codeSnippet: issue.codeSnippet ?? (issue.codeSnippetId ? text.codeSnippet : undefined)
    };
  });

  return {
    overallScore: result.overallScore,
    metrics: result.metrics,
    summary: translation.summaries[getSummaryIndex(result.overallScore)],
    issues
  };
}
