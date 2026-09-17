import type { Language } from './translations';
import type { ScannerIssue } from '../rules/types';

type Params = Record<string, string | number | undefined>;

type MsgBag = {
  title: string;
  description: string;
  recommendation: string;
};

/** Stable ids for scan findings – used for i18n */
export type ScanIssueId = string;

const en: Record<string, MsgBag> = {
  'seo.title.missing': {
    title: 'Missing title tag',
    description: 'The page has no <title> tag, which is critical for search engines.',
    recommendation: 'Add a descriptive <title> in <head>.'
  },
  'seo.meta.missing': {
    title: 'Missing meta description',
    description: 'The page is missing a meta description.',
    recommendation: 'Add <meta name="description" content="...">.'
  },
  'seo.h1.missing': {
    title: 'Missing H1 heading',
    description: 'The page has no main heading (H1).',
    recommendation: 'Make sure every page has exactly one H1 heading.'
  },
  'seo.title.short': {
    title: 'Title too short',
    description: 'The title tag is only {len} characters. Google often shows 50–60 characters.',
    recommendation: 'Expand the title with a primary keyword and brand (about 50–60 characters).'
  },
  'seo.title.long': {
    title: 'Title too long',
    description: 'The title tag is {len} characters and may be truncated in search results.',
    recommendation: 'Shorten the title to max 60 characters with the most important words first.'
  },
  'seo.meta.short': {
    title: 'Short meta description',
    description: 'Meta description is {len} characters. Recommended: 120–160.',
    recommendation: 'Write a compelling description of 120–160 characters with a primary keyword.'
  },
  'seo.meta.long': {
    title: 'Meta description too long',
    description: 'Meta description is {len} characters and may be cut off in Google.',
    recommendation: 'Shorten it to max 160 characters.'
  },
  'seo.h1.multiple': {
    title: 'Multiple H1 headings',
    description: 'The page has {count} H1 tags. Best practice is exactly one per page.',
    recommendation: 'Keep one H1 as the main heading and change the others to H2/H3.'
  },
  'seo.viewport.missing': {
    title: 'Missing viewport meta',
    description: 'The page lacks the viewport tag required for mobile layout.',
    recommendation: 'Add viewport meta in <head> for responsive design.'
  },
  'seo.canonical.missing': {
    title: 'Missing canonical URL',
    description: 'No canonical link was found. This can cause duplicate content in Google.',
    recommendation: 'Add <link rel="canonical" href="..."> with the preferred URL.'
  },
  'seo.og.title.missing': {
    title: 'Missing Open Graph title',
    description: 'og:title is missing – social shares get a weaker preview.',
    recommendation: 'Add Open Graph tags for title, description and image.'
  },
  'seo.og.image.missing': {
    title: 'Missing share image (og:image)',
    description: 'No og:image – links shared on Facebook/LinkedIn lack an image.',
    recommendation: 'Add an image of at least 1200×630 px as og:image.'
  },
  'seo.structured.missing': {
    title: 'No structured data',
    description: 'The page lacks JSON-LD or microdata for rich results in Google.',
    recommendation: 'Add schema.org JSON-LD (e.g. Organization, WebSite, Article).'
  },
  'seo.robots.noindex': {
    title: 'Page is noindex',
    description: 'meta robots contains "noindex" – the page will not be indexed by Google.',
    recommendation: 'Remove noindex if the page should appear in search results.'
  },
  'seo.favicon.missing': {
    title: 'Missing favicon',
    description: 'No favicon found – the page looks unprofessional in tabs and bookmarks.',
    recommendation: 'Add a favicon (32×32 or SVG).'
  },
  'seo.external.noopener': {
    title: 'Unsafe external links',
    description: '{count} links with target="_blank" lack rel="noopener".',
    recommendation: 'Add rel="noopener noreferrer" on all external links.'
  },
  'seo.sitemap.missing': {
    title: 'No sitemap found',
    description: 'Neither /sitemap.xml nor a robots.txt sitemap reference was found.',
    recommendation: 'Create a sitemap.xml and reference it in robots.txt.'
  },
  'seo.manifest.missing': {
    title: 'Missing web app manifest',
    description: 'No manifest.json – PWA features and “Add to home screen” are missing.',
    recommendation: 'Create manifest.json and link it with <link rel="manifest" href="/manifest.json">.'
  },
  'seo.links.broken': {
    title: 'Broken links found',
    description: '{broken} of {sample} tested links returned errors ({samples}).',
    recommendation: 'Fix or remove broken links – they hurt SEO and UX.'
  },
  'seo.meta.refresh': {
    title: 'Meta refresh redirect',
    description: 'The page uses meta refresh ({content}) – bad for SEO and accessibility.',
    recommendation: 'Use HTTP 301/302 redirects instead of meta refresh.'
  },
  'seo.jsonld.invalid': {
    title: 'Invalid structured data (JSON-LD)',
    description: '{count} JSON-LD blocks could not be parsed ({error}). Google ignores broken structured data.',
    recommendation: 'Validate JSON-LD with Google Rich Results Test and fix syntax errors.'
  },
  'seo.twitter.missing': {
    title: 'Missing Twitter Card tags',
    description: 'Open Graph exists but Twitter Card meta is missing – shares on X/Twitter may look worse.',
    recommendation: 'Add twitter:card, twitter:title and twitter:image.'
  },
  'seo.robots.disallow': {
    title: 'robots.txt blocks the entire site',
    description: 'robots.txt has Disallow: / for all user-agents – search engines will not index the content.',
    recommendation: 'Adjust robots.txt if the site should appear in search results.'
  },
  'seo.hreflang.missing': {
    title: 'Multiple languages without hreflang',
    description: 'The page mixes language markers ({langs}) but has no hreflang links.',
    recommendation: 'Add <link rel="alternate" hreflang="..."> for each language version.'
  },
  'perf.load.slow': {
    title: 'Slow response time',
    description: 'The server took {ms}ms to respond.',
    recommendation: 'Optimize the server, use caching, or a CDN.'
  },
  'perf.load.medium': {
    title: 'Somewhat slow response time',
    description: 'The server took {ms}ms to respond.',
    recommendation: 'Optimize TTFB (Time to First Byte).'
  },
  'perf.ttfb.high': {
    title: 'Slow TTFB (Time to First Byte)',
    description: 'The server responded in {ms}ms before content started delivering.',
    recommendation: 'Optimize server, database and caching. Target: under 800ms TTFB.'
  },
  'perf.ttfb.medium': {
    title: 'TTFB can be improved',
    description: 'TTFB is {ms}ms. Google recommends under 800ms.',
    recommendation: 'Enable server-side caching and a CDN for static assets.'
  },
  'perf.html.large': {
    title: 'Large HTML page',
    description: 'The HTML document is ~{kb} KB. Large pages increase load and parse time.',
    recommendation: 'Reduce unnecessary markup, split content and lazy-load sections.'
  },
  'perf.dom.large': {
    title: 'Too many DOM elements',
    description: 'The page has {nodes} DOM nodes. Recommended: under 1500 nodes.',
    recommendation: 'Simplify markup, avoid unnecessary wrapper divs and virtualize long lists.'
  },
  'perf.scripts.many': {
    title: 'Many JavaScript files',
    description: '{scripts} external script tags ({external} third-party). Each file blocks or delays rendering.',
    recommendation: 'Bundle scripts, remove unused libraries and load third-party asynchronously.'
  },
  'perf.images.lazy': {
    title: 'Images without lazy loading',
    description: '{count} images lack loading="lazy" – all load immediately.',
    recommendation: 'Add loading="lazy" on below-the-fold images.'
  },
  'perf.images.dimensions': {
    title: 'Images without dimensions (CLS risk)',
    description: '{count} images lack width/height – causes layout shift (CLS).',
    recommendation: 'Set width and height on all img tags or use aspect-ratio in CSS.'
  },
  'perf.css.blocking': {
    title: 'Many render-blocking CSS files',
    description: '{count} stylesheet links in <head> block first paint.',
    recommendation: 'Combine CSS files, inline critical CSS and load the rest asynchronously.'
  },
  'perf.fonts.preconnect': {
    title: 'Missing preconnect for webfonts',
    description: 'Google Fonts is used without preconnect – extra DNS/TLS delay.',
    recommendation: 'Add preconnect to fonts.googleapis.com and fonts.gstatic.com.'
  },
  'perf.compression.missing': {
    title: 'No text compression',
    description: 'The response lacks gzip/brotli compression – HTML is delivered uncompressed.',
    recommendation: 'Enable gzip or Brotli on the web server for HTML, CSS and JS.'
  },
  'perf.cache.missing': {
    title: 'Missing cache policy',
    description: 'The HTML response lacks a Cache-Control header – repeat loads are slower.',
    recommendation: 'Set Cache-Control with a sensible max-age for static assets.'
  },
  'perf.images.legacy': {
    title: 'Legacy image formats used',
    description: '{count} images use JPEG/PNG instead of WebP/AVIF – larger files and slower loading.',
    recommendation: 'Convert images to WebP or AVIF and use <picture> for fallback.'
  },
  'perf.assets.broken': {
    title: 'Broken CSS/JS resources',
    description: '{count} stylesheet or script files returned errors.',
    recommendation: 'Fix missing or incorrect resource URLs – they break layout and functionality.'
  },
  'perf.inline.large': {
    title: 'Large inline scripts',
    description: '{count} inline scripts are over 20 KB (largest ~{maxKb} KB) – increases HTML size and blocks caching.',
    recommendation: 'Move large scripts to external files with defer/async and long cache.'
  },
  'perf.base64.large': {
    title: 'Large base64 images in HTML',
    description: '{count} inline base64 images (~{kb} KB) bloat HTML and prevent browser caching.',
    recommendation: 'Use external image files (WebP/AVIF) instead of data URIs for large images.'
  },
  'perf.network.failed': {
    title: 'Failed network resources (HTTP {status}){suffix}',
    description: '{count} resources responded with {status}: {samples}.',
    recommendation: 'Fix missing or broken CSS/JS/image/API calls shown in the Network tab.'
  },
  'perf.network.incomplete': {
    title: 'Network requests that never completed{suffix}',
    description: '{count} resources failed completely (timeout/CORS/DNS): {samples}.',
    recommendation: 'Check CORS, DNS and that resource URLs are correct.'
  },
  'sec.https.missing': {
    title: 'Unencrypted connection',
    description: 'The page uses HTTP instead of HTTPS.',
    recommendation: 'Install an SSL certificate and force HTTPS.'
  },
  'sec.hsts.missing': {
    title: 'Missing HSTS header',
    description: 'The page does not force browsers to use HTTPS (HSTS).',
    recommendation: 'Add Strict-Transport-Security to the server headers.'
  },
  'sec.clickjacking': {
    title: 'Clickjacking risk',
    description: 'The page lacks protection against being embedded in iframes.',
    recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN.'
  },
  'sec.xcto.missing': {
    title: 'Missing X-Content-Type-Options',
    description: 'The X-Content-Type-Options header is missing – increases MIME sniffing risk.',
    recommendation: 'Add X-Content-Type-Options: nosniff on all responses.'
  },
  'sec.referrer.missing': {
    title: 'Missing Referrer-Policy',
    description: 'No Referrer-Policy – URLs may leak to third parties.',
    recommendation: 'Set Referrer-Policy: strict-origin-when-cross-origin.'
  },
  'sec.csp.missing': {
    title: 'No Content-Security-Policy',
    description: 'CSP is missing – the page has weaker protection against XSS attacks.',
    recommendation: 'Implement a CSP header that restricts script and style sources.'
  },
  'sec.permissions.missing': {
    title: 'Missing Permissions-Policy',
    description: 'No Permissions-Policy – browser features (camera, mic) are undefined.',
    recommendation: 'Restrict unnecessary APIs with Permissions-Policy.'
  },
  'sec.mixed.content': {
    title: 'Mixed content (HTTP on HTTPS page)',
    description: '{count}+ resources load over insecure HTTP on an HTTPS page.',
    recommendation: 'Change all http:// URLs to https:// or use protocol-relative links.'
  },
  'sec.server.exposure': {
    title: 'Server information exposed',
    description: 'Headers reveal the tech stack: {info}.',
    recommendation: 'Remove or mask Server and X-Powered-By headers.'
  },
  'sec.sri.missing': {
    title: 'CDN resources without Subresource Integrity',
    description: '{count} external CDN scripts/stylesheets lack an integrity attribute – risk if the CDN is compromised.',
    recommendation: 'Add integrity and crossorigin on CDN resources.'
  },
  'sec.js.dangerous': {
    title: 'Risky JavaScript patterns in source',
    description: 'Found potentially unsafe patterns: {findings}. These increase XSS risk.',
    recommendation: 'Avoid eval/Function, sanitize before innerHTML and prefer textContent.'
  },
  'sec.secrets': {
    title: 'Possible secrets in page source',
    description: 'Patterns resembling secrets were found: {findings}. If real keys, rotate them immediately.',
    recommendation: 'Move keys to server environment variables. Never expose private API keys in the frontend.'
  },
  'sec.password.autocomplete': {
    title: 'Password fields without correct autocomplete',
    description: '{count} password fields lack autocomplete="current-password" or "new-password".',
    recommendation: 'Set autocomplete on password fields so password managers work safely.'
  },
  'sec.comments.sensitive': {
    title: 'Sensitive HTML comments',
    description: '{count} comments mention passwords, keys or similar – visible in page source.',
    recommendation: 'Remove sensitive comments from production HTML.'
  },
  'sec.cookies.flags': {
    title: 'Insecure cookie flags',
    description: 'Set-Cookie is missing important flags: {problems}.',
    recommendation: 'Set Secure; HttpOnly; SameSite=Lax (or Strict) on session cookies.'
  },
  'sec.forms.http': {
    title: 'Sensitive forms over HTTP',
    description: 'Password or payment fields are submitted over unencrypted HTTP.',
    recommendation: 'Force HTTPS before users can submit sensitive data.'
  },
  'a11y.alt.missing': {
    title: 'Missing alt texts',
    description: '{count} images lack an alt attribute.',
    recommendation: 'Add descriptive alt texts on all images for screen readers.'
  },
  'a11y.lang.missing': {
    title: 'Missing language attribute',
    description: 'The HTML tag lacks a lang attribute.',
    recommendation: 'Add lang="en" (or the current language) on the <html> tag.'
  },
  'a11y.form.labels': {
    title: 'Form fields without labels',
    description: '{count} fields lack an associated <label> or aria-label.',
    recommendation: 'Connect each field to a <label for="id"> or aria-label.'
  },
  'a11y.button.name': {
    title: 'Buttons without accessible name',
    description: '{count} buttons lack visible text or aria-label.',
    recommendation: 'Add descriptive text or aria-label on all buttons.'
  },
  'a11y.skip.missing': {
    title: 'Missing skip link',
    description: 'No “skip to content” link for keyboard users.',
    recommendation: 'Add a hidden skip link as the first focusable element.'
  },
  'a11y.links.empty': {
    title: 'Empty links',
    description: '{count} links lack visible text – screen readers cannot describe them.',
    recommendation: 'Add descriptive link text or aria-label.'
  },
  'a11y.heading.hierarchy': {
    title: 'Broken heading hierarchy',
    description: 'Heading level jumps from H{from} to H{to} – hard for screen readers to navigate.',
    recommendation: 'Use sequential heading levels (H1 → H2 → H3) without skipping levels.'
  },
  'a11y.iframe.title': {
    title: 'Iframes without title',
    description: '{count} iframe(s) lack title or aria-label.',
    recommendation: 'Add a descriptive title on all embedded iframes.'
  },
  'a11y.heading.empty': {
    title: 'Empty headings',
    description: '{count} heading tags lack text content.',
    recommendation: 'Fill in meaningful heading text or remove empty heading elements.'
  },
  'a11y.links.generic': {
    title: 'Generic link text',
    description: '{count} links use unclear text like “click here” / “read more” – screen readers get no context.',
    recommendation: 'Use descriptive link text that explains the destination.'
  },
  'a11y.table.headers': {
    title: 'Tables without header cells',
    description: '{count} data tables lack <th> or scope – hard for screen readers to interpret.',
    recommendation: 'Use <th scope="col|row"> for table headers.'
  },
  'a11y.media.captions': {
    title: 'Media without captions',
    description: '{count} video/audio elements lack <track kind="captions">.',
    recommendation: 'Add captions via a WebVTT track for accessibility.'
  },
  'a11y.tabindex.positive': {
    title: 'Positive tabindex used',
    description: '{count} elements have tabindex > 0 which disrupts natural tab order.',
    recommendation: 'Use tabindex="0" or "-1", and rely on DOM order for focus.'
  },
  'a11y.main.missing': {
    title: 'Missing main landmark',
    description: 'The page lacks <main> or role="main" – screen reader users struggle to jump to content.',
    recommendation: 'Wrap the main content in <main>.'
  },
  'a11y.placeholder.only': {
    title: 'Placeholder used as label',
    description: '{count} fields rely only on placeholder – it disappears on input and is inaccessible.',
    recommendation: 'Use a visible <label> in addition to any placeholder.'
  },
  'a11y.noscript.missing': {
    title: 'Missing noscript fallback',
    description: 'Many scripts load but there is no <noscript> – users without JS get no guidance.',
    recommendation: 'Add a <noscript> section with basic content or instructions.'
  },
  'a11y.axe.fix': {
    title: '{title}',
    description: '{description}',
    recommendation: 'Fix according to WCAG: {url}'
  },
  'code.inline.style': {
    title: 'Inline CSS used',
    description: 'Found {count} elements with inline styles. This makes code harder to maintain.',
    recommendation: 'Move all styling to external CSS files.'
  },
  'code.deprecated.tags': {
    title: 'Deprecated HTML tags',
    description: 'The page uses deprecated tags (e.g. <font>, <center>). This is a poor coding pattern.',
    recommendation: 'Replace deprecated tags with modern CSS.'
  },
  'code.js.blocking': {
    title: 'Render-blocking JavaScript',
    description: 'Found {count} script tags without defer or async. This is an inefficient performance pattern.',
    recommendation: 'Add defer or async on external scripts.'
  },
  'code.ids.duplicate': {
    title: 'Duplicate ID attributes',
    description: 'IDs that appear more than once: {ids}.',
    recommendation: 'Each id must be unique in the document.'
  },
  'code.document.write': {
    title: 'document.write() is used',
    description: 'document.write() blocks parsing and is outdated.',
    recommendation: 'Replace with DOM APIs (createElement/appendChild).'
  },
  'code.doctype.missing': {
    title: 'Missing HTML5 doctype',
    description: 'The document lacks <!DOCTYPE html> – may trigger quirks mode.',
    recommendation: 'Add <!DOCTYPE html> as the first line.'
  },
  'code.charset.missing': {
    title: 'Missing character set',
    description: 'No charset meta – special characters may display incorrectly.',
    recommendation: 'Add <meta charset="UTF-8"> early in <head>.'
  },
  'code.images.broken': {
    title: 'Broken images found',
    description: '{broken} of {sample} tested image URLs failed ({samples}).',
    recommendation: 'Update src attributes or remove images that no longer exist.'
  },
  'code.handlers.inline': {
    title: 'Inline event handlers in HTML',
    description: '{count} elements use inline handlers (onclick etc.) – harder to maintain and worse CSP compatibility.',
    recommendation: 'Move event handling to external scripts with addEventListener.'
  },
  'code.debug.left': {
    title: 'Debug code left in production',
    description: '{count} console.* calls{debugger} found in inline scripts.',
    recommendation: 'Remove console.log/debugger before shipping, or strip them in the build step.'
  },
  'code.dom.deep': {
    title: 'Very deep DOM nesting',
    description: 'Deepest nesting is {depth} levels. Deep trees slow CSS/JS and make code harder to maintain.',
    recommendation: 'Simplify markup and remove unnecessary wrapper elements.'
  },
  'code.libs.deprecated': {
    title: 'Deprecated libraries detected',
    description: 'The page appears to use: {findings}. Older libraries often lack security updates.',
    recommendation: 'Upgrade to maintained versions or replace with modern alternatives.'
  },
  'code.important.abuse': {
    title: 'Overuse of !important',
    description: '{count} !important declarations in inline <style> – sign of CSS specificity problems.',
    recommendation: 'Refactor the CSS hierarchy instead of relying on !important.'
  },
  'code.js.exception': {
    title: 'JavaScript exception in the browser{suffix}',
    description: 'Unhandled JS error: {message}',
    recommendation: 'Fix the runtime error and test the page in DevTools Console.'
  },
  'code.console.errors': {
    title: 'Browser console errors{suffix}',
    description: '{count} console.error messages were captured during page load. Example: {example}',
    recommendation: 'Open DevTools → Console and fix the errors.'
  },
  'vitals.generic': {
    title: '{title} ({device})',
    description: '{description}',
    recommendation: 'Fix according to the recommendation for "{title}" ({deviceLower}).'
  }
};

const sv: Record<string, MsgBag> = {
  'seo.title.missing': {
    title: 'Saknad Title-tagg',
    description: 'Sidan saknar en <title>-tagg, vilket är kritiskt för sökmotorer.',
    recommendation: 'Lägg till en beskrivande <title> i <head>.'
  },
  'seo.meta.missing': {
    title: 'Saknad Meta Description',
    description: 'Sidan saknar en metabeskrivning.',
    recommendation: 'Lägg till <meta name="description" content="...">.'
  },
  'seo.h1.missing': {
    title: 'Saknad H1-rubrik',
    description: 'Sidan saknar en huvudrubrik (H1).',
    recommendation: 'Se till att varje sida har exakt en H1-rubrik.'
  },
  'seo.title.short': {
    title: 'För kort sidtitel',
    description: 'Title-taggen är bara {len} tecken. Google visar ofta 50–60 tecken.',
    recommendation: 'Utöka titeln med primärt sökord och varumärke (ca 50–60 tecken).'
  },
  'seo.title.long': {
    title: 'För lång sidtitel',
    description: 'Title-taggen är {len} tecken och kan trunkeras i sökresultat.',
    recommendation: 'Korta ner titeln till max 60 tecken med de viktigaste orden först.'
  },
  'seo.meta.short': {
    title: 'Kort metabeskrivning',
    description: 'Meta description är {len} tecken. Rekommenderat: 120–160.',
    recommendation: 'Skriv en lockande beskrivning på 120–160 tecken med primärt sökord.'
  },
  'seo.meta.long': {
    title: 'För lång metabeskrivning',
    description: 'Meta description är {len} tecken och kan kapas i Google.',
    recommendation: 'Korta ner till max 160 tecken.'
  },
  'seo.h1.multiple': {
    title: 'Flera H1-rubriker',
    description: 'Sidan har {count} H1-taggar. Bästa praxis är exakt en per sida.',
    recommendation: 'Behåll en H1 som huvudrubrik och ändra övriga till H2/H3.'
  },
  'seo.viewport.missing': {
    title: 'Saknad viewport-meta',
    description: 'Sidan saknar viewport-taggen som krävs för mobilanpassning.',
    recommendation: 'Lägg till viewport-meta i <head> för responsiv design.'
  },
  'seo.canonical.missing': {
    title: 'Saknad canonical-URL',
    description: 'Ingen canonical-länk hittades. Det kan orsaka duplicerat innehåll i Google.',
    recommendation: 'Lägg till <link rel="canonical" href="..."> med sidans föredragna URL.'
  },
  'seo.og.title.missing': {
    title: 'Saknad Open Graph-titel',
    description: 'og:title saknas – delningar på sociala medier får sämre förhandsvisning.',
    recommendation: 'Lägg till Open Graph-taggar för titel, beskrivning och bild.'
  },
  'seo.og.image.missing': {
    title: 'Saknad delningsbild (og:image)',
    description: 'Ingen og:image – länkar delade på Facebook/LinkedIn saknar bild.',
    recommendation: 'Lägg till en bild på minst 1200×630 px som og:image.'
  },
  'seo.structured.missing': {
    title: 'Ingen strukturerad data',
    description: 'Sidan saknar JSON-LD eller microdata för rich results i Google.',
    recommendation: 'Lägg till schema.org JSON-LD (t.ex. Organization, WebSite, Article).'
  },
  'seo.robots.noindex': {
    title: 'Sidan är noindex',
    description: 'meta robots innehåller "noindex" – sidan indexeras inte av Google.',
    recommendation: 'Ta bort noindex om sidan ska synas i sökresultat.'
  },
  'seo.favicon.missing': {
    title: 'Saknad favicon',
    description: 'Ingen favicon hittades – sidan ser oprofessionell ut i flikar och bokmärken.',
    recommendation: 'Lägg till en favicon (32×32 eller SVG).'
  },
  'seo.external.noopener': {
    title: 'Osäkra externa länkar',
    description: '{count} länkar med target="_blank" saknar rel="noopener".',
    recommendation: 'Lägg till rel="noopener noreferrer" på alla externa länkar.'
  },
  'seo.sitemap.missing': {
    title: 'Ingen sitemap hittades',
    description: 'Varken /sitemap.xml eller robots.txt-referens till sitemap hittades.',
    recommendation: 'Skapa en sitemap.xml och referera till den i robots.txt.'
  },
  'seo.manifest.missing': {
    title: 'Saknad web app manifest',
    description: 'Ingen manifest.json – PWA-funktioner och "Lägg till på hemskärmen" saknas.',
    recommendation: 'Skapa manifest.json och länka med <link rel="manifest" href="/manifest.json">.'
  },
  'seo.links.broken': {
    title: 'Trasiga länkar hittades',
    description: '{broken} av {sample} testade länkar svarar med fel ({samples}).',
    recommendation: 'Åtgärda eller ta bort trasiga länkar – de skadar SEO och användarupplevelsen.'
  },
  'seo.meta.refresh': {
    title: 'Meta refresh-omdirigering',
    description: 'Sidan använder meta refresh ({content}) – dåligt för SEO och tillgänglighet.',
    recommendation: 'Använd HTTP 301/302-redirects istället för meta refresh.'
  },
  'seo.jsonld.invalid': {
    title: 'Ogiltig strukturerad data (JSON-LD)',
    description: '{count} JSON-LD-block kunde inte parsas ({error}). Google ignorerar trasig structured data.',
    recommendation: 'Validera JSON-LD med Google Rich Results Test och åtgärda syntaxfel.'
  },
  'seo.twitter.missing': {
    title: 'Saknade Twitter Card-taggar',
    description: 'Open Graph finns men Twitter Card-meta saknas – delningar på X/Twitter kan bli sämre.',
    recommendation: 'Lägg till twitter:card, twitter:title och twitter:image.'
  },
  'seo.robots.disallow': {
    title: 'robots.txt blockerar hela sajten',
    description: 'robots.txt har Disallow: / för alla user-agents – sökmotorer indexerar inte innehållet.',
    recommendation: 'Justera robots.txt om sajten ska synas i sökresultat.'
  },
  'seo.hreflang.missing': {
    title: 'Flera språk utan hreflang',
    description: 'Sidan blandar språkmarkörer ({langs}) men saknar hreflang-länkar.',
    recommendation: 'Lägg till <link rel="alternate" hreflang="..."> för varje språkversion.'
  },
  'perf.load.slow': {
    title: 'Långsam svarstid',
    description: 'Servern tog {ms}ms att svara.',
    recommendation: 'Optimera servern, använd caching eller en CDN.'
  },
  'perf.load.medium': {
    title: 'Något långsam svarstid',
    description: 'Servern tog {ms}ms att svara.',
    recommendation: 'Optimera TTFB (Time to First Byte).'
  },
  'perf.ttfb.high': {
    title: 'Långsam TTFB (Time to First Byte)',
    description: 'Servern svarade på {ms}ms innan innehåll började levereras.',
    recommendation: 'Optimera server, databas och caching. Mål: under 800ms TTFB.'
  },
  'perf.ttfb.medium': {
    title: 'Förbättringsbar TTFB',
    description: 'TTFB är {ms}ms. Google rekommenderar under 800ms.',
    recommendation: 'Aktivera serverside-caching och CDN för statiska resurser.'
  },
  'perf.html.large': {
    title: 'Stor HTML-sida',
    description: 'HTML-dokumentet är ~{kb} KB. Stora sidor ökar laddtid och parsningstid.',
    recommendation: 'Minska onödig markup, dela upp innehåll och lazy-loada sektioner.'
  },
  'perf.dom.large': {
    title: 'För många DOM-element',
    description: 'Sidan har {nodes} DOM-noder. Rekommenderat: under 1500 noder.',
    recommendation: 'Förenkla markup, undvik onödiga wrapper-divs och virtualisera långa listor.'
  },
  'perf.scripts.many': {
    title: 'Många JavaScript-filer',
    description: '{scripts} externa script-taggar ({external} tredjepart). Varje fil blockerar eller fördröjer rendering.',
    recommendation: 'Bundla script, ta bort oanvända bibliotek och ladda tredjepart asynkront.'
  },
  'perf.images.lazy': {
    title: 'Bilder utan lazy loading',
    description: '{count} bilder saknar loading="lazy" – alla laddas direkt.',
    recommendation: 'Lägg till loading="lazy" på bilder under fold.'
  },
  'perf.images.dimensions': {
    title: 'Bilder utan dimensioner (CLS-risk)',
    description: '{count} bilder saknar width/height – orsakar layoutskift (CLS).',
    recommendation: 'Ange width och height på alla img-taggar eller använd aspect-ratio i CSS.'
  },
  'perf.css.blocking': {
    title: 'Många render-blockerande CSS-filer',
    description: '{count} stylesheet-länkar i <head> blockerar första rendering.',
    recommendation: 'Kombinera CSS-filer, inline kritisk CSS och ladda resten asynkront.'
  },
  'perf.fonts.preconnect': {
    title: 'Saknad preconnect för webfonts',
    description: 'Google Fonts används utan preconnect – extra DNS/TLS-fördröjning.',
    recommendation: 'Lägg till preconnect till fonts.googleapis.com och fonts.gstatic.com.'
  },
  'perf.compression.missing': {
    title: 'Ingen textkomprimering',
    description: 'Svaret saknar gzip/brotli-komprimering – HTML levereras okomprimerat.',
    recommendation: 'Aktivera gzip eller Brotli på webbservern för HTML, CSS och JS.'
  },
  'perf.cache.missing': {
    title: 'Saknad cache-policy',
    description: 'HTML-svaret saknar Cache-Control-header – upprepad laddning blir långsammare.',
    recommendation: 'Sätt Cache-Control med rimlig max-age för statiska resurser.'
  },
  'perf.images.legacy': {
    title: 'Äldre bildformat används',
    description: '{count} bilder använder JPEG/PNG istället för WebP/AVIF – större filstorlek och långsammare laddning.',
    recommendation: 'Konvertera bilder till WebP eller AVIF och använd <picture> för fallback.'
  },
  'perf.assets.broken': {
    title: 'Trasiga CSS/JS-resurser',
    description: '{count} stylesheet- eller script-filer svarar med fel.',
    recommendation: 'Åtgärda saknade eller felaktiga resurs-URL:er – de bryter layout och funktionalitet.'
  },
  'perf.inline.large': {
    title: 'Stora inline-script',
    description: '{count} inline-script är över 20 KB (störst ~{maxKb} KB) – ökar HTML-storlek och blockerar caching.',
    recommendation: 'Flytta stora script till externa filer med defer/async och lång cache.'
  },
  'perf.base64.large': {
    title: 'Stora base64-bilder i HTML',
    description: '{count} inline base64-bilder (~{kb} KB) blåser upp HTML och förhindrar browser-cache.',
    recommendation: 'Använd externa bildfiler (WebP/AVIF) istället för data-URI:er för stora bilder.'
  },
  'perf.network.failed': {
    title: 'Misslyckade nätverksresurser (HTTP {status}){suffix}',
    description: '{count} resurser svarade med {status}: {samples}.',
    recommendation: 'Åtgärda saknade eller trasiga CSS/JS/bild/API-anrop som syns i Network-fliken.'
  },
  'perf.network.incomplete': {
    title: 'Nätverksförfrågningar som aldrig slutfördes{suffix}',
    description: '{count} resurser misslyckades helt (timeout/CORS/DNS): {samples}.',
    recommendation: 'Kontrollera CORS, DNS och att resurs-URL:erna är korrekta.'
  },
  'sec.https.missing': {
    title: 'Okrypterad anslutning',
    description: 'Sidan använder HTTP istället för HTTPS.',
    recommendation: 'Installera ett SSL-certifikat och tvinga HTTPS.'
  },
  'sec.hsts.missing': {
    title: 'Saknad HSTS-header',
    description: 'Sidan tvingar inte webbläsare att använda HTTPS (HSTS).',
    recommendation: 'Lägg till Strict-Transport-Security i serverns headers.'
  },
  'sec.clickjacking': {
    title: 'Risk för Clickjacking',
    description: 'Sidan saknar skydd mot att bäddas in i iframes.',
    recommendation: 'Lägg till X-Frame-Options: DENY eller SAMEORIGIN.'
  },
  'sec.xcto.missing': {
    title: 'Saknad X-Content-Type-Options',
    description: 'Headern X-Content-Type-Options saknas – ökar risk för MIME-sniffing.',
    recommendation: 'Lägg till X-Content-Type-Options: nosniff på alla svar.'
  },
  'sec.referrer.missing': {
    title: 'Saknad Referrer-Policy',
    description: 'Ingen Referrer-Policy – URL:er kan läcka till tredjepart.',
    recommendation: 'Sätt Referrer-Policy: strict-origin-when-cross-origin.'
  },
  'sec.csp.missing': {
    title: 'Ingen Content-Security-Policy',
    description: 'CSP saknas – sidan har svagare skydd mot XSS-attacker.',
    recommendation: 'Implementera en CSP-header som begränsar script- och style-källor.'
  },
  'sec.permissions.missing': {
    title: 'Saknad Permissions-Policy',
    description: 'Ingen Permissions-Policy – webbläsarfunktioner (kamera, mikrofon) är odefinierade.',
    recommendation: 'Begränsa onödiga API:er med Permissions-Policy.'
  },
  'sec.mixed.content': {
    title: 'Mixed content (HTTP på HTTPS-sida)',
    description: '{count}+ resurser laddas via osäker HTTP på en HTTPS-sida.',
    recommendation: 'Byt alla http://-URL:er till https:// eller använd protokoll-relativa länkar.'
  },
  'sec.server.exposure': {
    title: 'Serverinformation exponeras',
    description: 'Headers avslöjar teknikstack: {info}.',
    recommendation: 'Ta bort eller maskera Server- och X-Powered-By-headers.'
  },
  'sec.sri.missing': {
    title: 'CDN-resurser utan Subresource Integrity',
    description: '{count} externa CDN-script/stylesheets saknar integrity-attribut – risk om CDN komprometteras.',
    recommendation: 'Lägg till integrity och crossorigin på CDN-resurser.'
  },
  'sec.js.dangerous': {
    title: 'Riskabla JavaScript-mönster i källkod',
    description: 'Hittade potentiellt osäkra mönster: {findings}. Dessa ökar XSS-risken.',
    recommendation: 'Undvik eval/Function, sanera innan innerHTML och använd textContent där möjligt.'
  },
  'sec.secrets': {
    title: 'Möjliga hemligheter i sidkällan',
    description: 'Mönster som liknar hemligheter hittades: {findings}. Om det är riktiga nycklar måste de roteras omedelbart.',
    recommendation: 'Flytta nycklar till servermiljövariabler. Exponera aldrig privata API-nycklar i frontend.'
  },
  'sec.password.autocomplete': {
    title: 'Lösenordsfält utan korrekt autocomplete',
    description: '{count} lösenordsfält saknar autocomplete="current-password" eller "new-password".',
    recommendation: 'Ange autocomplete för lösenordsfält så att lösenordshanterare fungerar säkert.'
  },
  'sec.comments.sensitive': {
    title: 'Känsliga HTML-kommentarer',
    description: '{count} kommentarer nämner lösenord, nycklar eller liknande – synliga i sidkällan.',
    recommendation: 'Ta bort känsliga kommentarer från produktions-HTML.'
  },
  'sec.cookies.flags': {
    title: 'Osäkra cookie-flaggor',
    description: 'Set-Cookie saknar viktiga flaggor: {problems}.',
    recommendation: 'Sätt Secure; HttpOnly; SameSite=Lax (eller Strict) på sessionscookies.'
  },
  'sec.forms.http': {
    title: 'Känsliga formulär över HTTP',
    description: 'Lösenords- eller betalningsfält skickas över okrypterad HTTP.',
    recommendation: 'Tvinga HTTPS innan användare kan skicka känslig data.'
  },
  'a11y.alt.missing': {
    title: 'Saknade Alt-texter',
    description: '{count} bilder saknar alt-attribut.',
    recommendation: 'Lägg till beskrivande alt-texter på alla bilder för skärmläsare.'
  },
  'a11y.lang.missing': {
    title: 'Saknat språkattribut',
    description: 'HTML-taggen saknar lang-attribut.',
    recommendation: 'Lägg till lang="sv" (eller aktuellt språk) i <html>-taggen.'
  },
  'a11y.form.labels': {
    title: 'Formulärfält utan etikett',
    description: '{count} fält saknar associerad <label> eller aria-label.',
    recommendation: 'Koppla varje fält till en <label for="id"> eller aria-label.'
  },
  'a11y.button.name': {
    title: 'Knappar utan tillgängligt namn',
    description: '{count} knappar saknar synlig text eller aria-label.',
    recommendation: 'Lägg till beskrivande text eller aria-label på alla knappar.'
  },
  'a11y.skip.missing': {
    title: 'Saknad skip-länk',
    description: 'Ingen "hoppa till innehåll"-länk för tangentbordsanvändare.',
    recommendation: 'Lägg till en dold skip-länk som första fokuserbara element.'
  },
  'a11y.links.empty': {
    title: 'Tomma länkar',
    description: '{count} länkar saknar synlig text – skärmläsare kan inte beskriva dem.',
    recommendation: 'Lägg till beskrivande länktext eller aria-label.'
  },
  'a11y.heading.hierarchy': {
    title: 'Bruten rubrikhierarki',
    description: 'Rubriknivå hoppar från H{from} till H{to} – svårt för skärmläsare att navigera.',
    recommendation: 'Använd sekventiella rubriknivåer (H1 → H2 → H3) utan att hoppa över nivåer.'
  },
  'a11y.iframe.title': {
    title: 'Iframes utan titel',
    description: '{count} iframe(s) saknar title eller aria-label.',
    recommendation: 'Lägg till beskrivande title på alla inbäddade iframes.'
  },
  'a11y.heading.empty': {
    title: 'Tomma rubriker',
    description: '{count} rubriktaggar saknar textinnehåll.',
    recommendation: 'Fyll i meningsfull rubriktext eller ta bort tomma rubrikelement.'
  },
  'a11y.links.generic': {
    title: 'Generisk länktext',
    description: '{count} länkar använder otydlig text som "klicka här" / "läs mer" – skärmläsare får ingen kontext.',
    recommendation: 'Använd beskrivande länktext som beskriver målsidan.'
  },
  'a11y.table.headers': {
    title: 'Tabeller utan rubrikceller',
    description: '{count} datatabeller saknar <th> eller scope – svårt att tolka för skärmläsare.',
    recommendation: 'Använd <th scope="col|row"> för tabellrubriker.'
  },
  'a11y.media.captions': {
    title: 'Media utan undertexter',
    description: '{count} video/audio-element saknar <track kind="captions">.',
    recommendation: 'Lägg till undertexter via WebVTT-track för tillgänglighet.'
  },
  'a11y.tabindex.positive': {
    title: 'Positivt tabindex används',
    description: '{count} element har tabindex > 0 vilket stör naturlig tabordning.',
    recommendation: 'Använd tabindex="0" eller "-1", och lita på DOM-ordningen för fokus.'
  },
  'a11y.main.missing': {
    title: 'Saknad main-landmark',
    description: 'Sidan saknar <main> eller role="main" – skärmläsaranvändare får svårare att hoppa till innehållet.',
    recommendation: 'Wrapa huvudinnehållet i <main>.'
  },
  'a11y.placeholder.only': {
    title: 'Placeholder används som etikett',
    description: '{count} fält förlitar sig bara på placeholder – försvinner vid inmatning och är otillgängligt.',
    recommendation: 'Använd synlig <label> utöver eventuell placeholder.'
  },
  'a11y.noscript.missing': {
    title: 'Saknad noscript-fallback',
    description: 'Många script laddas men ingen <noscript> – användare utan JS får ingen vägledning.',
    recommendation: 'Lägg till en <noscript>-sektion med grundläggande innehåll eller instruktion.'
  },
  'a11y.axe.fix': {
    title: '{title}',
    description: '{description}',
    recommendation: 'Åtgärda enligt WCAG: {url}'
  },
  'code.inline.style': {
    title: 'Inline CSS används',
    description: 'Hittade {count} element med inline-styles. Detta gör koden svårare att underhålla.',
    recommendation: 'Flytta all styling till externa CSS-filer.'
  },
  'code.deprecated.tags': {
    title: 'Föråldrade HTML-taggar',
    description: 'Sidan använder föråldrade taggar (t.ex. <font>, <center>). Detta är ett dåligt kodmönster.',
    recommendation: 'Ersätt föråldrade taggar med modern CSS.'
  },
  'code.js.blocking': {
    title: 'Render-blockerande JavaScript',
    description: 'Hittade {count} script-taggar utan defer eller async. Detta är ett ineffektivt prestandamönster.',
    recommendation: "Lägg till 'defer' eller 'async' på externa script."
  },
  'code.ids.duplicate': {
    title: 'Duplicerade ID-attribut',
    description: 'ID:n som förekommer flera gånger: {ids}.',
    recommendation: 'Varje id ska vara unikt i dokumentet.'
  },
  'code.document.write': {
    title: 'document.write() används',
    description: 'document.write() blockerar parsing och är föråldrat.',
    recommendation: 'Ersätt med DOM-manipulation (createElement/appendChild).'
  },
  'code.doctype.missing': {
    title: 'Saknad HTML5 doctype',
    description: 'Dokumentet saknar <!DOCTYPE html> – kan orsaka quirks mode.',
    recommendation: 'Lägg till <!DOCTYPE html> som första rad.'
  },
  'code.charset.missing': {
    title: 'Saknad teckenuppsättning',
    description: 'Ingen charset-meta – specialtecken kan visas fel.',
    recommendation: 'Lägg till <meta charset="UTF-8"> tidigt i <head>.'
  },
  'code.images.broken': {
    title: 'Trasiga bilder hittades',
    description: '{broken} av {sample} testade bild-URL:er misslyckades ({samples}).',
    recommendation: 'Uppdatera src-attribut eller ta bort bilder som inte längre finns.'
  },
  'code.handlers.inline': {
    title: 'Inline event handlers i HTML',
    description: '{count} element använder inline-handlers (onclick m.fl.) – svårare att underhålla och sämre CSP-kompatibilitet.',
    recommendation: 'Flytta händelsehantering till externa script med addEventListener.'
  },
  'code.debug.left': {
    title: 'Debugkod kvar i produktion',
    description: '{count} console.*-anrop{debugger} hittades i inline-script.',
    recommendation: 'Ta bort console.log/debugger innan publicering, eller strippa dem i build-steget.'
  },
  'code.dom.deep': {
    title: 'Mycket djup DOM-nestning',
    description: 'Djupaste nestningen är {depth} nivåer. Djupa träd gör CSS/JS långsammare och koden svårare att underhålla.',
    recommendation: 'Förenkla markup och ta bort onödiga wrapper-element.'
  },
  'code.libs.deprecated': {
    title: 'Föråldrade bibliotek upptäckta',
    description: 'Sidan verkar använda: {findings}. Äldre bibliotek saknar ofta säkerhetsuppdateringar.',
    recommendation: 'Uppgradera till underhållna versioner eller ersätt med moderna alternativ.'
  },
  'code.important.abuse': {
    title: 'Överanvändning av !important',
    description: '{count} !important i inline-<style> – tecken på CSS-specifitetsproblem.',
    recommendation: 'Refaktorera CSS-hierarkin istället för att förlita dig på !important.'
  },
  'code.js.exception': {
    title: 'JavaScript-undantag i webbläsaren{suffix}',
    description: 'Ohanterat JS-fel: {message}',
    recommendation: 'Fixa runtime-felet och testa sidan i DevTools Console.'
  },
  'code.console.errors': {
    title: 'Konsolfel i webbläsaren{suffix}',
    description: '{count} console.error-meddelanden fångades under sidladdning. Exempel: {example}',
    recommendation: 'Öppna DevTools → Console och åtgärda felen.'
  },
  'vitals.generic': {
    title: '{title} ({device})',
    description: '{description}',
    recommendation: 'Åtgärda enligt rekommendationen för "{title}" ({deviceLower}).'
  }
};

function fill(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = params[key];
    return val === undefined || val === null ? '' : String(val);
  });
}

function packFor(lang: Language): Record<string, MsgBag> {
  return lang === 'sv' ? sv : en;
}

export function scanMsg(
  lang: Language | undefined,
  id: ScanIssueId,
  field: keyof MsgBag,
  params?: Params
): string {
  const resolved = lang && lang !== 'en' && lang !== 'sv' ? 'en' : (lang ?? 'en');
  const pack = packFor(resolved as Language);
  const fallback = en[id] ?? sv[id];
  const entry = pack[id] ?? fallback;
  if (!entry) return id;
  return fill(entry[field], params);
}

export function localizedIssue(
  lang: Language | undefined,
  id: ScanIssueId,
  base: Omit<ScannerIssue, 'title' | 'description' | 'recommendation'> & {
    params?: Params;
    titleOverride?: string;
    descriptionOverride?: string;
    recommendationOverride?: string;
  }
): ScannerIssue {
  const { params, titleOverride, descriptionOverride, recommendationOverride, ...rest } = base;
  return {
    ...rest,
    title: titleOverride ?? scanMsg(lang, id, 'title', params),
    description: descriptionOverride ?? scanMsg(lang, id, 'description', params),
    recommendation: recommendationOverride ?? scanMsg(lang, id, 'recommendation', params)
  };
}

export function deviceLabel(lang: Language | undefined, device: 'mobile' | 'desktop'): string {
  if (lang === 'sv') return device === 'mobile' ? 'Mobil' : 'Desktop';
  return device === 'mobile' ? 'Mobile' : 'Desktop';
}

export function deviceSuffix(lang: Language | undefined, device: 'mobile' | 'desktop' | 'both'): string {
  if (device === 'both') return '';
  const label = deviceLabel(lang, device);
  return ` (${label})`;
}

export function summarizeScan(
  lang: Language | undefined,
  score: number,
  issueCount: number,
  hasVitals: boolean,
  hasBrowser: boolean
): string {
  const isSv = lang === 'sv';
  const depth = hasBrowser
    ? isSv
      ? 'Djupanalys med headless Chrome (runtime, nätverk, skärmdumpar) och utökade WCAG-kontroller.'
      : 'Deep analysis with headless Chrome (runtime, network, screenshots) and extended WCAG checks.'
    : hasVitals
      ? isSv
        ? 'Analysen inkluderar Core Web Vitals och WCAG-tillgänglighetskontroller.'
        : 'The analysis includes Core Web Vitals and WCAG accessibility checks.'
      : isSv
        ? 'Analysen inkluderar 80+ regler och WCAG-tillgänglighetskontroller via axe-core.'
        : 'The analysis includes 80+ rules and WCAG accessibility checks via axe-core.';

  if (score >= 90) {
    return isSv
      ? `Utmärkt resultat! ${issueCount} förbättringsmöjligheter identifierades. ${depth}`
      : `Excellent result! ${issueCount} improvement opportunities were identified. ${depth}`;
  }
  if (score >= 70) {
    return isSv
      ? `Bra grund, men ${issueCount} områden kan optimeras. ${depth}`
      : `Solid foundation, but ${issueCount} areas can be optimized. ${depth}`;
  }
  if (score >= 50) {
    return isSv
      ? `${issueCount} brister hittades som påverkar SEO, prestanda eller säkerhet. ${depth}`
      : `${issueCount} issues were found that affect SEO, performance or security. ${depth}`;
  }
  return isSv
    ? `Webbplatsen behöver omfattande åtgärder – ${issueCount} problem identifierades. ${depth}`
    : `The website needs significant work – ${issueCount} problems were identified. ${depth}`;
}

export function apiError(lang: Language | undefined, key: 'invalidUrl' | 'timeout' | 'failed', detail?: string): string {
  const isSv = lang === 'sv';
  if (key === 'invalidUrl') {
    return isSv
      ? 'Ogiltig URL. Endast publika http(s)-adresser kan skannas.'
      : 'Invalid URL. Only public http(s) addresses can be scanned.';
  }
  if (key === 'timeout') {
    return isSv
      ? 'Webbplatsen svarade inte inom tidsgränsen.'
      : 'The website did not respond within the time limit.';
  }
  return isSv
    ? `Analys misslyckades: ${detail ?? 'okänt fel'}`
    : `Analysis failed: ${detail ?? 'unknown error'}`;
}

function templateToRegex(template: string): RegExp {
  const parts: string[] = [];
  const token = /\{(\w+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = token.exec(template))) {
    parts.push(template.slice(last, m.index).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    parts.push(`(?<${m[1]}>[\\s\\S]+?)`);
    last = m.index + m[0].length;
  }
  parts.push(template.slice(last).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^${parts.join('')}$`);
}

function matchTemplate(template: string, actual: string): Params | null {
  if (!template.includes('{')) {
    return template === actual ? {} : null;
  }
  const re = templateToRegex(template);
  const m = actual.match(re);
  if (!m) return null;
  return { ...(m.groups ?? {}) };
}

function findMsgIdBySwedishTitle(title: string): { id: string; params: Params } | null {
  for (const [id, msg] of Object.entries(sv)) {
    const params = matchTemplate(msg.title, title);
    if (params) return { id, params };
  }
  return null;
}

/**
 * Rules may still emit Swedish copy. Re-emit in the active UI language.
 */
export function localizeHardcodedIssue(
  lang: Language | undefined,
  issue: ScannerIssue
): ScannerIssue {
  const resolved = !lang || lang === 'en' ? 'en' : lang === 'sv' ? 'sv' : 'en';
  if (resolved === 'sv') return issue;

  const hit = findMsgIdBySwedishTitle(issue.title);
  if (!hit) {
    // Also try English titles already (no-op)
    return issue;
  }

  // Prefer params extracted from description when richer
  const svDesc = sv[hit.id]?.description;
  const descParams = svDesc ? matchTemplate(svDesc, issue.description) : null;
  const params = { ...hit.params, ...(descParams ?? {}) };

  return localizedIssue(resolved, hit.id, {
    category: issue.category,
    severity: issue.severity,
    source: issue.source ?? 'rules',
    codeSnippet: issue.codeSnippet,
    selector: issue.selector,
    device: issue.device,
    screenshot: issue.screenshot,
    params
  });
}

export function localizeHardcodedIssues(
  lang: Language | undefined,
  issues: ScannerIssue[]
): ScannerIssue[] {
  return issues.map((issue) => localizeHardcodedIssue(lang, issue));
}
