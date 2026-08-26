export type Language = 'en' | 'sv' | 'tr' | 'es' | 'fr' | 'ar';

export const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'sv', label: 'Svenska' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' }
];

export const CATEGORY_KEYS = ['SEO', 'Performance', 'Security', 'Accessibility', 'Code'] as const;
export type CategoryKey = typeof CATEGORY_KEYS[number];

export interface TranslationSet {
  languageName: string;
  nav: { scanner: string; about: string; contact: string; premium: string };
  hero: {
    secure: string;
    title: [string, string, string];
    description: string;
    urlPlaceholder: string;
    scan: string;
    steps: Array<{ title: string; description: string }>;
  };
  scanning: { target: string };
  scanSteps: string[];
  about: { title: string; lead: string; sections: Array<{ heading: string; body: string }> };
  features: { heading: string; headingAccent: string; items: Array<{ title: string; description: string }> };
  history: { title: string; target: string; score: string; date: string };
  dashboard: {
    report: string;
    exportPdf: string;
    totalScore: string;
    details: string;
    clickForDetails: string;
    identifiedIssues: string;
    categoryIssues: string;
    recommendation: string;
    noIssues: string;
    solutionLocked: string;
    lockedHint: string;
    unlockCta: string;
    categories: Record<CategoryKey, string>;
  };
  paywall: {
    title: string;
    description: string;
    benefits: string[];
    buy: string;
    cancel: string;
  };
  contact: {
    successTitle: string;
    successDescription: string;
    sendAnother: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    sending: string;
    send: string;
    sendError: string;
  };
  errors: { freeScan: string; premiumScan: string; scanFailed: string; payment: string; licenseInvalid: string };
}

const english: TranslationSet = {
  languageName: 'English',
  nav: { scanner: 'Scanner', about: 'About', contact: 'Contact', premium: 'Premium' },
  hero: {
    secure: 'Secure & anonymous analysis',
    title: ['Analyze.', 'Secure.', 'Optimize.'],
    description: 'Enter your website address for a complete analysis of code quality, security, performance, and SEO.',
    urlPlaceholder: 'https://your-website.com',
    scan: 'Scan',
    steps: [
      { title: 'Scan', description: 'Our engine retrieves your DOM structure and analyzes the code in real time without affecting your Core Web Vitals.' },
      { title: 'Analyze', description: 'The rule engine evaluates security headers, response times, metadata, accessibility, and code quality.' },
      { title: 'Fix', description: 'Get a prioritized list of exact code changes to strengthen weak signals and close security gaps.' }
    ]
  },
  scanning: { target: 'Target:' },
  scanSteps: ['INITIALIZING CONNECTION...', 'FETCHING DOM STRUCTURE...', 'ANALYZING CODE QUALITY...', 'SEARCHING FOR SECURITY ISSUES...', 'EVALUATING SEO SIGNALS...', 'ASSEMBLING REPORT...'],
  about: {
    title: 'About us',
    lead: 'SiteScanner Pro was built on a simple belief: every website owner deserves to know exactly how healthy their site is – and precisely how to make it better.',
    sections: [
      { heading: 'What we do', body: 'We specialize in automated website analysis. Our scanner examines your site across five critical areas – SEO, performance, security, accessibility, and code quality – and distills many technical checkpoints into one clear, prioritized report. No plugins, no installation, no configuration: enter your URL and receive a complete health report in seconds.' },
      { heading: 'How it works', body: 'Our scanning engine works with deterministic rules. They catch measurable problems such as missing meta tags, missing alt texts, slow server responses, and render-blocking scripts — and every finding comes with a prioritized recommendation plus a ready-to-use code fix.' },
      { heading: 'Our promise', body: 'Analysis should never come at the cost of trust. Scanning is anonymous, requires no account, and leaves your website completely unaffected while it runs. We never sell your data. Our only goal is that you walk away with a faster, safer, and more visible website.' }
    ]
  },
  features: {
    heading: 'Enterprise-Grade', headingAccent: 'Features',
    items: [
      { title: 'Core SEO Tags', description: 'Validation of Title, H1, and Meta Description tags for maximum search engine visibility.' },
      { title: 'Server Response Check', description: 'Measures how fast the server responds and flags slow responses that hurt load time and Core Web Vitals.' },
      { title: 'HTTPS & Security Headers', description: 'Checks encryption plus HSTS and clickjacking protection so visitors land on a secure connection.' },
      { title: 'Accessibility Basics', description: 'Detects missing image alt texts and language attributes that create barriers for assistive technology.' },
      { title: 'Code Quality Checks', description: 'Flags inline CSS, deprecated HTML tags, and render-blocking JavaScript for cleaner, faster pages.' },
      { title: 'Zero Impact On Your Site', description: 'Scans run on our servers against your public HTML and headers - nothing is installed and your site is never modified.' }
    ]
  },
  history: { title: 'Previous Scans', target: 'Target', score: 'Score', date: 'Date' },
  dashboard: {
    report: 'Analysis Report', exportPdf: 'Export PDF', totalScore: 'Total Score', details: 'Showing details', clickForDetails: 'Click for details', identifiedIssues: 'Identified Issues', categoryIssues: '{category} Issues',     recommendation: 'Recommendation', noIssues: 'No issues found in this category.',
    solutionLocked: 'Solution locked', lockedHint: 'Get the exact fix with step-by-step instructions and ready-to-use code.', unlockCta: 'Unlock – 99 kr',
    categories: { SEO: 'SEO', Performance: 'Performance', Security: 'Security', Accessibility: 'Accessibility', Code: 'Code' }
  },
  paywall: { title: 'Premium\nRequired.', description: 'You can see which issues were found. Unlock Pro to get the complete solution for every issue - with exact code fixes.', benefits: ['Unlimited scans', 'Complete code solutions', 'Faster scans (shorter wait)'], buy: 'Buy now – 99 kr', cancel: 'Cancel' },
  contact: { successTitle: 'Thank you for your message!', successDescription: 'We received your email and will get back to you as soon as we can.', sendAnother: 'Send another message', name: 'Name', namePlaceholder: 'Your name', email: 'Email', emailPlaceholder: 'you@email.com', subject: 'Subject', subjectPlaceholder: 'What is it about?', message: 'Message', messagePlaceholder: 'Write your message here...', sending: 'Sending...', send: 'Send Message', sendError: 'Something went wrong while sending.' },
  errors: { freeScan: 'An error occurred during the analysis.', premiumScan: 'The premium analysis failed.', scanFailed: 'Could not analyze the website.', payment: 'Could not connect to the payment server.', licenseInvalid: 'Your Pro license could not be verified. Try again or contact support.' }
};

const localized: Record<Exclude<Language, 'en'>, TranslationSet> = {
  sv: {
    ...english, languageName: 'Svenska', nav: { scanner: 'Skanner', about: 'Om oss', contact: 'Kontakt', premium: 'Premium' }, hero: { ...english.hero, secure: 'Säker och anonym analys', title: ['Analysera.', 'Säkra.', 'Optimera.'], description: 'Ange din webbadress för en heltäckande analys av kodkvalitet, säkerhet, prestanda och SEO.', urlPlaceholder: 'https://din-hemsida.se', scan: 'Skanna', steps: [{ title: 'Skanna', description: 'Vår motor hämtar din DOM-struktur och analyserar koden i realtid utan att påverka Core Web Vitals.' }, { title: 'Analysera', description: 'Regelmotorn utvärderar säkerhetsheaders, svarstider, metadata, tillgänglighet och kodkvalitet.' }, { title: 'Åtgärda', description: 'Få en prioriterad lista med exakta kodändringar för att stärka signaler och stänga säkerhetshål.' }] }, scanning: { target: 'Mål:' }, scanSteps: ['INITIERAR ANSLUTNING...', 'HÄMTAR DOM-STRUKTUR...', 'ANALYSERAR KODKVALITET...', 'SÖKER EFTER SÄKERHETSBRISTER...', 'UTVÄRDERAR SEO-MÄTVÄRDEN...', 'SAMMANSTÄLLER RAPPORT...'], about: { title: 'Om oss', lead: 'SiteScanner Pro byggdes på en enkel övertygelse: varje webbplatsägare förtjänar att veta exakt hur frisk deras webbplats är – och precis hur den blir bättre.', sections: [{ heading: 'Vad vi gör', body: 'Vi är specialister på automatiserad webbanalys. Vår skanner granskar din webbplats inom fem kritiska områden – SEO, prestanda, säkerhet, tillgänglighet och kodkvalitet – och destillerar många tekniska kontroller till en tydlig, prioriterad rapport. Inga tillägg, ingen installation, ingen konfiguration: ange din webbadress och få en komplett hälsorapport på sekunder.' }, { heading: 'Så fungerar det', body: 'Vår skanningsmotor arbetar med deterministiska regler. De fångar mätbara problem som saknade metataggar, saknade alt-texter, långsamma serversvar och render-blockerande skript – och varje fynd kommer med en prioriterad rekommendation och en färdig kodfix.' }, { heading: 'Vårt löfte', body: 'Analys ska aldrig ske på bekostnad av förtroende. Skanningen är anonym, kräver inget konto och påverkar inte din webbplats alls medan den körs. Vi säljer aldrig dina data. Vårt enda mål är att du går därifrån med en snabbare, säkrare och synligare webbplats.' }] }, features: { heading: 'Enterprise-Grade', headingAccent: 'Funktioner', items: [{ title: 'Grundläggande SEO-taggar', description: 'Validering av Title-, H1- och Meta Description-taggar för maximal synlighet i sökmotorer.' }, { title: 'Serverresponskoll', description: 'Mäter hur snabbt servern svarar och flaggar långsamma svar som sänker laddningstid och Core Web Vitals.' }, { title: 'HTTPS och säkerhetsheaders', description: 'Kontrollerar kryptering samt HSTS- och clickjacking-skydd så att besökare landar på en säker anslutning.' }, { title: 'Tillgänglighet i grunden', description: 'Hittar saknade alt-texter och språkattribut som skapar hinder för hjälpmedel.' }, { title: 'Kodkvalitetskontroller', description: 'Flaggar inline-CSS, föråldrade HTML-taggar och render-blockerande JavaScript för renare, snabbare sidor.' }, { title: 'Ingen påverkan på din sajt', description: 'Skanningarna körs på våra servrar mot din publika HTML och headers – inget installeras och din sajt ändras aldrig.' }] }, history: { title: 'Tidigare skanningar', target: 'Mål', score: 'Poäng', date: 'Datum' }, dashboard: { ...english.dashboard, report: 'Analysrapport', exportPdf: 'Exportera till PDF', totalScore: 'Total poäng', details: 'Visar detaljer', clickForDetails: 'Klicka för detaljer', identifiedIssues: 'Identifierade problem', categoryIssues: '{category} problem', recommendation: 'Rekommendation', noIssues: 'Inga problem hittades i denna kategori.', categories: { SEO: 'SEO', Performance: 'Prestanda', Security: 'Säkerhet', Accessibility: 'Tillgänglighet', Code: 'Kod' } }, paywall: { title: 'Premium\nkrävs.', description: 'Du ser vilka fel som hittats. Lås upp Pro för att få den kompletta lösningen till varje fel - med exakta kodfixar.', benefits: ['Obegränsade skanningar', 'Kompletta kodlösningar', 'Snabbare skanningar (kortare väntetid)'], buy: 'Köp nu – 99 kr', cancel: 'Avbryt' }, contact: { ...english.contact, successTitle: 'Tack för ditt meddelande!', successDescription: 'Vi har tagit emot ditt mail och återkommer så snart vi kan.', sendAnother: 'Skicka ett till meddelande', name: 'Namn', namePlaceholder: 'Ditt namn', email: 'E-post', emailPlaceholder: 'din@email.se', subject: 'Ämne', subjectPlaceholder: 'Vad gäller det?', message: 'Meddelande', messagePlaceholder: 'Skriv ditt meddelande här...', sending: 'Skickar...', send: 'Skicka meddelande', sendError: 'Något gick fel vid sändning.' }, errors: { freeScan: 'Ett fel uppstod vid analysen.', premiumScan: 'Premiumanalysen misslyckades.', scanFailed: 'Kunde inte analysera webbplatsen.', payment: 'Kunde inte ansluta till betalningsservern.', licenseInvalid: 'Din Pro-licens kunde inte verifieras. Försök igen eller kontakta support.' }
  },
  tr: { ...english, languageName: 'Türkçe', nav: { scanner: 'Tarayıcı', about: 'Hakkımızda', contact: 'İletişim', premium: 'Premium' } },
  es: { ...english, languageName: 'Español', nav: { scanner: 'Escáner', about: 'Nosotros', contact: 'Contacto', premium: 'Premium' } },
  fr: { ...english, languageName: 'Français', nav: { scanner: 'Scanner', about: 'À propos', contact: 'Contact', premium: 'Premium' } },
  ar: { ...english, languageName: 'العربية', nav: { scanner: 'الفاحص', about: 'من نحن', contact: 'اتصل بنا', premium: 'مميز' } }
};

localized.tr.hero = { secure: 'Güvenli ve anonim analiz', title: ['Analiz et.', 'Güvenceye al.', 'Optimize et.'], description: 'Kod kalitesi, güvenlik, performans ve SEO için kapsamlı analiz.', urlPlaceholder: 'https://web-siteniz.com', scan: 'Tara', steps: [{ title: 'Tara', description: 'Motorumuz DOM yapınızı alır ve Core Web Vitals değerlerinizi etkilemeden kodu gerçek zamanlı analiz eder.' }, { title: 'Analiz', description: 'Kural motoru güvenlik başlıklarını, yanıt sürelerini, meta verileri, erişilebilirliği ve kod kalitesini değerlendirir.' }, { title: 'Düzelt', description: 'Güvenlik açıklarını kapatmak için önceliklendirilmiş kod önerileri alın.' }] };
localized.tr.scanning = { target: 'Hedef:' };
localized.tr.scanSteps = ['BAĞLANTI BAŞLATILIYOR...', 'DOM YAPISI ALINIYOR...', 'KOD KALİTESİ ANALİZ EDİLİYOR...', 'GÜVENLİK AÇIKLARI ARANIYOR...', 'SEO SİNYALLERİ DEĞERLENDİRİLİYOR...', 'RAPOR HAZIRLANIYOR...'];
localized.tr.about = { title: 'Hakkımızda', lead: 'SiteScanner Pro basit bir inanç üzerine kuruldu: her web sitesi sahibi, sitesinin ne kadar sağlıklı olduğunu tam olarak bilmeyi ve onu nasıl geliştireceğini net biçimde görmeyi hak eder.', sections: [{ heading: 'Ne yapıyoruz', body: 'Otomatik web sitesi analizi konusunda uzmanız. Tarayıcımız sitenizi beş kritik alanda inceler – SEO, performans, güvenlik, erişilebilirlik ve kod kalitesi – ve birçok teknik kontrolü tek bir net, önceliklendirilmiş rapora dönüştürür. Eklenti yok, kurulum yok, yapılandırma yok: yalnızca adresinizi girin, tam sağlık raporunuzu saniyeler içinde alın.' }, { heading: 'Nasıl çalışır', body: 'Tarama motorumuz deterministik kurallarla çalışır. Eksik meta etiketleri, eksik alternatif metinler, yavaş sunucu yanıtları ve işlemeyi engelleyen betikler gibi ölçülebilir sorunları yakalar; her bulgu, önceliklendirilmiş bir öneri ve hazır bir kod düzeltmesiyle birlikte gelir.' }, { heading: 'Vaadimiz', body: 'Analiz asla güvenlikten ödün vermemelidir. Tarama anonimdir, hesap gerektirmez ve çalışırken web sitenizi hiçbir şekilde etkilemez. Verilerinizi asla satmayız. Tek hedefimiz, daha hızlı, daha güvenli ve daha görünür bir web sitesiyle ayrılmanızdır.' }] };
localized.es.hero = { secure: 'Análisis seguro y anónimo', title: ['Analiza.', 'Protege.', 'Optimiza.'], description: 'Introduce tu web para un análisis completo de calidad del código, seguridad, rendimiento y SEO.', urlPlaceholder: 'https://tu-sitio.com', scan: 'Escanear', steps: [{ title: 'Escanear', description: 'Nuestro motor analiza el DOM en tiempo real sin afectar tus Core Web Vitals.' }, { title: 'Analizar', description: 'Nuestro motor de reglas evalúa cabeceras de seguridad, tiempos de respuesta, metadatos, accesibilidad y calidad del código.' }, { title: 'Mejorar', description: 'Obtén cambios de código priorizados para cerrar brechas de seguridad.' }] };
localized.es.scanning = { target: 'Objetivo:' };
localized.es.scanSteps = ['INICIANDO CONEXIÓN...', 'OBTENIENDO ESTRUCTURA DOM...', 'ANALIZANDO CALIDAD DEL CÓDIGO...', 'BUSCANDO PROBLEMAS DE SEGURIDAD...', 'EVALUANDO SEÑALES SEO...', 'CREANDO INFORME...'];
localized.es.about = { title: 'Sobre nosotros', lead: 'SiteScanner Pro nació de una convicción sencilla: todo propietario de un sitio web merece saber exactamente qué tan sano está su sitio y cómo mejorarlo con precisión.', sections: [{ heading: 'Qué hacemos', body: 'Nos especializamos en el análisis automatizado de sitios web. Nuestro escáner examina tu sitio en cinco áreas críticas – SEO, rendimiento, seguridad, accesibilidad y calidad del código – y destila numerosas comprobaciones técnicas en un informe claro y priorizado. Sin plugins, sin instalación, sin configuración: introduce tu URL y recibe un informe completo en segundos.' }, { heading: 'Cómo funciona', body: 'Nuestro motor de análisis funciona con reglas deterministas. Detectan problemas medibles como metaetiquetas faltantes, textos alternativos ausentes, respuestas lentas del servidor o scripts que bloquean el renderizado, y cada hallazgo incluye una recomendación priorizada junto con una corrección de código lista para usar.' }, { heading: 'Nuestra promesa', body: 'El análisis nunca debe ir en detrimento de la confianza. El escaneo es anónimo, no requiere cuenta y no afecta en absoluto a tu sitio web mientras se ejecuta. Nunca vendemos tus datos. Nuestro único objetivo es que te marches con un sitio más rápido, más seguro y más visible.' }] };
localized.fr.hero = { secure: 'Analyse sécurisée et anonyme', title: ['Analysez.', 'Sécurisez.', 'Optimisez.'], description: 'Saisissez votre site pour une analyse complète de la qualité du code, de la sécurité, des performances et du SEO.', urlPlaceholder: 'https://votre-site.fr', scan: 'Analyser', steps: [{ title: 'Analyser', description: 'Notre moteur analyse le DOM en temps réel sans affecter vos Core Web Vitals.' }, { title: 'Évaluer', description: 'Notre moteur à règles évalue les en-têtes de sécurité, les temps de réponse, les métadonnées, l’accessibilité et la qualité du code.' }, { title: 'Corriger', description: 'Obtenez des changements de code prioritaires pour fermer les failles.' }] };
localized.fr.scanning = { target: 'Cible :' };
localized.fr.scanSteps = ['INITIALISATION DE LA CONNEXION...', 'RÉCUPÉRATION DU DOM...', 'ANALYSE DE LA QUALITÉ DU CODE...', 'RECHERCHE DE PROBLÈMES DE SÉCURITÉ...', 'ÉVALUATION DES SIGNAUX SEO...', 'CRÉATION DU RAPPORT...'];
localized.fr.about = { title: 'À propos de nous', lead: 'SiteScanner Pro est né d’une conviction simple : tout propriétaire de site web mérite de savoir exactement où en est la santé de son site – et précisément comment l’améliorer.', sections: [{ heading: 'Ce que nous faisons', body: 'Nous sommes spécialisés dans l’analyse automatisée de sites web. Notre scanner examine votre site dans cinq domaines critiques – SEO, performances, sécurité, accessibilité et qualité du code – et condense de nombreux points de contrôle techniques en un rapport clair et hiérarchisé. Sans plugin, sans installation, sans configuration : entrez votre URL et recevez un rapport complet en quelques secondes.' }, { heading: 'Comment ça marche', body: 'Notre moteur d’analyse fonctionne avec des règles déterministes. Elles détectent les problèmes mesurables comme les balises meta manquantes, les textes alternatifs absents, les réponses serveur lentes ou les scripts bloquant le rendu, et chaque constat est accompagné d’une recommandation priorisée ainsi que d’un correctif prêt à l’emploi.' }, { heading: 'Notre promesse', body: 'L’analyse ne doit jamais se faire au détriment de la confiance. Le scan est anonyme, sans compte requis, et laisse votre site totalement inchangé pendant son exécution. Nous ne vendons jamais vos données. Notre seul objectif : que vous repartiez avec un site plus rapide, plus sûr et plus visible.' }] };
localized.ar.hero = { secure: 'تحليل آمن ومجهول', title: ['حلّل.', 'أمّن.', 'حسّن.'], description: 'أدخل عنوان موقعك لتحليل شامل لجودة الكود والأمان والأداء وتحسين محركات البحث.', urlPlaceholder: 'https://موقعك.com', scan: 'فحص', steps: [{ title: 'فحص', description: 'يجلب محركنا بنية DOM ويحلل الكود مباشرة دون التأثير على مؤشرات الويب الأساسية.' }, { title: 'تحليل', description: 'يقيّم محرك القواعد ترويسات الأمان وأزمنة الاستجابة والبيانات الوصفية وإمكانية الوصول وجودة الكود.' }, { title: 'إصلاح', description: 'احصل على تغييرات كود مرتبة حسب الأولوية لإغلاق الثغرات.' }] };
localized.ar.scanning = { target: 'الهدف:' };
localized.ar.scanSteps = ['جارٍ بدء الاتصال...', 'جارٍ جلب بنية DOM...', 'جارٍ تحليل جودة الكود...', 'جارٍ البحث عن مشكلات الأمان...', 'جارٍ تقييم إشارات SEO...', 'جارٍ إعداد التقرير...'];
localized.ar.about = { title: 'من نحن', lead: 'تأسس SiteScanner Pro على قناعة بسيطة: كل مالك موقع يستحق أن يعرف بالضبط مدى صحة موقعه وكيفية تحسينه بدقة.', sections: [{ heading: 'ماذا نفعل', body: 'نتخصص في التحليل الآلي للمواقع. يفحص الماسح موقعك في خمسة مجالات حرجة – تحسين محركات البحث، الأداء، الأمان، إمكانية الوصول وجودة الكود – ويحوّل العديد من الفحوصات التقنية إلى تقرير واحد واضح ومرتب حسب الأولوية. بلا إضافات أو تثبيت أو إعدادات: أدخل عنوانك واحصل على تقرير صحي كامل خلال ثوانٍ.' }, { heading: 'كيف يعمل', body: 'يعمل محرك الفحص لدينا بقواعد حتمية. تلتقط المشكلات القابلة للقياس مثل وسوم meta المفقودة والنصوص البديلة الغائبة وبطء استجابة الخادم والبرامج النصية المعيقة للعرض، ويأتي كل اكتشاف مع توصية مرتبة حسب الأولوية وإصلاح كود جاهز للاستخدام.' }, { heading: 'وعدنا', body: 'لا يجب أن يأتي التحليل على حساب الثقة. الفحص مجهول الهوية، لا يتطلب حسابًا، ولا يؤثر إطلاقًا على موقعك أثناء تشغيله. نحن لا نبيع بياناتك أبدًا. هدفنا الوحيد أن تنصرف بموقع أسرع وأكثر أمانًا وظهورًا.' }] };

const translatedFeatureItems: Record<Exclude<Language, 'en' | 'sv'>, Array<{ title: string; description: string }>> = {
  tr: english.features.items.map((item, index) => ({ ...item, title: ['Temel SEO Etiketleri', 'Sunucu Yanıt Kontrolü', 'HTTPS ve Güvenlik Başlıkları', 'Erişilebilirlik Temelleri', 'Kod Kalitesi Kontrolleri', 'Sitenizde Sıfır Etki'][index], description: ['Arama motorlarında maksimum görünürlük için Title, H1 ve Meta Description etiketlerinin doğrulanması.', 'Sunucunun ne kadar hızlı yanıt verdiğini ölçer ve yükleme süresini yavaşlatan yanıtları işaretler.', 'Şifrelemeyi ayrıca HSTS ve clickjacking korumasını kontrol eder.', 'Yardımcı teknolojiler için engel oluşturan eksik alt metinleri ve dil özniteliklerini tespit eder.', 'Daha temiz, daha hızlı sayfalar için satır içi CSS, eski HTML etiketleri ve render engelleyen JavaScript işaretlenir.', 'Taramalar sunucularımızda çalışır; hiçbir şey kurulmaz ve siteniz asla değiştirilmez.'][index] })),
  es: english.features.items.map((item, index) => ({ ...item, title: ['Etiquetas SEO básicas', 'Control de respuesta del servidor', 'HTTPS y cabeceras de seguridad', 'Accesibilidad básica', 'Controles de calidad del código', 'Cero impacto en tu sitio'][index], description: ['Validación de las etiquetas Title, H1 y Meta Description para máxima visibilidad en buscadores.', 'Mide la rapidez de respuesta del servidor y marca las respuestas lentas que penalizan el tiempo de carga.', 'Comprueba el cifrado junto con las protecciones HSTS y contra el clickjacking.', 'Detecta textos alternativos e idiomas faltantes que crean barreras de accesibilidad.', 'Señala CSS en línea, etiquetas HTML obsoletas y JavaScript que bloquea el renderizado.', 'Los escaneos se ejecutan en nuestros servidores; nada se instala y tu sitio nunca se modifica.'][index] })),
  fr: english.features.items.map((item, index) => ({ ...item, title: ['Balises SEO essentielles', 'Réponse du serveur', 'HTTPS et en-têtes de sécurité', 'Accessibilité de base', 'Qualité du code', 'Zéro impact sur votre site'][index], description: ['Validation des balises Title, H1 et Meta Description pour une visibilité maximale.', 'Mesure la rapidité de réponse du serveur et signale les réponses lentes qui pénalisent le chargement.', 'Vérifie le chiffrement ainsi que les protections HSTS et anti-clickjacking.', 'Détecte les textes alternatifs et attributs de langue manquants qui créent des barrières.', 'Signale le CSS en ligne, les balises HTML obsolètes et le JavaScript bloquant le rendu.', 'Les analyses s’exécutent sur nos serveurs ; rien n’est installé et votre site n’est jamais modifié.'][index] })),
  ar: english.features.items.map((item, index) => ({ ...item, title: ['وسوم SEO الأساسية', 'استجابة الخادم', 'HTTPS وترويسات الأمان', 'أساسيات إمكانية الوصول', 'جودة الكود', 'صفر تأثير على موقعك'][index], description: ['التحقق من وسوم Title وH1 وMeta Description لأقصى ظهور في محركات البحث.', 'يقيس سرعة استجابة الخادم ويحدد الاستجابات البطيئة التي تبطئ التحميل.', 'يتحقق من التشفير وحماية HSTS والحماية من clickjacking.', 'يكتشف النصوص البديلة وسمات اللغة المفقودة التي تشكل عوائق.', 'يشير إلى CSS المضمّن ووسوم HTML المهجورة وJavaScript المعيق للعرض.', 'تُجرى الفحوصات على خوادمنا؛ لا يُثبَّت شيء ولا يتغير موقعك أبدًا.'][index] }))
};

localized.tr.features = { heading: 'Kurumsal Düzey', headingAccent: 'Özellikler', items: translatedFeatureItems.tr };
localized.es.features = { heading: 'Nivel Enterprise', headingAccent: 'Funciones', items: translatedFeatureItems.es };
localized.fr.features = { heading: 'Niveau Enterprise', headingAccent: 'Fonctionnalités', items: translatedFeatureItems.fr };
localized.ar.features = { heading: 'بمستوى المؤسسات', headingAccent: 'الميزات', items: translatedFeatureItems.ar };

localized.tr.dashboard = { ...english.dashboard, report: 'Analiz raporu', exportPdf: 'PDF olarak dışa aktar', totalScore: 'Toplam puan', details: 'Ayrıntılar gösteriliyor', clickForDetails: 'Ayrıntılar için tıklayın', identifiedIssues: 'Belirlenen sorunlar', categoryIssues: '{category} sorunları', recommendation: 'Öneri', noIssues: 'Bu kategoride sorun bulunamadı.', categories: { SEO: 'SEO', Performance: 'Performans', Security: 'Güvenlik', Accessibility: 'Erişilebilirlik', Code: 'Kod' } };
localized.es.dashboard = { ...english.dashboard, report: 'Informe de análisis', exportPdf: 'Exportar a PDF', totalScore: 'Puntuación total', details: 'Mostrando detalles', clickForDetails: 'Pulsa para ver detalles', identifiedIssues: 'Problemas identificados', categoryIssues: 'Problemas de {category}', recommendation: 'Recomendación', noIssues: 'No se encontraron problemas en esta categoría.', categories: { SEO: 'SEO', Performance: 'Rendimiento', Security: 'Seguridad', Accessibility: 'Accesibilidad', Code: 'Código' } };
localized.fr.dashboard = { ...english.dashboard, report: 'Rapport d’analyse', exportPdf: 'Exporter en PDF', totalScore: 'Score total', details: 'Détails affichés', clickForDetails: 'Cliquer pour les détails', identifiedIssues: 'Problèmes identifiés', categoryIssues: 'Problèmes : {category}', recommendation: 'Recommandation', noIssues: 'Aucun problème dans cette catégorie.', categories: { SEO: 'SEO', Performance: 'Performance', Security: 'Sécurité', Accessibility: 'Accessibilité', Code: 'Code' } };
localized.ar.dashboard = { ...english.dashboard, report: 'تقرير التحليل', exportPdf: 'تصدير PDF', totalScore: 'النتيجة الإجمالية', details: 'عرض التفاصيل', clickForDetails: 'انقر للتفاصيل', identifiedIssues: 'المشكلات المكتشفة', categoryIssues: 'مشكلات {category}', recommendation: 'التوصية', noIssues: 'لم يتم العثور على مشكلات في هذه الفئة.', categories: { SEO: 'SEO', Performance: 'الأداء', Security: 'الأمان', Accessibility: 'إمكانية الوصول', Code: 'الكود' } };

localized.tr.history = { title: 'Önceki taramalar', target: 'Hedef', score: 'Puan', date: 'Tarih' };
localized.es.history = { title: 'Escaneos anteriores', target: 'Objetivo', score: 'Puntuación', date: 'Fecha' };
localized.fr.history = { title: 'Analyses précédentes', target: 'Cible', score: 'Score', date: 'Date' };
localized.ar.history = { title: 'الفحوصات السابقة', target: 'الهدف', score: 'النتيجة', date: 'التاريخ' };

localized.tr.paywall = { title: 'Premium\nGerekli.', description: 'Sorunların neler olduğunu görebilirsiniz. Her sorun için eksiksiz çözüm ve hazır kod için Pro\'nun kilidini açın.', benefits: ['Sınırsız tarama', 'Eksiksiz kod çözümleri', 'Daha hızlı taramalar (daha kısa bekleme)'], buy: 'Hemen satın al – 99 kr', cancel: 'İptal' };
localized.es.paywall = { title: 'Premium\nrequerido.', description: 'Puedes ver qué problemas se han encontrado. Desbloquea Pro para obtener la solución completa de cada problema, con el código exacto.', benefits: ['Escaneos ilimitados', 'Soluciones de código completas', 'Escaneos más rápidos (espera más corta)'], buy: 'Comprar ahora – 99 kr', cancel: 'Cancelar' };
localized.fr.paywall = { title: 'Premium\nrequis.', description: 'Vous pouvez voir quels problèmes ont été détectés. Débloquez Pro pour obtenir la solution complète de chaque problème, avec le code exact.', benefits: ['Analyses illimitées', 'Solutions de code complètes', 'Analyses plus rapides (attente réduite)'], buy: 'Acheter – 99 kr', cancel: 'Annuler' };
localized.ar.paywall = { title: 'يلزم\nPremium.', description: 'يمكنك الاطلاع على المشكلات التي تم اكتشافها. افتح Pro للحصول على الحل الكامل لكل مشكلة مع الكود الجاهز.', benefits: ['فحوصات غير محدودة', 'حلول كود كاملة', 'فحوصات أسرع (وقت انتظار أقصر)'], buy: 'اشترِ الآن – 99 kr', cancel: 'إلغاء' };

localized.sv.paywall = { title: 'Premium\nkrävs.', description: 'Du ser vilka fel som hittats. Lås upp Pro för att få den kompletta lösningen till varje fel - med exakta kodfixar.', benefits: ['Obegränsade skanningar', 'Kompletta kodlösningar', 'Snabbare skanningar (kortare väntetid)'], buy: 'Köp nu – 99 kr', cancel: 'Avbryt' };
localized.sv.dashboard = { ...english.dashboard, solutionLocked: 'Lösning låst', lockedHint: 'Få exakta åtgärder med steg-för-steg-instruktioner och färdig kod.', unlockCta: 'Lås upp – 99 kr' };

localized.tr.contact = { ...english.contact, successTitle: 'Mesajınız için teşekkürler!', successDescription: 'E-postanızı aldık ve en kısa sürede yanıtlayacağız.', sendAnother: 'Başka bir mesaj gönder', name: 'Ad', namePlaceholder: 'Adınız', email: 'E-posta', emailPlaceholder: 'siz@email.com', subject: 'Konu', subjectPlaceholder: 'Konu nedir?', message: 'Mesaj', messagePlaceholder: 'Mesajınızı buraya yazın...', sending: 'Gönderiliyor...', send: 'Mesaj gönder', sendError: 'Gönderim sırasında bir hata oluştu.' };
localized.es.contact = { ...english.contact, successTitle: '¡Gracias por tu mensaje!', successDescription: 'Hemos recibido tu correo y responderemos lo antes posible.', sendAnother: 'Enviar otro mensaje', name: 'Nombre', namePlaceholder: 'Tu nombre', email: 'Correo', emailPlaceholder: 'tu@email.com', subject: 'Asunto', subjectPlaceholder: '¿De qué se trata?', message: 'Mensaje', messagePlaceholder: 'Escribe tu mensaje aquí...', sending: 'Enviando...', send: 'Enviar mensaje', sendError: 'Algo salió mal al enviar.' };
localized.fr.contact = { ...english.contact, successTitle: 'Merci pour votre message !', successDescription: 'Nous avons reçu votre e-mail et vous répondrons dès que possible.', sendAnother: 'Envoyer un autre message', name: 'Nom', namePlaceholder: 'Votre nom', email: 'E-mail', emailPlaceholder: 'vous@email.com', subject: 'Objet', subjectPlaceholder: 'Quel est le sujet ?', message: 'Message', messagePlaceholder: 'Écrivez votre message ici...', sending: 'Envoi...', send: 'Envoyer le message', sendError: 'Une erreur est survenue lors de l’envoi.' };
localized.ar.contact = { ...english.contact, successTitle: 'شكرًا لرسالتك!', successDescription: 'تلقينا بريدك الإلكتروني وسنرد عليك قريبًا.', sendAnother: 'إرسال رسالة أخرى', name: 'الاسم', namePlaceholder: 'اسمك', email: 'البريد الإلكتروني', emailPlaceholder: 'you@email.com', subject: 'الموضوع', subjectPlaceholder: 'ما الموضوع؟', message: 'الرسالة', messagePlaceholder: 'اكتب رسالتك هنا...', sending: 'جارٍ الإرسال...', send: 'إرسال الرسالة', sendError: 'حدث خطأ أثناء الإرسال.' };

export const translations: Record<Language, TranslationSet> = { en: english, ...localized };
export const LANGUAGE_STORAGE_KEY = 'siteScannerLanguage';

export function getLanguage(value: string | null): Language {
  return LANGUAGE_OPTIONS.some(option => option.code === value) ? value as Language : 'en';
}

export function normalizeCategory(category: string): CategoryKey | string {
  const aliases: Record<string, CategoryKey> = {
    SEO: 'SEO', Prestanda: 'Performance', Performance: 'Performance',
    Säkerhet: 'Security', Security: 'Security', Tillgänglighet: 'Accessibility',
    Accessibility: 'Accessibility', Kodfel: 'Code', Code: 'Code'
  };
  return aliases[category] || category;
}
