<div align="center">

# SiteScanner Pro

**See what is holding your website back.**

Analyze any public website across SEO, performance, security, accessibility, and code quality — in seconds.

[![Deploy Status](https://github.com/nRn-World/SiteScannerPro/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/nRn-World/SiteScannerPro/actions/workflows/deploy-pages.yml)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

**[Launch SiteScanner Pro →](https://nrnworld.one/SiteScannerPro/)**

</div>

---

## About

SiteScanner Pro is a free website health analysis service for businesses, freelancers, creators, and web agencies. Enter a public URL and get a clear, prioritized report of what can be improved — no guesswork, no complicated dashboards.

The analysis engine is a deterministic rule-based scanner: it fetches the page, evaluates measurable technical signals, and turns each finding into a prioritized issue with a practical recommendation and a ready-to-use code fix.

The service is completely free. There is no paywall, licence, checkout, VIP link, subscription or locked feature. Every scan returns the complete result.

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
4. Act on prioritized recommendations, exact code solutions and agent-ready fix JSON.

## Included for everyone

| Feature | Included |
|---|---|
| Deep website health scan (headless Chrome) | ✓ |
| Overall score, categories and issue details | ✓ |
| Complete recommendations and code solutions | ✓ |
| Agent fix JSON | ✓ |
| Issue screenshots | ✓ |
| Competitor comparison | ✓ |
| Shareable saved reports and PDF export | ✓ |
| Accounts and website monitoring | ✓ |

## Features

- Multilingual interface: English, Svenska, Türkçe, Español, Français, العربية
- PDF export of analysis reports
- Local scan history (stored in your browser, never sold)
- Anonymous scanning — no account required
- Optional account for monitoring and report history
- Responsive design for desktop and mobile

## Built with

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons
- **Backend:** Node.js, Express, Cheerio
- **Email:** Nodemailer

### Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Frontend (static)  │  HTTPS  │   Backend API        │
│  GitHub Pages       │ ──────> │   Render (Node)      │
│  nrn-world.github.io│ <────── │   sitescanner-pro    │
└─────────────────────┘         │                      │
                                │   • Scan engine      │
                                │   • Saved reports    │
                                │   • Accounts         │
                                │   • Monitoring       │
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
LICENSE_SIGNING_SECRET=""             # Signs share links, minimum 32 random characters
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

### Useful scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Vite middleware + Express) |
| `npm run build` | Build frontend + prerender SEO meta into `dist/` |
| `npm start` | Serve production build |
| `npm run lint` | Type-check with TypeScript |
| `npm test` | Run unit tests (full scan/report results, share links, contact mail, navigation, SSRF) |

## Deployment

This project deploys automatically on push to `main`:

- **Frontend** → GitHub Pages via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) (configured with `VITE_PUBLIC_BASE` and `VITE_API_BASE`)
- **Backend** → Render via [`render.yaml`](render.yaml) Blueprint (Node web service)

Environment variables used in production: `LICENSE_SIGNING_SECRET` (for share-link signatures), `APP_URL`, `CORS_ORIGIN`, `DATA_DIR` (persistent disk for saved reports and accounts), `LOG_LEVEL`, `MAX_CONCURRENT_SCANS`, `MAX_CONCURRENT_PAGES`, `REPORT_SHARE_TTL_DAYS`.

### Security & reliability

- Rate limiting per IP on scan/contact/account endpoints — returns `429` with `Retry-After`.
- Global scan queue with bounded Puppeteer concurrency (`MAX_CONCURRENT_PAGES`).
- SSRF protection: DNS resolution validated against private/link-local ranges (incl. IPv4-mapped IPv6 and decimal notation) before fetching.
- CORS has no wildcard fallback: unknown origins receive no `Access-Control-Allow-Origin` header.
- Saved reports and share links are signed server-side with `LICENSE_SIGNING_SECRET`; no personal data is embedded in a share token.
- Structured, level-based logging with per-scan correlation IDs; full scan URLs are never logged (host only), secrets are masked.

## Important information

SiteScanner Pro provides automated analysis and recommendations. Results are intended as a starting point and should be reviewed by a qualified developer before production changes are made. A scan cannot replace a complete security, accessibility, legal, or performance audit.

## Contact

For support and business enquiries: **bynrnworld@gmail.com**

## License

SiteScanner Pro is released under the Creative Commons Attribution-NonCommercial 4.0 International Public License. Commercial use requires separate written permission from the copyright holder. See [LICENSE](LICENSE) for the complete license terms.

---

Created by ❤️ © nRn World
