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
    description: 'Enter your website address for a complete, AI-powered analysis of code quality, security, performance, and SEO.',
    urlPlaceholder: 'https://your-website.com',
    scan: 'Scan',
    steps: [
      { title: 'Scan', description: 'Our engine retrieves your DOM structure and analyzes the code in real time without affecting your Core Web Vitals.' },
      { title: 'AI Analysis', description: 'Gemini 3.1 Pro evaluates security, performance, and SEO with sub-millisecond rendering latency.' },
      { title: 'Fix', description: 'Get a prioritized list of exact code changes to add E-E-A-T signals and close security gaps.' }
    ]
  },
  scanning: { target: 'Target:' },
  scanSteps: ['INITIALIZING CONNECTION...', 'FETCHING DOM STRUCTURE...', 'ANALYZING CODE QUALITY...', 'SEARCHING FOR SECURITY ISSUES...', 'EVALUATING SEO SIGNALS...', 'ASSEMBLING REPORT...'],
  about: {
    title: 'About us',
    lead: 'SiteScanner Pro was built on a simple belief: every website owner deserves to know exactly how healthy their site is – and precisely how to make it better.',
    sections: [
      { heading: 'What we do', body: 'We specialize in automated website analysis. Our scanner examines your site across five critical areas – SEO, performance, security, accessibility, and code quality – and distills hundreds of technical checkpoints into one clear, prioritized report. No plugins, no installation, no configuration: enter your URL and receive a complete health report in seconds.' },
      { heading: 'How it works', body: 'We combine a rule-based scanning engine with advanced AI analysis. Deterministic rules catch measurable problems such as missing meta tags, insecure links, and oversized resources, while the AI layer adds context: it interprets your specific page, prioritizes what actually matters, and writes ready-to-use code fixes for every single finding.' },
      { heading: 'Our promise', body: 'Analysis should never come at the cost of trust. Scanning is anonymous, requires no account, and leaves your website completely unaffected while it runs. We never sell your data. Our only goal is that you walk away with a faster, safer, and more visible website.' }
    ]
  },
  features: {
    heading: 'Enterprise-Grade', headingAccent: 'Features',
    items: [
      { title: 'Edge-Level SEO Injection', description: 'Validation of Title, H1, Meta, and Canonical tags at the edge for maximum indexing.' },
      { title: 'Instant Network Rendering', description: 'Sub-millisecond latency analysis of your rendering chain (CSR, SSR, SSG) to identify bottlenecks.' },
      { title: 'High-Integrity Content', description: 'Native injection of E-E-A-T signals. We structurally analyze your page authority and trustworthiness.' },
      { title: 'JSON-LD Schema Auto-Gen', description: 'Automatic detection and recommendations for structured data to dominate rich snippets.' },
      { title: 'Autonomous Linking & Sitemap', description: 'Deep analysis of your internal linking structure and sitemap synchronization for an optimal crawl budget.' },
      { title: 'Zero Core Web Vitals Impact', description: 'Our fail-closed architecture ensures the analysis never affects your site\'s actual performance.' }
    ]
  },
  history: { title: 'Previous Scans', target: 'Target', score: 'Score', date: 'Date' },
  dashboard: {
    report: 'Analysis Report', exportPdf: 'Export PDF', totalScore: 'Total Score', details: 'Showing details', clickForDetails: 'Click for details', identifiedIssues: 'Identified Issues', categoryIssues: '{category} Issues',     recommendation: 'Recommendation', noIssues: 'No issues found in this category.',
    solutionLocked: 'Solution locked', lockedHint: 'Get the exact fix with step-by-step instructions and ready-to-use code.', unlockCta: 'Unlock – 99 kr',
    categories: { SEO: 'SEO', Performance: 'Performance', Security: 'Security', Accessibility: 'Accessibility', Code: 'Code' }
  },
  paywall: { title: 'Premium\nRequired.', description: 'You can see which issues were found. Unlock Pro to get the complete solution for every issue - with exact code fixes.', benefits: ['Unlimited scans', 'Complete code solutions', 'Priority scan queue'], buy: 'Buy now – 99 kr', cancel: 'Cancel' },
  contact: { successTitle: 'Thank you for your message!', successDescription: 'We received your email and will get back to you as soon as we can.', sendAnother: 'Send another message', name: 'Name', namePlaceholder: 'Your name', email: 'Email', emailPlaceholder: 'you@email.com', subject: 'Subject', subjectPlaceholder: 'What is it about?', message: 'Message', messagePlaceholder: 'Write your message here...', sending: 'Sending...', send: 'Send Message', sendError: 'Something went wrong while sending.' },
  errors: { freeScan: 'An error occurred during the analysis.', premiumScan: 'The AI analysis failed.', scanFailed: 'Could not analyze the website.', payment: 'Could not connect to the payment server.', licenseInvalid: 'Your Pro license could not be verified. Try again or contact support.' }
};

const localized: Record<Exclude<Language, 'en'>, TranslationSet> = {
  sv: {
    ...english, languageName: 'Svenska', nav: { scanner: 'Skanner', about: 'Om oss', contact: 'Kontakt', premium: 'Premium' }, hero: { ...english.hero, secure: 'Säker och anonym analys', title: ['Analysera.', 'Säkra.', 'Optimera.'], description: 'Ange din webbadress för en heltäckande, AI-driven analys av kodkvalitet, säkerhet, prestanda och SEO.', urlPlaceholder: 'https://din-hemsida.se', scan: 'Skanna', steps: [{ title: 'Skanna', description: 'Vår motor hämtar din DOM-struktur och analyserar koden i realtid utan att påverka Core Web Vitals.' }, { title: 'AI-analys', description: 'Gemini 3.1 Pro utvärderar säkerhet, prestanda och SEO med sub-millisekunds latens.' }, { title: 'Åtgärda', description: 'Få en prioriterad lista med exakta kodändringar för att stärka signaler och stänga säkerhetshål.' }] }, scanning: { target: 'Mål:' }, scanSteps: ['INITIERAR ANSLUTNING...', 'HÄMTAR DOM-STRUKTUR...', 'ANALYSERAR KODKVALITET...', 'SÖKER EFTER SÄKERHETSBRISTER...', 'UTVÄRDERAR SEO-MÄTVÄRDEN...', 'SAMMANSTÄLLER RAPPORT...'], about: { title: 'Om oss', lead: 'SiteScanner Pro byggdes på en enkel övertygelse: varje webbplatsägare förtjänar att veta exakt hur frisk deras webbplats är – och precis hur den blir bättre.', sections: [{ heading: 'Vad vi gör', body: 'Vi är specialister på automatiserad webbanalys. Vår skanner granskar din webbplats inom fem kritiska områden – SEO, prestanda, säkerhet, tillgänglighet och kodkvalitet – och destillerar hundratals tekniska kontroller till en tydlig, prioriterad rapport. Inga tillägg, ingen installation, ingen konfiguration: ange din webbadress och få en komplett hälsorapport på sekunder.' }, { heading: 'Så fungerar det', body: 'Vi kombinerar en regelbaserad skanningsmotor med avancerad AI-analys. Deterministiska regler fångar mätbara problem som saknade metataggar, osäkra länkar och överdimensionerade resurser, medan AI-analysen tolkar din specifika sida, prioriterar det som faktiskt spelar roll och skriver färdiga kodfixar för varje enskilt fynd.' }, { heading: 'Vårt löfte', body: 'Analys ska aldrig ske på bekostnad av förtroende. Skanningen är anonym, kräver inget konto och påverkar inte din webbplats alls medan den körs. Vi säljer aldrig dina data. Vårt enda mål är att du går därifrån med en snabbare, säkrare och synligare webbplats.' }] }, features: { heading: 'Enterprise-Grade', headingAccent: 'Funktioner', items: [{ title: 'Edge-Level SEO Injection', description: 'Validering av Title-, H1-, Meta- och Canonical-taggar på edge-nivå för maximal indexering.' }, { title: 'Instant Network Rendering', description: 'Sub-millisekunds latensanalys av din renderingskedja (CSR, SSR, SSG) för att hitta flaskhalsar.' }, { title: 'High-Integrity Content', description: 'Nativ injicering av E-E-A-T-signaler och strukturell analys av sidans auktoritet.' }, { title: 'JSON-LD Schema Auto-Gen', description: 'Automatisk detektering och rekommendationer för strukturerad data och rich snippets.' }, { title: 'Autonomous Linking & Sitemap', description: 'Djupanalys av intern länkstruktur och sitemap-synkronisering för optimal crawl-budget.' }, { title: 'Zero Core Web Vitals Impact', description: 'Fail-closed-arkitekturen säkerställer att analysen aldrig påverkar sidans faktiska prestanda.' }] }, history: { title: 'Tidigare skanningar', target: 'Mål', score: 'Poäng', date: 'Datum' }, dashboard: { ...english.dashboard, report: 'Analysrapport', exportPdf: 'Exportera till PDF', totalScore: 'Total poäng', details: 'Visar detaljer', clickForDetails: 'Klicka för detaljer', identifiedIssues: 'Identifierade problem', categoryIssues: '{category} problem', recommendation: 'Rekommendation', noIssues: 'Inga problem hittades i denna kategori.', categories: { SEO: 'SEO', Performance: 'Prestanda', Security: 'Säkerhet', Accessibility: 'Tillgänglighet', Code: 'Kod' } }, paywall: { title: 'Premium\nkrävs.', description: 'Du har förbrukat din kostnadsfria analys. Lås upp obegränsad tillgång för att fortsätta säkra dina webbplatser.', benefits: ['Obegränsade analyser', 'Avancerad säkerhet', 'Prioriterad AI-modell'], buy: 'Köp (499 kr)', cancel: 'Avbryt' }, contact: { ...english.contact, successTitle: 'Tack för ditt meddelande!', successDescription: 'Vi har tagit emot ditt mail och återkommer så snart vi kan.', sendAnother: 'Skicka ett till meddelande', name: 'Namn', namePlaceholder: 'Ditt namn', email: 'E-post', emailPlaceholder: 'din@email.se', subject: 'Ämne', subjectPlaceholder: 'Vad gäller det?', message: 'Meddelande', messagePlaceholder: 'Skriv ditt meddelande här...', sending: 'Skickar...', send: 'Skicka meddelande', sendError: 'Något gick fel vid sändning.' }, errors: { freeScan: 'Ett fel uppstod vid analysen.', premiumScan: 'AI-analysen misslyckades.', scanFailed: 'Kunde inte analysera webbplatsen.', payment: 'Kunde inte ansluta till betalningsservern.', licenseInvalid: 'Din Pro-licens kunde inte verifieras. Försök igen eller kontakta support.' }
  },
  tr: { ...english, languageName: 'Türkçe', nav: { scanner: 'Tarayıcı', about: 'Hakkımızda', contact: 'İletişim', premium: 'Premium' } },
  es: { ...english, languageName: 'Español', nav: { scanner: 'Escáner', about: 'Nosotros', contact: 'Contacto', premium: 'Premium' } },
  fr: { ...english, languageName: 'Français', nav: { scanner: 'Scanner', about: 'À propos', contact: 'Contact', premium: 'Premium' } },
  ar: { ...english, languageName: 'العربية', nav: { scanner: 'الفاحص', about: 'من نحن', contact: 'اتصل بنا', premium: 'مميز' } }
};

localized.tr.hero = { secure: 'Güvenli ve anonim analiz', title: ['Analiz et.', 'Güvenceye al.', 'Optimize et.'], description: 'Kod kalitesi, güvenlik, performans ve SEO için yapay zeka destekli kapsamlı analiz.', urlPlaceholder: 'https://web-siteniz.com', scan: 'Tara', steps: [{ title: 'Tara', description: 'Motorumuz DOM yapınızı alır ve Core Web Vitals değerlerinizi etkilemeden kodu gerçek zamanlı analiz eder.' }, { title: 'Yapay zeka analizi', description: 'Gemini 3.1 Pro güvenlik, performans ve SEO sinyallerini değerlendirir.' }, { title: 'Düzelt', description: 'Güvenlik açıklarını kapatmak için önceliklendirilmiş kod önerileri alın.' }] };
localized.tr.scanning = { target: 'Hedef:' };
localized.tr.scanSteps = ['BAĞLANTI BAŞLATILIYOR...', 'DOM YAPISI ALINIYOR...', 'KOD KALİTESİ ANALİZ EDİLİYOR...', 'GÜVENLİK AÇIKLARI ARANIYOR...', 'SEO SİNYALLERİ DEĞERLENDİRİLİYOR...', 'RAPOR HAZIRLANIYOR...'];
localized.tr.about = { title: 'Hakkımızda', lead: 'SiteScanner Pro basit bir inanç üzerine kuruldu: her web sitesi sahibi, sitesinin ne kadar sağlıklı olduğunu tam olarak bilmeyi ve onu nasıl geliştireceğini net biçimde görmeyi hak eder.', sections: [{ heading: 'Ne yapıyoruz', body: 'Otomatik web sitesi analizi konusunda uzmanız. Tarayıcımız sitenizi beş kritik alanda inceler – SEO, performans, güvenlik, erişilebilirlik ve kod kalitesi – ve yüzlerce teknik kontrolü tek bir net, önceliklendirilmiş rapora dönüştürür. Eklenti yok, kurulum yok, yapılandırma yok: yalnızca adresinizi girin, tam sağlık raporunuzu saniyeler içinde alın.' }, { heading: 'Nasıl çalışır', body: 'Kural tabanlı tarama motorunu gelişmiş yapay zeka analiziyle birleştiriyoruz. Belirleyici kurallar eksik meta etiketleri, güvensiz bağlantıları ve aşırı büyük kaynakları yakalar; yapay zeka katmanı bağlam ekler: sayfanızı yorumlar, gerçekten önemli olanları önceliklendirir ve her bulgu için hazır kod düzeltmeleri yazar.' }, { heading: 'Vaadimiz', body: 'Analiz asla güvenlikten ödün vermemelidir. Tarama anonimdir, hesap gerektirmez ve çalışırken web sitenizi hiçbir şekilde etkilemez. Verilerinizi asla satmayız. Tek hedefimiz, daha hızlı, daha güvenli ve daha görünür bir web sitesiyle ayrılmanızdır.' }] };
localized.es.hero = { secure: 'Análisis seguro y anónimo', title: ['Analiza.', 'Protege.', 'Optimiza.'], description: 'Introduce tu web para un análisis completo con IA de calidad del código, seguridad, rendimiento y SEO.', urlPlaceholder: 'https://tu-sitio.com', scan: 'Escanear', steps: [{ title: 'Escanear', description: 'Nuestro motor analiza el DOM en tiempo real sin afectar tus Core Web Vitals.' }, { title: 'Análisis IA', description: 'Gemini 3.1 Pro evalúa seguridad, rendimiento y SEO.' }, { title: 'Mejorar', description: 'Obtén cambios de código priorizados para cerrar brechas de seguridad.' }] };
localized.es.scanning = { target: 'Objetivo:' };
localized.es.scanSteps = ['INICIANDO CONEXIÓN...', 'OBTENIENDO ESTRUCTURA DOM...', 'ANALIZANDO CALIDAD DEL CÓDIGO...', 'BUSCANDO PROBLEMAS DE SEGURIDAD...', 'EVALUANDO SEÑALES SEO...', 'CREANDO INFORME...'];
localized.es.about = { title: 'Sobre nosotros', lead: 'SiteScanner Pro nació de una convicción sencilla: todo propietario de un sitio web merece saber exactamente qué tan sano está su sitio y cómo mejorarlo con precisión.', sections: [{ heading: 'Qué hacemos', body: 'Nos especializamos en el análisis automatizado de sitios web. Nuestro escáner examina tu sitio en cinco áreas críticas – SEO, rendimiento, seguridad, accesibilidad y calidad del código – y destila cientos de comprobaciones técnicas en un informe claro y priorizado. Sin plugins, sin instalación, sin configuración: introduce tu URL y recibe un informe completo en segundos.' }, { heading: 'Cómo funciona', body: 'Combinamos un motor de análisis basado en reglas con IA avanzada. Las reglas deterministas detectan problemas medibles como metaetiquetas faltantes, enlaces inseguros o recursos sobredimensionados, mientras que la capa de IA aporta contexto: interpreta tu página concreta, prioriza lo que de verdad importa y escribe correcciones de código listas para usar.' }, { heading: 'Nuestra promesa', body: 'El análisis nunca debe ir en detrimento de la confianza. El escaneo es anónimo, no requiere cuenta y no afecta en absoluto a tu sitio web mientras se ejecuta. Nunca vendemos tus datos. Nuestro único objetivo es que te marches con un sitio más rápido, más seguro y más visible.' }] };
localized.fr.hero = { secure: 'Analyse sécurisée et anonyme', title: ['Analysez.', 'Sécurisez.', 'Optimisez.'], description: 'Saisissez votre site pour une analyse complète par IA de la qualité du code, de la sécurité, des performances et du SEO.', urlPlaceholder: 'https://votre-site.fr', scan: 'Analyser', steps: [{ title: 'Analyser', description: 'Notre moteur analyse le DOM en temps réel sans affecter vos Core Web Vitals.' }, { title: 'Analyse IA', description: 'Gemini 3.1 Pro évalue la sécurité, les performances et le SEO.' }, { title: 'Corriger', description: 'Obtenez des changements de code prioritaires pour fermer les failles.' }] };
localized.fr.scanning = { target: 'Cible :' };
localized.fr.scanSteps = ['INITIALISATION DE LA CONNEXION...', 'RÉCUPÉRATION DU DOM...', 'ANALYSE DE LA QUALITÉ DU CODE...', 'RECHERCHE DE PROBLÈMES DE SÉCURITÉ...', 'ÉVALUATION DES SIGNAUX SEO...', 'CRÉATION DU RAPPORT...'];
localized.fr.about = { title: 'À propos de nous', lead: 'SiteScanner Pro est né d’une conviction simple : tout propriétaire de site web mérite de savoir exactement où en est la santé de son site – et précisément comment l’améliorer.', sections: [{ heading: 'Ce que nous faisons', body: 'Nous sommes spécialisés dans l’analyse automatisée de sites web. Notre scanner examine votre site dans cinq domaines critiques – SEO, performances, sécurité, accessibilité et qualité du code – et condense des centaines de points de contrôle techniques en un rapport clair et hiérarchisé. Sans plugin, sans installation, sans configuration : entrez votre URL et recevez un rapport complet en quelques secondes.' }, { heading: 'Comment ça marche', body: 'Nous associons un moteur d’analyse à base de règles à une IA avancée. Les règles déterministes détectent les problèmes mesurables comme les balises meta manquantes, les liens non sécurisés ou les ressources trop lourdes, tandis que l’IA apporte le contexte : elle interprète votre page, hiérarchise ce qui compte vraiment et rédige des correctifs prêts à l’emploi pour chaque anomalie.' }, { heading: 'Notre promesse', body: 'L’analyse ne doit jamais se faire au détriment de la confiance. Le scan est anonyme, sans compte requis, et laisse votre site totalement inchangé pendant son exécution. Nous ne vendons jamais vos données. Notre seul objectif : que vous repartiez avec un site plus rapide, plus sûr et plus visible.' }] };
localized.ar.hero = { secure: 'تحليل آمن ومجهول', title: ['حلّل.', 'أمّن.', 'حسّن.'], description: 'أدخل عنوان موقعك لتحليل شامل بالذكاء الاصطناعي لجودة الكود والأمان والأداء وتحسين محركات البحث.', urlPlaceholder: 'https://موقعك.com', scan: 'فحص', steps: [{ title: 'فحص', description: 'يجلب محركنا بنية DOM ويحلل الكود مباشرة دون التأثير على مؤشرات الويب الأساسية.' }, { title: 'تحليل بالذكاء الاصطناعي', description: 'يقيّم Gemini 3.1 Pro الأمان والأداء وتحسين محركات البحث.' }, { title: 'إصلاح', description: 'احصل على تغييرات كود مرتبة حسب الأولوية لإغلاق الثغرات.' }] };
localized.ar.scanning = { target: 'الهدف:' };
localized.ar.scanSteps = ['جارٍ بدء الاتصال...', 'جارٍ جلب بنية DOM...', 'جارٍ تحليل جودة الكود...', 'جارٍ البحث عن مشكلات الأمان...', 'جارٍ تقييم إشارات SEO...', 'جارٍ إعداد التقرير...'];
localized.ar.about = { title: 'من نحن', lead: 'تأسس SiteScanner Pro على قناعة بسيطة: كل مالك موقع يستحق أن يعرف بالضبط مدى صحة موقعه وكيفية تحسينه بدقة.', sections: [{ heading: 'ماذا نفعل', body: 'نتخصص في التحليل الآلي للمواقع. يفحص الماسح موقعك في خمسة مجالات حرجة – تحسين محركات البحث، الأداء، الأمان، إمكانية الوصول وجودة الكود – ويحوّل مئات الفحوصات التقنية إلى تقرير واحد واضح ومرتب حسب الأولوية. بلا إضافات أو تثبيت أو إعدادات: أدخل عنوانك واحصل على تقرير صحي كامل خلال ثوانٍ.' }, { heading: 'كيف يعمل', body: 'نجمع بين محرك فحص قائم على القواعد وتحليل متقدم بالذكاء الاصطناعي. تلتقط القواعد الحتمية المشكلات القابلة للقياس مثل وسوم meta المفقودة والروابط غير الآمنة والموارد الضخمة، بينما تضيف طبقة الذكاء الاصطناعي السياق: تفسر صفحتك، ترتب الأولويات فعليًا، وتكتب إصلاحات كود جاهزة لكل مشكلة.' }, { heading: 'وعدنا', body: 'لا يجب أن يأتي التحليل على حساب الثقة. الفحص مجهول الهوية، لا يتطلب حسابًا، ولا يؤثر إطلاقًا على موقعك أثناء تشغيله. نحن لا نبيع بياناتك أبدًا. هدفنا الوحيد أن تنصرف بموقع أسرع وأكثر أمانًا وظهورًا.' }] };

const translatedFeatureItems: Record<Exclude<Language, 'en' | 'sv'>, Array<{ title: string; description: string }>> = {
  tr: english.features.items.map((item, index) => ({ ...item, title: ['Edge SEO Enjeksiyonu', 'Anında Ağ Görüntüleme', 'Yüksek Güvenilirlikte İçerik', 'JSON-LD Şema Üretimi', 'Otonom Bağlantılar ve Site Haritası', 'Core Web Vitals Etkisi Yok'][index], description: ['Maksimum indeksleme için SEO etiketlerini edge seviyesinde doğrulayın.', 'Görüntüleme zincirindeki darboğazları bulun.', 'Sayfa otoritesini ve güvenilirliğini yapısal olarak analiz edin.', 'Yapılandırılmış verileri otomatik olarak tespit edin.', 'Dahili bağlantıları ve site haritasını analiz edin.', 'Analiz, gerçek performansınızı etkilemez.'][index] })),
  es: english.features.items.map((item, index) => ({ ...item, title: ['Inyección SEO en Edge', 'Renderizado de Red Instantáneo', 'Contenido de Alta Integridad', 'Generación Automática JSON-LD', 'Enlaces y Sitemap Autónomos', 'Cero Impacto en Core Web Vitals'][index], description: ['Valida etiquetas SEO en el edge para máxima indexación.', 'Encuentra cuellos de botella en tu cadena de renderizado.', 'Analiza estructuralmente la autoridad y confianza de tu página.', 'Detecta datos estructurados automáticamente.', 'Analiza enlaces internos y sincronización del sitemap.', 'El análisis nunca afecta al rendimiento real.'][index] })),
  fr: english.features.items.map((item, index) => ({ ...item, title: ['Injection SEO Edge', 'Rendu Réseau Instantané', 'Contenu Haute Intégrité', 'Génération JSON-LD', 'Liens et Sitemap Autonomes', 'Aucun Impact Core Web Vitals'][index], description: ['Validez les balises SEO au niveau edge pour un indexage maximal.', 'Identifiez les goulots d’étranglement du rendu.', 'Analysez l’autorité et la fiabilité de votre page.', 'Détectez automatiquement les données structurées.', 'Analysez les liens internes et le sitemap.', 'L’analyse n’affecte jamais les performances réelles.'][index] })),
  ar: english.features.items.map((item, index) => ({ ...item, title: ['حقن SEO على الحافة', 'عرض الشبكة الفوري', 'محتوى عالي النزاهة', 'إنشاء JSON-LD تلقائي', 'روابط وخريطة موقع مستقلة', 'دون تأثير على Core Web Vitals'][index], description: ['تحقق من وسوم SEO على مستوى الحافة لأفضل فهرسة.', 'اعثر على اختناقات سلسلة العرض.', 'حلّل سلطة الصفحة وموثوقيتها بنيويًا.', 'اكتشف البيانات المنظمة تلقائيًا.', 'حلّل الروابط الداخلية وخريطة الموقع.', 'لا يؤثر التحليل على الأداء الفعلي.'][index] }))
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

localized.tr.paywall = { title: 'Premium\nGerekli.', description: 'Sorunların neler olduğunu görebilirsiniz. Her sorun için eksiksiz çözüm ve hazır kod için Pro\'nun kilidini açın.', benefits: ['Sınırsız tarama', 'Eksiksiz kod çözümleri', 'Öncelikli tarama kuyruğu'], buy: 'Hemen satın al – 99 kr', cancel: 'İptal' };
localized.es.paywall = { title: 'Premium\nrequerido.', description: 'Puedes ver qué problemas se han encontrado. Desbloquea Pro para obtener la solución completa de cada problema, con el código exacto.', benefits: ['Escaneos ilimitados', 'Soluciones de código completas', 'Cola de escaneo prioritaria'], buy: 'Comprar ahora – 99 kr', cancel: 'Cancelar' };
localized.fr.paywall = { title: 'Premium\nrequis.', description: 'Vous pouvez voir quels problèmes ont été détectés. Débloquez Pro pour obtenir la solution complète de chaque problème, avec le code exact.', benefits: ['Analyses illimitées', 'Solutions de code complètes', 'File d’analyse prioritaire'], buy: 'Acheter – 99 kr', cancel: 'Annuler' };
localized.ar.paywall = { title: 'يلزم\nPremium.', description: 'يمكنك الاطلاع على المشكلات التي تم اكتشافها. افتح Pro للحصول على الحل الكامل لكل مشكلة مع الكود الجاهز.', benefits: ['فحوصات غير محدودة', 'حلول كود كاملة', 'أولوية في قائمة الفحص'], buy: 'اشترِ الآن – 99 kr', cancel: 'إلغاء' };

localized.sv.paywall = { title: 'Premium\nkrävs.', description: 'Du ser vilka fel som hittats. Lås upp Pro för att få den kompletta lösningen till varje fel - med exakta kodfixar.', benefits: ['Obegränsade skanningar', 'Kompletta kodlösningar', 'Förtur i skanningskön'], buy: 'Köp nu – 99 kr', cancel: 'Avbryt' };
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
