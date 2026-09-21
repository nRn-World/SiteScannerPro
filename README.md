<div align="center">

# SiteScanner Pro

**See what is holding your website back.**

Analyze any public website across SEO, performance, security, accessibility, and code quality — in seconds.

[![Deploy Status](https://github.com/nRn-World/SiteScannerPro/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/nRn-World/SiteScannerPro/actions/workflows/deploy-pages.yml)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

**[Launch SiteScanner Pro →](https://nrn-world.github.io/SiteScannerPro/)**

</div>

---

## About

SiteScanner Pro is a website health analysis service for businesses, freelancers, creators, and web agencies. Enter a public URL and get a clear, prioritized report of what can be improved — no guesswork, no complicated dashboards.

The analysis engine is a deterministic rule-based scanner: it fetches the page, evaluates measurable technical signals, and turns each finding into a prioritized issue with a practical recommendation. Premium unlocks the exact code fixes.

## What the analysis covers

| Category | What you learn |
|---|---|
| **SEO** | Page structure and metadata signals that affect how search engines understand the site |
| **Performance** | Resource and page choices that may slow down load times |
| **Security** | Transport and security signals worth attention |
| **Accessibility** | Common barriers affecting visitors with different needs |
| **Code quality** | Technical patterns impacting reliability and maintainability |

## How it works

1. Enter the address of a public website.
2. The scanning engine retrieves the page and evaluates its technical signals.
3. Receive an overall score with category-based results.
4. Act on prioritized recommendations — Premium unlocks exact code fixes.

## Access

| | Free | Premium |
|---|---|---|
| Website health scan | ✓ | ✓ |
| Overall score & categories | ✓ | ✓ |
| Issue details | ✓ | ✓ |
| Complete code solutions | — | ✓ |
| Unlimited scans | — | ✓ |
| Faster scans (shorter wait time) | — | ✓ |

Premium is a **one-time purchase (€10.99, lifetime access)** — no subscription. Purchase [SiteScanner Pro on Ko-fi](https://ko-fi.com/s/b525e21531). The private lifetime code is shown only in the product's post-purchase thank-you message and is activated in SiteScanner.

## Features

- Multilingual interface: English, Svenska, Türkçe, Español, Français, العربية
- PDF export of analysis reports
- Local scan history (stored in your browser, never sold)
- Anonymous scanning — no account required
- Responsive design for desktop and mobile

## Built with

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons
- **Backend:** Node.js, Express, Cheerio
- **Payments:** Ko-fi + permanent Pro license codes
- **Email:** Nodemailer

### Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Frontend (static)  │  HTTPS  │   Backend API        │
│  GitHub Pages       │ ──────> │   Render (Node)      │
│  nrn-world.github.io│ <────── │   sitescanner-pro    │
└─────────────────────┘         │                      │
                                │   • Scan engine      │
        Ko-fi checkout ────────>│   • Pro code verify  │
        (redirect flow)         │   • License store    │
                                └──────────────────────┘
```

## Running locally

**Prerequisites:** Node.js 20+ and npm.

```bash
# 1. Clone the repository
git clone https://github.com/nRn-World/SiteScannerPro.git
cd SiteScannerPro

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Edit `.env`:

```env
KOFI_PRO_URL="https://ko-fi.com/s/b525e21531"
KOFI_LICENSE_KEY_HASH=""              # Optional: legacy single shared key (SHA-256)
LICENSE_SIGNING_SECRET=""             # Private random secret, minimum 32 characters
APP_URL="http://localhost:3000"
LOG_LEVEL="info"                      # debug | info | warn | error
MAX_CONCURRENT_SCANS="2"              # Global scan queue width
MAX_CONCURRENT_PAGES="2"              # Simultaneous Puppeteer pages
REPORT_SHARE_TTL_DAYS="30"            # Shared report link lifetime (days)
EMAIL_USER="..."                     # Optional: Gmail for contact form
EMAIL_PASS="..."                     # Optional: Gmail app password
CONTACT_RECEIVER_EMAIL="..."         # Optional: Where contact emails are sent
```

```bash
# 4. Start the dev server (frontend + backend on one port)
npm run dev
```

Open http://localhost:3000 (set `PORT` to change).

### Issuing Pro license keys

Each purchase gets a **unique** key (revocable independently). Generate and register one:

```bash
npm run license:issue          # prints one key; hash is stored in data/license-keys.json
npx tsx scripts/issue-license-key.ts 5   # batch of 5
```

Paste the printed key into the buyer's Ko-fi thank-you message. To revoke a leaked key:

```bash
npx tsx -e "new (await import('./src/services/license.service')).LicenseService().revokeKey('SSP-PRO-XXXX-XXXX-XXXX')"
```

Legacy keys validated via `KOFI_LICENSE_KEY_HASH` keep working during migration.

### Useful scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Vite middleware + Express) |
| `npm run build` | Build frontend + prerender SEO meta into `dist/` |
| `npm start` | Serve production build |
| `npm run lint` | Type-check with TypeScript |
| `npm test` | Run unit tests (license, VIP, share links, SSRF) |
| `npm run license:issue` | Generate a unique, revocable Pro key |

## Deployment

This project deploys automatically on push to `main`:

- **Frontend** → GitHub Pages via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) (configured with `VITE_PUBLIC_BASE` and `VITE_API_BASE`)
- **Backend** → Render via [`render.yaml`](render.yaml) Blueprint (Node web service)

Environment variables used in production: `KOFI_PRO_URL`, `KOFI_LICENSE_KEY_HASH` (legacy), `LICENSE_SIGNING_SECRET`, `APP_URL`, `CORS_ORIGIN`, `DATA_DIR` (persistent disk for VIP/license state), `LOG_LEVEL`, `MAX_CONCURRENT_SCANS`, `MAX_CONCURRENT_PAGES`, `REPORT_SHARE_TTL_DAYS`.

### Security & reliability

- Rate limiting per IP on scan/contact/license endpoints (free tier is stricter) — returns `429` with `Retry-After`.
- Global scan queue with Pro priority and bounded Puppeteer concurrency (`MAX_CONCURRENT_PAGES`).
- SSRF protection: DNS resolution validated against private/link-local ranges (incl. IPv4-mapped IPv6 and decimal notation) before fetching.
- CORS has no wildcard fallback: unknown origins receive no `Access-Control-Allow-Origin` header.
- License session tokens are short-lived (`exp`, 30 days); the purchased key itself remains lifetime. Old tokens without `exp` stay valid (migration).
- VIP one-scan links and license key hashes persist on a Render Disk (`DATA_DIR`), surviving redeploys.
- Structured, level-based logging with per-scan correlation IDs; full scan URLs are never logged (host only), secrets are masked.

## Important information

SiteScanner Pro provides automated analysis and recommendations. Results are intended as a starting point and should be reviewed by a qualified developer before production changes are made. A scan cannot replace a complete security, accessibility, legal, or performance audit.

## Contact

For support and business enquiries: **bynrnworld@gmail.com**

## License

SiteScanner Pro is released under the Creative Commons Attribution-NonCommercial 4.0 International Public License. Commercial use requires separate written permission from the copyright holder. See [LICENSE](LICENSE) for the complete license terms.

---

☕ **Get lifetime Pro access**: [Buy SiteScanner Pro on Ko-fi 💜](https://ko-fi.com/s/b525e21531)

Created by ❤️ © nRn World
