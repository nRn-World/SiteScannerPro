export interface SiteCopy {
  actions: {
    newScan: string;
    copy: string;
    copied: string;
    codeExample: string;
    menu: string;
    close: string;
    goPro: string;
    startFree: string;
    skipToContent: string;
  };
  trust: {
    anonymous: string;
    noInstall: string;
    noAccount: string;
    multilingual: string;
    lifetime: string;
  };
  score: {
    excellent: string;
    good: string;
    needsWork: string;
    poor: string;
  };
  severity: {
    High: string;
    Medium: string;
    Low: string;
  };
  footer: {
    tagline: string;
    product: string;
    legal: string;
    company: string;
    terms: string;
    privacy: string;
    cookies: string;
    rights: string;
    support: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    popular: string;
    freeName: string;
    freePrice: string;
    freeNote: string;
    proName: string;
    proPrice: string;
    proNote: string;
    ctaPro: string;
    ctaFree: string;
    freeFeatures: string[];
    proFeatures: string[];
  };
  legal: {
    termsTitle: string;
    privacyTitle: string;
    cookiesTitle: string;
    updated: string;
    terms: Array<{ heading: string; body: string }>;
    privacy: Array<{ heading: string; body: string }>;
    cookies: Array<{ heading: string; body: string }>;
  };
  ctaBand: {
    title: string;
    body: string;
    button: string;
  };
  pages: {
    contactTitle: string;
    contactLead: string;
    contactEmailLabel: string;
    contactReply: string;
  };
  preview: {
    sampleHost: string;
    issues: string;
    livePreview: string;
  };
}

const en: SiteCopy = {
  actions: {
    newScan: 'New scan',
    copy: 'Copy',
    copied: 'Copied',
    codeExample: 'Code example',
    menu: 'Menu',
    close: 'Close',
    goPro: 'Go Pro',
    startFree: 'Start a free scan',
    skipToContent: 'Skip to content',
  },
  trust: {
    anonymous: 'Anonymous scanning',
    noInstall: 'Nothing to install',
    noAccount: 'No account required',
    multilingual: '6 languages',
    lifetime: '99 kr · lifetime, no subscription',
  },
  score: {
    excellent: 'Excellent',
    good: 'Good',
    needsWork: 'Needs work',
    poor: 'Critical',
  },
  severity: { High: 'High', Medium: 'Medium', Low: 'Low' },
  footer: {
    tagline: 'Clear, prioritized website health reports — so you know exactly what to fix.',
    product: 'Product',
    legal: 'Legal',
    company: 'Company',
    terms: 'Terms',
    privacy: 'Privacy',
    cookies: 'Cookies',
    rights: 'All rights reserved.',
    support: 'Support',
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Simple pricing. No subscription.',
    subtitle: 'Start free. Unlock exact code fixes with a one-time purchase — yours for life.',
    popular: 'Most popular',
    freeName: 'Free',
    freePrice: '0 kr',
    freeNote: 'For a first look at site health',
    proName: 'Premium',
    proPrice: '99 kr',
    proNote: 'One-time · lifetime access',
    ctaPro: 'Unlock Premium',
    ctaFree: 'Scan a website',
    freeFeatures: [
      'Full website health scan',
      'Overall score and five categories',
      'Issue details and severity',
      'PDF export',
      'Local scan history',
    ],
    proFeatures: [
      'Everything in Free',
      'Complete, ready-to-use code fixes',
      'Unlimited scans',
      'Faster scans with shorter wait time',
      'Lifetime access — no renewal',
    ],
  },
  legal: {
    termsTitle: 'Terms of use',
    privacyTitle: 'Privacy policy',
    cookiesTitle: 'Cookie policy',
    updated: 'Last updated: 26 August 2026',
    terms: [
      {
        heading: 'The service',
        body: 'SiteScanner Pro provides automated analysis of publicly accessible web pages. Reports cover SEO, performance, security, accessibility, and code-quality signals. Results are a starting point and should be reviewed by a qualified developer before production changes are made. A scan is not a complete security, accessibility, legal, or performance audit.',
      },
      {
        heading: 'Acceptable use',
        body: 'You may only scan websites you own or are authorised to assess. You must not use the service to disrupt, overload, or attempt to access non-public systems. We may refuse or rate-limit scans that appear abusive.',
      },
      {
        heading: 'Premium',
        body: 'Premium is a one-time purchase of 99 SEK and grants lifetime access to unlocked code solutions, unlimited scans, and shorter wait times. Payments are processed by Stripe. Purchases are generally non-refundable once the license has been delivered, except where consumer law requires otherwise.',
      },
      {
        heading: 'Intellectual property',
        body: 'The SiteScanner Pro product, brand, and software are owned by nRn World. The project is released under CC BY-NC 4.0 for the public codebase; commercial use of the product beyond a personal Premium license requires written permission.',
      },
      {
        heading: 'Contact',
        body: 'Questions about these terms: bynrnworld@gmail.com',
      },
    ],
    privacy: [
      {
        heading: 'What we collect',
        body: 'Scanning does not require an account. The URL you submit is sent to our servers to fetch the public page and produce a report. Scan history is stored only in your browser. If you write to us via the contact form, we receive the name, email, subject, and message you provide.',
      },
      {
        heading: 'Payments',
        body: 'Premium payments are handled by Stripe. We store a license token in your browser after a successful checkout so we can verify Premium access. We do not store full card details.',
      },
      {
        heading: 'We do not sell data',
        body: 'We do not sell your data. We do not use advertising trackers. Server logs may include technical metadata (such as IP address and timestamp) needed to operate and protect the service.',
      },
      {
        heading: 'Your choices',
        body: 'You can clear scan history, language preference, and the Premium license token at any time from your browser storage. To request deletion of a contact-form message, email bynrnworld@gmail.com.',
      },
    ],
    cookies: [
      {
        heading: 'Essential storage only',
        body: 'SiteScanner Pro does not use advertising cookies. We use essential browser storage so the product works: language preference, local scan history, and (if you purchase Premium) a license token.',
      },
      {
        heading: 'Payments',
        body: 'When you check out, Stripe may set its own cookies on Stripe-hosted pages to process the payment securely. Those cookies are governed by Stripe’s policies.',
      },
      {
        heading: 'Control',
        body: 'You can delete stored data from your browser settings. Blocking all storage may prevent Premium from staying unlocked and will clear scan history.',
      },
    ],
  },
  ctaBand: {
    title: 'Unlock the exact fix — not just the diagnosis.',
    body: 'Premium is 99 kr, once. Lifetime access to code solutions, unlimited scans, and shorter waits.',
    button: 'Get Premium',
  },
  pages: {
    contactTitle: 'Contact',
    contactLead: 'Questions about a scan, Premium, or a partnership? Send a message — we read every one.',
    contactEmailLabel: 'Email',
    contactReply: 'We typically reply within one to two business days.',
  },
  preview: {
    sampleHost: 'your-site.com',
    issues: 'issues found',
    livePreview: 'Sample report',
  },
};

const sv: SiteCopy = {
  actions: {
    newScan: 'Ny skanning',
    copy: 'Kopiera',
    copied: 'Kopierad',
    codeExample: 'Kodexempel',
    menu: 'Meny',
    close: 'Stäng',
    goPro: 'Gå Pro',
    startFree: 'Starta en gratis skanning',
    skipToContent: 'Hoppa till innehållet',
  },
  trust: {
    anonymous: 'Anonym skanning',
    noInstall: 'Inget att installera',
    noAccount: 'Inget konto krävs',
    multilingual: '6 språk',
    lifetime: '99 kr · livstid, ingen prenumeration',
  },
  score: {
    excellent: 'Utmärkt',
    good: 'Bra',
    needsWork: 'Behöver arbete',
    poor: 'Kritiskt',
  },
  severity: { High: 'Hög', Medium: 'Medel', Low: 'Låg' },
  footer: {
    tagline: 'Tydliga, prioriterade hälsorapporter för webbplatser — så du vet exakt vad som ska åtgärdas.',
    product: 'Produkt',
    legal: 'Juridiskt',
    company: 'Företag',
    terms: 'Villkor',
    privacy: 'Integritet',
    cookies: 'Cookies',
    rights: 'Alla rättigheter förbehållna.',
    support: 'Support',
  },
  pricing: {
    eyebrow: 'Priser',
    title: 'Enkel prissättning. Ingen prenumeration.',
    subtitle: 'Börja gratis. Lås upp exakta kodfixar med ett engångsköp — ditt för livet.',
    popular: 'Mest vald',
    freeName: 'Gratis',
    freePrice: '0 kr',
    freeNote: 'För en första titt på sajtens hälsa',
    proName: 'Premium',
    proPrice: '99 kr',
    proNote: 'Engångsköp · livstidsåtkomst',
    ctaPro: 'Lås upp Premium',
    ctaFree: 'Skanna en webbplats',
    freeFeatures: [
      'Full hälsoskanning av webbplatsen',
      'Totalpoäng och fem kategorier',
      'Problemdetaljer och allvarlighetsgrad',
      'PDF-export',
      'Lokal skanningshistorik',
    ],
    proFeatures: [
      'Allt i Gratis',
      'Kompletta, färdiga kodfixar',
      'Obegränsade skanningar',
      'Snabbare skanningar med kortare väntetid',
      'Livstidsåtkomst — ingen förnyelse',
    ],
  },
  legal: {
    termsTitle: 'Användarvillkor',
    privacyTitle: 'Integritetspolicy',
    cookiesTitle: 'Cookiepolicy',
    updated: 'Senast uppdaterad: 26 augusti 2026',
    terms: [
      {
        heading: 'Tjänsten',
        body: 'SiteScanner Pro tillhandahåller automatiserad analys av publikt tillgängliga webbsidor. Rapporter täcker SEO, prestanda, säkerhet, tillgänglighet och kodkvalitet. Resultaten är en utgångspunkt och bör granskas av en kvalificerad utvecklare innan ändringar görs i produktion. En skanning är inte en fullständig säkerhets-, tillgänglighets-, juridisk eller prestandaaudit.',
      },
      {
        heading: 'Tillåten användning',
        body: 'Du får bara skanna webbplatser du äger eller har behörighet att granska. Tjänsten får inte användas för att störa, överbelasta eller försöka nå icke-publika system. Vi kan neka eller begränsa skanningar som verkar missbrukas.',
      },
      {
        heading: 'Premium',
        body: 'Premium är ett engångsköp på 99 kr och ger livstidsåtkomst till upplåsta kodlösningar, obegränsade skanningar och kortare väntetid. Betalningar hanteras av Stripe. Köp är i regel inte återbetalningsbara när licensen har levererats, utom när konsumentlag kräver annat.',
      },
      {
        heading: 'Immateriella rättigheter',
        body: 'Produkten, varumärket och mjukvaran tillhör nRn World. Den publika kodbasen släpps under CC BY-NC 4.0; kommersiell användning utöver en personlig Premium-licens kräver skriftligt tillstånd.',
      },
      {
        heading: 'Kontakt',
        body: 'Frågor om villkoren: bynrnworld@gmail.com',
      },
    ],
    privacy: [
      {
        heading: 'Vad vi samlar in',
        body: 'Skanning kräver inget konto. Webbaddressen du anger skickas till våra servrar för att hämta den publika sidan och skapa en rapport. Skanningshistorik sparas bara i din webbläsare. Om du skriver via kontaktformuläret tar vi emot namn, e-post, ämne och meddelande.',
      },
      {
        heading: 'Betalningar',
        body: 'Premiumbetalningar hanteras av Stripe. Efter ett lyckat köp sparas en licenstoken i din webbläsare så att vi kan verifiera Premium. Vi lagrar inte fullständiga kortuppgifter.',
      },
      {
        heading: 'Vi säljer inte data',
        body: 'Vi säljer inte dina uppgifter. Vi använder inga reklamspårare. Serverloggar kan innehålla teknisk metadata (till exempel IP-adress och tidsstämpel) som behövs för att driva och skydda tjänsten.',
      },
      {
        heading: 'Dina val',
        body: 'Du kan rensa skanningshistorik, språkval och Premium-token när som helst i webbläsarens lagring. För att begära radering av ett kontaktmeddelande, mejla bynrnworld@gmail.com.',
      },
    ],
    cookies: [
      {
        heading: 'Endast nödvändig lagring',
        body: 'SiteScanner Pro använder inga reklamcookies. Vi använder nödvändig webbläsarlagring så att produkten fungerar: språkval, lokal skanningshistorik och (om du köper Premium) en licenstoken.',
      },
      {
        heading: 'Betalningar',
        body: 'Vid kassan kan Stripe sätta egna cookies på Stripe-sidor för att genomföra betalningen säkert. De cookies lyder under Stripes policyer.',
      },
      {
        heading: 'Kontroll',
        body: 'Du kan radera lagrad data i webbläsarens inställningar. Att blockera all lagring kan göra att Premium inte förblir upplåst och rensar skanningshistoriken.',
      },
    ],
  },
  ctaBand: {
    title: 'Lås upp den exakta åtgärden — inte bara diagnosen.',
    body: 'Premium kostar 99 kr, en gång. Livstidsåtkomst till kodlösningar, obegränsade skanningar och kortare väntan.',
    button: 'Skaffa Premium',
  },
  pages: {
    contactTitle: 'Kontakt',
    contactLead: 'Frågor om en skanning, Premium eller ett samarbete? Skicka ett meddelande — vi läser alla.',
    contactEmailLabel: 'E-post',
    contactReply: 'Vi svarar vanligtvis inom en till två arbetsdagar.',
  },
  preview: {
    sampleHost: 'din-sajt.se',
    issues: 'problem hittade',
    livePreview: 'Exempelrapport',
  },
};

const tr: SiteCopy = {
  actions: {
    newScan: 'Yeni tarama',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    codeExample: 'Kod örneği',
    menu: 'Menü',
    close: 'Kapat',
    goPro: 'Pro’ya geç',
    startFree: 'Ücretsiz tarama başlat',
    skipToContent: 'İçeriğe geç',
  },
  trust: {
    anonymous: 'Anonim tarama',
    noInstall: 'Kurulum yok',
    noAccount: 'Hesap gerekmez',
    multilingual: '6 dil',
    lifetime: '99 kr · ömür boyu, abonelik yok',
  },
  score: {
    excellent: 'Mükemmel',
    good: 'İyi',
    needsWork: 'Geliştirilmeli',
    poor: 'Kritik',
  },
  severity: { High: 'Yüksek', Medium: 'Orta', Low: 'Düşük' },
  footer: {
    tagline: 'Net, önceliklendirilmiş site sağlığı raporları — neyi düzelteceğinizi tam olarak görün.',
    product: 'Ürün',
    legal: 'Yasal',
    company: 'Şirket',
    terms: 'Şartlar',
    privacy: 'Gizlilik',
    cookies: 'Çerezler',
    rights: 'Tüm hakları saklıdır.',
    support: 'Destek',
  },
  pricing: {
    eyebrow: 'Fiyatlandırma',
    title: 'Basit fiyat. Abonelik yok.',
    subtitle: 'Ücretsiz başlayın. Tek seferlik satın almayla tam kod düzeltmelerinin kilidini açın.',
    popular: 'En çok tercih edilen',
    freeName: 'Ücretsiz',
    freePrice: '0 kr',
    freeNote: 'Site sağlığına ilk bakış',
    proName: 'Premium',
    proPrice: '99 kr',
    proNote: 'Tek seferlik · ömür boyu erişim',
    ctaPro: 'Premium’u aç',
    ctaFree: 'Bir site tara',
    freeFeatures: [
      'Tam site sağlığı taraması',
      'Genel puan ve beş kategori',
      'Sorun ayrıntıları ve önem derecesi',
      'PDF dışa aktarma',
      'Yerel tarama geçmişi',
    ],
    proFeatures: [
      'Ücretsiz’deki her şey',
      'Hazır kod düzeltmeleri',
      'Sınırsız tarama',
      'Daha kısa beklemeyle daha hızlı taramalar',
      'Ömür boyu erişim — yenileme yok',
    ],
  },
  legal: {
    termsTitle: 'Kullanım şartları',
    privacyTitle: 'Gizlilik politikası',
    cookiesTitle: 'Çerez politikası',
    updated: 'Son güncelleme: 26 Ağustos 2026',
    terms: [
      { heading: 'Hizmet', body: 'SiteScanner Pro, herkese açık web sayfalarının otomatik analizini sunar. Raporlar SEO, performans, güvenlik, erişilebilirlik ve kod kalitesi sinyallerini kapsar. Sonuçlar bir başlangıç noktasıdır; üretim değişikliklerinden önce nitelikli bir geliştirici tarafından incelenmelidir.' },
      { heading: 'Kabul edilebilir kullanım', body: 'Yalnızca sahip olduğunuz veya değerlendirmekle yetkili olduğunuz siteleri tarayabilirsiniz. Hizmeti aksatmak, aşırı yüklemek veya herkese açık olmayan sistemlere erişmek için kullanamazsınız.' },
      { heading: 'Premium', body: 'Premium 99 SEK tutarında tek seferlik bir satın almadır ve kod çözümlerine, sınırsız taramaya ve daha kısa beklemeye ömür boyu erişim sağlar. Ödemeler Stripe tarafından işlenir.' },
      { heading: 'İletişim', body: 'Şartlarla ilgili sorular: bynrnworld@gmail.com' },
    ],
    privacy: [
      { heading: 'Topladıklarımız', body: 'Tarama için hesap gerekmez. Gönderdiğiniz URL, herkese açık sayfayı almak ve rapor üretmek üzere sunucularımıza iletilir. Tarama geçmişi yalnızca tarayıcınızda saklanır.' },
      { heading: 'Ödemeler', body: 'Premium ödemeleri Stripe tarafından işlenir. Kart bilgilerinizin tamamını saklamayız.' },
      { heading: 'Veri satmayız', body: 'Verilerinizi satmayız ve reklam izleyicileri kullanmayız.' },
    ],
    cookies: [
      { heading: 'Yalnızca gerekli depolama', body: 'Reklam çerezleri kullanmayız. Dil tercihi, yerel tarama geçmişi ve (Premium satın alırsanız) lisans jetonu için gerekli tarayıcı depolaması kullanırız.' },
      { heading: 'Ödemeler', body: 'Ödeme sırasında Stripe, kendi sayfalarında güvenlik amacıyla çerezler ayarlayabilir.' },
    ],
  },
  ctaBand: {
    title: 'Yalnızca teşhisi değil, tam düzeltmeyi açın.',
    body: 'Premium 99 kr, bir kez. Kod çözümlerine ömür boyu erişim, sınırsız tarama ve daha kısa bekleme.',
    button: 'Premium al',
  },
  pages: {
    contactTitle: 'İletişim',
    contactLead: 'Tarama, Premium veya iş birliği hakkında sorularınız mı var? Yazın — hepsini okuyoruz.',
    contactEmailLabel: 'E-posta',
    contactReply: 'Genellikle bir veya iki iş günü içinde yanıtlarız.',
  },
  preview: {
    sampleHost: 'siteniz.com',
    issues: 'sorun bulundu',
    livePreview: 'Örnek rapor',
  },
};

const es: SiteCopy = {
  actions: {
    newScan: 'Nuevo análisis',
    copy: 'Copiar',
    copied: 'Copiado',
    codeExample: 'Ejemplo de código',
    menu: 'Menú',
    close: 'Cerrar',
    goPro: 'Hazte Pro',
    startFree: 'Empezar un análisis gratis',
    skipToContent: 'Saltar al contenido',
  },
  trust: {
    anonymous: 'Análisis anónimo',
    noInstall: 'Nada que instalar',
    noAccount: 'Sin cuenta',
    multilingual: '6 idiomas',
    lifetime: '99 kr · de por vida, sin suscripción',
  },
  score: {
    excellent: 'Excelente',
    good: 'Bien',
    needsWork: 'Mejorable',
    poor: 'Crítico',
  },
  severity: { High: 'Alta', Medium: 'Media', Low: 'Baja' },
  footer: {
    tagline: 'Informes claros y priorizados de salud web — para saber exactamente qué corregir.',
    product: 'Producto',
    legal: 'Legal',
    company: 'Empresa',
    terms: 'Términos',
    privacy: 'Privacidad',
    cookies: 'Cookies',
    rights: 'Todos los derechos reservados.',
    support: 'Soporte',
  },
  pricing: {
    eyebrow: 'Precios',
    title: 'Precio simple. Sin suscripción.',
    subtitle: 'Empieza gratis. Desbloquea correcciones de código exactas con un pago único.',
    popular: 'Más popular',
    freeName: 'Gratis',
    freePrice: '0 kr',
    freeNote: 'Una primera mirada a la salud del sitio',
    proName: 'Premium',
    proPrice: '99 kr',
    proNote: 'Pago único · acceso de por vida',
    ctaPro: 'Desbloquear Premium',
    ctaFree: 'Analizar un sitio',
    freeFeatures: [
      'Análisis completo de salud del sitio',
      'Puntuación global y cinco categorías',
      'Detalles e importancia de cada problema',
      'Exportar a PDF',
      'Historial local de análisis',
    ],
    proFeatures: [
      'Todo lo de Gratis',
      'Correcciones de código listas para usar',
      'Análisis ilimitados',
      'Análisis más rápidos, con menos espera',
      'Acceso de por vida — sin renovación',
    ],
  },
  legal: {
    termsTitle: 'Términos de uso',
    privacyTitle: 'Política de privacidad',
    cookiesTitle: 'Política de cookies',
    updated: 'Última actualización: 26 de agosto de 2026',
    terms: [
      { heading: 'El servicio', body: 'SiteScanner Pro ofrece análisis automatizado de páginas web de acceso público. Los informes cubren SEO, rendimiento, seguridad, accesibilidad y calidad del código. Los resultados son un punto de partida y deben ser revisados por un desarrollador cualificado.' },
      { heading: 'Uso aceptable', body: 'Solo puedes analizar sitios que poseas o estés autorizado a evaluar. No uses el servicio para saturar o acceder a sistemas no públicos.' },
      { heading: 'Premium', body: 'Premium es una compra única de 99 SEK con acceso de por vida a soluciones de código, análisis ilimitados y menor tiempo de espera. Los pagos los procesa Stripe.' },
      { heading: 'Contacto', body: 'Preguntas sobre estos términos: bynrnworld@gmail.com' },
    ],
    privacy: [
      { heading: 'Qué recopilamos', body: 'El análisis no requiere cuenta. La URL se envía a nuestros servidores para generar el informe. El historial se guarda solo en tu navegador.' },
      { heading: 'Pagos', body: 'Los pagos Premium los gestiona Stripe. No almacenamos los datos completos de la tarjeta.' },
      { heading: 'No vendemos datos', body: 'No vendemos tus datos ni usamos rastreadores publicitarios.' },
    ],
    cookies: [
      { heading: 'Solo almacenamiento esencial', body: 'No usamos cookies publicitarias. Guardamos el idioma, el historial local y (si compras Premium) un token de licencia.' },
      { heading: 'Pagos', body: 'Stripe puede establecer cookies en sus propias páginas durante el pago.' },
    ],
  },
  ctaBand: {
    title: 'Desbloquea la corrección exacta, no solo el diagnóstico.',
    body: 'Premium cuesta 99 kr, una sola vez. Acceso de por vida a soluciones de código, análisis ilimitados y menos espera.',
    button: 'Obtener Premium',
  },
  pages: {
    contactTitle: 'Contacto',
    contactLead: '¿Dudas sobre un análisis, Premium o una colaboración? Escríbenos — leemos todos los mensajes.',
    contactEmailLabel: 'Correo',
    contactReply: 'Solemos responder en uno o dos días laborables.',
  },
  preview: {
    sampleHost: 'tu-sitio.com',
    issues: 'problemas encontrados',
    livePreview: 'Informe de ejemplo',
  },
};

const fr: SiteCopy = {
  actions: {
    newScan: 'Nouvelle analyse',
    copy: 'Copier',
    copied: 'Copié',
    codeExample: 'Exemple de code',
    menu: 'Menu',
    close: 'Fermer',
    goPro: 'Passer Pro',
    startFree: 'Lancer une analyse gratuite',
    skipToContent: 'Aller au contenu',
  },
  trust: {
    anonymous: 'Analyse anonyme',
    noInstall: 'Rien à installer',
    noAccount: 'Sans compte',
    multilingual: '6 langues',
    lifetime: '99 kr · à vie, sans abonnement',
  },
  score: {
    excellent: 'Excellent',
    good: 'Bon',
    needsWork: 'À améliorer',
    poor: 'Critique',
  },
  severity: { High: 'Élevée', Medium: 'Moyenne', Low: 'Faible' },
  footer: {
    tagline: 'Des rapports clairs et priorisés sur la santé de votre site — pour savoir exactement quoi corriger.',
    product: 'Produit',
    legal: 'Mentions',
    company: 'Entreprise',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    cookies: 'Cookies',
    rights: 'Tous droits réservés.',
    support: 'Support',
  },
  pricing: {
    eyebrow: 'Tarifs',
    title: 'Un tarif simple. Sans abonnement.',
    subtitle: 'Commencez gratuitement. Débloquez les correctifs exacts avec un achat unique.',
    popular: 'Le plus choisi',
    freeName: 'Gratuit',
    freePrice: '0 kr',
    freeNote: 'Un premier regard sur la santé du site',
    proName: 'Premium',
    proPrice: '99 kr',
    proNote: 'Achat unique · accès à vie',
    ctaPro: 'Débloquer Premium',
    ctaFree: 'Analyser un site',
    freeFeatures: [
      'Analyse complète de la santé du site',
      'Score global et cinq catégories',
      'Détail et gravité des problèmes',
      'Export PDF',
      'Historique local des analyses',
    ],
    proFeatures: [
      'Tout le plan Gratuit',
      'Correctifs prêts à l’emploi',
      'Analyses illimitées',
      'Analyses plus rapides, attente réduite',
      'Accès à vie — sans renouvellement',
    ],
  },
  legal: {
    termsTitle: 'Conditions d’utilisation',
    privacyTitle: 'Politique de confidentialité',
    cookiesTitle: 'Politique relative aux cookies',
    updated: 'Dernière mise à jour : 26 août 2026',
    terms: [
      { heading: 'Le service', body: 'SiteScanner Pro fournit une analyse automatisée de pages web publiquement accessibles. Les rapports couvrent le SEO, les performances, la sécurité, l’accessibilité et la qualité du code. Les résultats sont un point de départ et doivent être relus par un développeur qualifié.' },
      { heading: 'Usage acceptable', body: 'Vous ne pouvez analyser que des sites que vous possédez ou êtes autorisé à évaluer. Le service ne doit pas servir à saturer ou à accéder à des systèmes non publics.' },
      { heading: 'Premium', body: 'Premium est un achat unique de 99 SEK donnant un accès à vie aux solutions de code, aux analyses illimitées et à un temps d’attente réduit. Les paiements sont traités par Stripe.' },
      { heading: 'Contact', body: 'Questions sur ces conditions : bynrnworld@gmail.com' },
    ],
    privacy: [
      { heading: 'Ce que nous collectons', body: 'L’analyse ne nécessite pas de compte. L’URL est envoyée à nos serveurs pour produire le rapport. L’historique est stocké uniquement dans votre navigateur.' },
      { heading: 'Paiements', body: 'Les paiements Premium sont gérés par Stripe. Nous ne stockons pas les données complètes de carte.' },
      { heading: 'Nous ne vendons pas les données', body: 'Nous ne vendons pas vos données et n’utilisons pas de trackers publicitaires.' },
    ],
    cookies: [
      { heading: 'Stockage essentiel uniquement', body: 'Pas de cookies publicitaires. Nous utilisons le stockage du navigateur pour la langue, l’historique local et (si vous achetez Premium) un jeton de licence.' },
      { heading: 'Paiements', body: 'Stripe peut déposer ses propres cookies sur ses pages lors du paiement.' },
    ],
  },
  ctaBand: {
    title: 'Débloquez le correctif exact, pas seulement le diagnostic.',
    body: 'Premium coûte 99 kr, une seule fois. Accès à vie aux solutions de code, analyses illimitées et attente réduite.',
    button: 'Obtenir Premium',
  },
  pages: {
    contactTitle: 'Contact',
    contactLead: 'Une question sur une analyse, Premium ou un partenariat ? Écrivez-nous — nous lisons chaque message.',
    contactEmailLabel: 'E-mail',
    contactReply: 'Nous répondons en général sous un à deux jours ouvrés.',
  },
  preview: {
    sampleHost: 'votre-site.fr',
    issues: 'problèmes trouvés',
    livePreview: 'Rapport d’exemple',
  },
};

const ar: SiteCopy = {
  actions: {
    newScan: 'فحص جديد',
    copy: 'نسخ',
    copied: 'تم النسخ',
    codeExample: 'مثال على الكود',
    menu: 'القائمة',
    close: 'إغلاق',
    goPro: 'الترقية إلى Pro',
    startFree: 'ابدأ فحصًا مجانيًا',
    skipToContent: 'تخطي إلى المحتوى',
  },
  trust: {
    anonymous: 'فحص مجهول',
    noInstall: 'بدون تثبيت',
    noAccount: 'بدون حساب',
    multilingual: '6 لغات',
    lifetime: '99 كرونة · مدى الحياة، بدون اشتراك',
  },
  score: {
    excellent: 'ممتاز',
    good: 'جيد',
    needsWork: 'يحتاج تحسينًا',
    poor: 'حرج',
  },
  severity: { High: 'مرتفع', Medium: 'متوسط', Low: 'منخفض' },
  footer: {
    tagline: 'تقارير واضحة ومرتبة حسب الأولوية لصحة موقعك — لتعرف تمامًا ما الذي يجب إصلاحه.',
    product: 'المنتج',
    legal: 'قانوني',
    company: 'الشركة',
    terms: 'الشروط',
    privacy: 'الخصوصية',
    cookies: 'ملفات الارتباط',
    rights: 'جميع الحقوق محفوظة.',
    support: 'الدعم',
  },
  pricing: {
    eyebrow: 'الأسعار',
    title: 'سعر بسيط. بدون اشتراك.',
    subtitle: 'ابدأ مجانًا. افتح إصلاحات الكود الدقيقة بشراء لمرة واحدة.',
    popular: 'الأكثر اختيارًا',
    freeName: 'مجاني',
    freePrice: '0 kr',
    freeNote: 'نظرة أولى على صحة الموقع',
    proName: 'Premium',
    proPrice: '99 kr',
    proNote: 'شراء لمرة واحدة · وصول مدى الحياة',
    ctaPro: 'فتح Premium',
    ctaFree: 'افحص موقعًا',
    freeFeatures: [
      'فحص كامل لصحة الموقع',
      'النتيجة الإجمالية وخمس فئات',
      'تفاصيل المشكلات ودرجة الخطورة',
      'تصدير PDF',
      'سجل فحوصات محلي',
    ],
    proFeatures: [
      'كل ما في الخطة المجانية',
      'إصلاحات كود جاهزة للاستخدام',
      'فحوصات غير محدودة',
      'فحوصات أسرع وانتظار أقصر',
      'وصول مدى الحياة — بلا تجديد',
    ],
  },
  legal: {
    termsTitle: 'شروط الاستخدام',
    privacyTitle: 'سياسة الخصوصية',
    cookiesTitle: 'سياسة ملفات الارتباط',
    updated: 'آخر تحديث: 26 أغسطس 2026',
    terms: [
      { heading: 'الخدمة', body: 'يقدّم SiteScanner Pro تحليلًا آليًا للصفحات المتاحة للعموم. تغطي التقارير إشارات SEO والأداء والأمان وإمكانية الوصول وجودة الكود. النتائج نقطة انطلاق ويجب مراجعتها من مطوّر مؤهل.' },
      { heading: 'الاستخدام المقبول', body: 'يجوز فحص المواقع التي تملكها أو المخوّل لك تقييمها فقط. لا تستخدم الخدمة لإعاقة الأنظمة أو الوصول إلى موارد غير عامة.' },
      { heading: 'Premium', body: 'Premium شراء لمرة واحدة بقيمة 99 كرونة سويدية يمنح وصولًا مدى الحياة إلى حلول الكود والفحوصات غير المحدودة وانتظار أقصر. تُعالج المدفوعات عبر Stripe.' },
      { heading: 'التواصل', body: 'أسئلة حول هذه الشروط: bynrnworld@gmail.com' },
    ],
    privacy: [
      { heading: 'ما نجمعه', body: 'لا يتطلب الفحص حسابًا. يُرسل العنوان إلى خوادمنا لجلب الصفحة العامة وإصدار التقرير. يُحفظ السجل في متصفحك فقط.' },
      { heading: 'المدفوعات', body: 'تتولى Stripe مدفوعات Premium. لا نخزّن بيانات البطاقة الكاملة.' },
      { heading: 'لا نبيع البيانات', body: 'لا نبيع بياناتك ولا نستخدم متعقّبات إعلانية.' },
    ],
    cookies: [
      { heading: 'تخزين ضروري فقط', body: 'لا نستخدم ملفات ارتباط إعلانية. نستخدم تخزين المتصفح للغة وسجل الفحص و(عند شراء Premium) رمز الترخيص.' },
      { heading: 'المدفوعات', body: 'قد تضع Stripe ملفات ارتباط على صفحاتها أثناء الدفع.' },
    ],
  },
  ctaBand: {
    title: 'افتح الإصلاح الدقيق — لا التشخيص فقط.',
    body: 'Premium مقابل 99 كرونة مرة واحدة. وصول مدى الحياة إلى حلول الكود وفحوصات غير محدودة وانتظار أقصر.',
    button: 'احصل على Premium',
  },
  pages: {
    contactTitle: 'اتصل بنا',
    contactLead: 'أسئلة حول فحص أو Premium أو شراكة؟ أرسل رسالة — نقرأ جميع الرسائل.',
    contactEmailLabel: 'البريد الإلكتروني',
    contactReply: 'نرد عادةً خلال يوم إلى يومي عمل.',
  },
  preview: {
    sampleHost: 'موقعك.com',
    issues: 'مشكلات مكتشفة',
    livePreview: 'تقرير نموذجي',
  },
};

export const siteCopy: Record<'en' | 'sv' | 'tr' | 'es' | 'fr' | 'ar', SiteCopy> = {
  en,
  sv,
  tr,
  es,
  fr,
  ar,
};
