/**
 * FAS 2.4: Post-build-prerendering.
 * Fyller dist/index.html med statiska meta-taggar (title, description, OG,
 * Twitter, hreflang, canonical, JSON-LD) och en HTML-skeleton så sökrobotar
 * får innehåll direkt. Fungerar med GitHub Pages + VITE_PUBLIC_BASE.
 *
 * Körs automatiskt efter `vite build` via npm-postskriptet.
 */
import fs from 'fs';
import path from 'path';

const DIST = path.join(process.cwd(), 'dist');
const INDEX = path.join(DIST, 'index.html');

const PUBLIC_BASE = (process.env.VITE_PUBLIC_BASE || '/').replace(/\/$/, '');
const API_BASE = (process.env.VITE_API_BASE || '').replace(/\/$/, '');

const SITE_URL = 'https://nrn-world.github.io/SiteScannerPro';
const LANGUAGES = ['en', 'sv', 'tr', 'es', 'fr', 'ar'];

const DESCRIPTION =
  'Analyze any public website across SEO, performance, security, accessibility, and code quality — in seconds. Free health scan, Pro unlocks exact code fixes.';
const TITLE = 'SiteScanner Pro | Website Health Analysis';
const OG_IMAGE = `${SITE_URL}/og-image.svg`;

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SiteScanner Pro',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description: DESCRIPTION,
  offers: {
    '@type': 'Offer',
    price: '10.99',
    priceCurrency: 'EUR'
  }
};

function prerender() {
  if (!fs.existsSync(INDEX)) {
    console.error('[prerender] dist/index.html saknas – kör vite build först.');
    process.exit(1);
  }

  let html = fs.readFileSync(INDEX, 'utf8');

  const canonical = `${SITE_URL}/`;
  const hreflangTags = LANGUAGES.map(
    (lang) => `<link rel="alternate" hreflang="${lang}" href="${SITE_URL}/?lang=${lang}" />`
  ).join('\n    ');

  const metaTags = `
    <meta name="description" content="${DESCRIPTION}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SiteScanner Pro" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    ${hreflangTags}
    <link rel="alternate" hreflang="x-default" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="${PUBLIC_BASE}/favicon.svg" />
    <link rel="manifest" href="${PUBLIC_BASE}/site.webmanifest" />
    <meta name="theme-color" content="#FF4E00" />
    <script type="application/ld+json">${JSON.stringify(JSON_LD)}</script>`;

  // Sätt in efter <title> i head
  if (html.includes('</title>')) {
    html = html.replace('</title>', `</title>\n    ${metaTags}`);
  } else if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n    ${metaTags}`);
  }

  // Skeleton så robotar ser innehåll innan React hydrerar (överskrivs vid mount)
  const skeleton = `
    <noscript>
      <div style="max-width:720px;margin:80px auto;padding:0 24px;font-family:monospace">
        <h1>SiteScanner Pro – See what is holding your website back</h1>
        <p>${DESCRIPTION}</p>
        <p>Enable JavaScript to run a live scan, or read more at the site.</p>
      </div>
    </noscript>
    <div id="root">
      <main style="max-width:880px;margin:0 auto;padding:64px 24px;font-family:Arial,sans-serif;color:#0A0A0A">
        <h1 style="font-size:44px;line-height:1.1;margin:0 0 16px">Analyze. <span style="color:#FF4E00">Secure.</span> Optimize.</h1>
        <p style="font-size:18px;color:#6B6B66">${DESCRIPTION}</p>
        <p style="font-size:14px;color:#6B6B66">Loading the scanner…</p>
      </main>
    </div>`;

  if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', skeleton);
  }

  fs.writeFileSync(INDEX, html, 'utf8');
  console.log(`[prerender] ${INDEX} uppdaterad med statiska meta + skeleton.`);
}

prerender();
