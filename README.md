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

The analysis engine combines a deterministic rule-based scanner with AI-assisted interpretation. Measurable issues are caught by rules; context, prioritization, and ready-to-use code fixes are added by AI.

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
| Priority scan queue | — | ✓ |

Premium is a **one-time purchase (99 SEK, lifetime access)** — no subscription. Payments are handled securely by [Stripe](https://stripe.com).

## Features

- Multilingual interface: English, Svenska, Türkçe, Español, Français, العربية
- PDF export of analysis reports
- Local scan history (stored in your browser, never sold)
- Anonymous scanning — no account required
- Responsive design for desktop and mobile

## Built with

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons
- **Backend:** Node.js, Express, Cheerio
- **Payments:** Stripe Checkout
- **Email:** Nodemailer

### Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Frontend (static)  │  HTTPS  │   Backend API        │
│  GitHub Pages       │ ──────> │   Render (Node)      │
│  nrn-world.github.io│ <────── │   sitescanner-pro    │
└─────────────────────┘         │                      │
                                │   • Scan engine      │
        Stripe Checkout ───────>│   • Stripe payments  │
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
STRIPE_SECRET_KEY="sk_test_..."      # Required for payments (test key starts with sk_test_)
APP_URL="http://localhost:3000"      # Address used for Stripe checkout return
EMAIL_USER="..."                     # Optional: Gmail for contact form
EMAIL_PASS="..."                     # Optional: Gmail app password
CONTACT_RECEIVER_EMAIL="..."         # Optional: Where contact emails are sent
```

```bash
# 4. Start the dev server (frontend + backend on one port)
npm run dev
```

Open http://localhost:3000. For testing payments, use Stripe's test card `4242 4242 4242 4242` with any future expiry and CVC.

### Useful scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Vite middleware + Express) |
| `npm run build` | Build frontend to `dist/` |
| `npm start` | Serve production build |
| `npm run lint` | Type-check with TypeScript |

## Deployment

This project deploys automatically on push to `main`:

- **Frontend** → GitHub Pages via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) (configured with `VITE_PUBLIC_BASE` and `VITE_API_BASE`)
- **Backend** → Render via [`render.yaml`](render.yaml) Blueprint (Node web service)

Environment variables used in production: `STRIPE_SECRET_KEY`, `APP_URL`, `CORS_ORIGIN`.

## Important information

SiteScanner Pro provides automated analysis and recommendations. Results are intended as a starting point and should be reviewed by a qualified developer before production changes are made. A scan cannot replace a complete security, accessibility, legal, or performance audit.

## Contact

For support and business enquiries: **bynrnworld@gmail.com**

## License

SiteScanner Pro is released under the Creative Commons Attribution-NonCommercial 4.0 International Public License. Commercial use requires separate written permission from the copyright holder. See [LICENSE](LICENSE) for the complete license terms.

---

☕ **Support development**: [Buy me a coffee 💜](https://ko-fi.com/nrnworld)

Created by ❤️ © nRn World
