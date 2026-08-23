# SiteScannerPro

SiteScannerPro is a focused website analysis platform for developers, agencies,
and small businesses. Enter a public website URL to receive actionable feedback
on SEO, performance, security, accessibility, and code quality.

The product combines deterministic rule-based checks with an optional AI-powered
premium report. It is designed to turn a technical website review into a clear,
prioritized action list.

## Features

- Fast website scans with a structured score and issue list
- Rule-based checks for SEO, performance, security, accessibility, and code
- AI-assisted premium reports with technical recommendations
- Scan history stored locally in the browser
- Swedish-first interface and report output
- Stripe Checkout support for the one-time Premium plan
- Contact form support through the server API
- Responsive React interface with a Vite development workflow

## How It Works

1. The user submits a public website URL.
2. The server fetches the page and passes its HTML and response metadata to the
   scanner engine.
3. The scanner evaluates the page against the built-in rules.
4. Premium users can request an additional AI report through the backend.
5. The frontend presents scores, severity levels, affected areas, and fixes.

## Tech Stack

- React 19 and TypeScript
- Vite with an Express server
- Cheerio for HTML inspection
- Google Gemini for premium analysis
- Stripe Checkout for payments
- Nodemailer for contact messages
- Tailwind CSS and Motion for the interface

## Requirements

- Node.js 18 or newer
- npm

The standard rule-based scan does not require any external API keys.

Optional integrations:

- Gemini API key for premium AI analysis
- Stripe credentials for the Premium checkout
- SMTP credentials for contact form delivery

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
copy .env.example .env
```

No environment variables are required for the standard scanner. To enable the
optional integrations, add the relevant values to `.env`:

```env
# Optional: enables the premium AI report
GEMINI_API_KEY=your_gemini_api_key

# Optional: enables Stripe Checkout
STRIPE_SECRET_KEY=your_stripe_secret_key
APP_URL=http://localhost:3000

# Optional: enables email delivery from the contact form
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_app_password
CONTACT_RECEIVER_EMAIL=you@example.com
```

You can start the application immediately after `npm install` and use the
standard scan without creating a `.env` file.

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

Run the type check and create an optimized frontend build:

```bash
npm run lint
npm run build
```

To serve the production build, set `NODE_ENV=production` and run:

```bash
npm start
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/scan-free` | Run the standard rule-based scan |
| `POST` | `/api/scan-premium` | Generate an AI-assisted premium report |
| `POST` | `/api/create-checkout-session` | Create a Stripe Checkout session |

The scan endpoints accept a JSON body with a `url` property.

## Security Notes

SiteScannerPro is intended for public website analysis. Before production use,
add URL validation, SSRF protection, request timeouts, rate limiting, response
size limits, and authentication for premium access. Keep all API keys in
environment variables and never expose server credentials in the browser.

AI output should be treated as guidance and reviewed by a qualified developer
before changes are deployed to a production website.

## Project Structure

```text
src/
  components/       React UI components
  controllers/      HTTP request handlers
  middleware/       Express middleware
  routes/           API route definitions
  rules/            Deterministic scanning rules and types
  services/         Scanner and supporting services
  App.tsx           Frontend application shell
server.ts           Express and Vite server entry point
```

## Commercial Use

This repository is released under the Creative Commons Attribution-
NonCommercial 4.0 International Public License. Commercial use requires
separate written permission from the copyright holder.

## License

Copyright (c) 2026 SiteScannerPro

Licensed under the Creative Commons Attribution-NonCommercial 4.0 International
Public License. See [LICENSE](LICENSE) for the complete terms.
