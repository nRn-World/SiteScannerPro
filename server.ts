import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import apiRouter from "./src/routes/api.routes";
import { createLogger } from "./src/utils/logger";
import { getScanConcurrency, ScanQueue } from "./src/utils/scanQueue";
import { getReport } from "./src/services/reportStore.service";
import { injectReportMeta } from "./src/utils/reportHtml";
import { getComparison } from "./src/services/comparisonStore.service";
import { injectComparisonMeta } from "./src/utils/comparisonHtml";
import { startMonitorScheduler } from "./src/services/monitorScheduler.service";

const log = createLogger('server');

// Google Fonts is the only third-party style/font source. Screenshots and the
// inline favicon use data URLs, while saved-report screenshots are served from
// the API origin. Scripts are restricted to the app bundle with no inline or
// eval allowance.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'"
].join('; ');

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.disable('x-powered-by');
  // Render/Vercel terminate TLS in front of Express; trust their proxy headers
  // so share links and screenshot URLs use the public https origin.
  app.set('trust proxy', 1);

  const defaultOrigins = [
    'https://nrnworld.one',
    'https://www.nrnworld.one',
    'https://nrn-world.github.io',
    'https://sitescannerpro-ten.vercel.app'
  ];
  const allowedOrigins = [
    ...defaultOrigins,
    ...(process.env.CORS_ORIGIN || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  ];

  // FAS 1.6: ingen wildcard-fallback. Saknas matchande origin utelämnas
  // CORS-headern helt, så webbläsaren blockerar anropet själv.
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Retry-After');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  // Browser mutations must come from an allowed application origin. Requests
  // without an Origin header (curl, server-to-server) remain available.
  app.use('/api', (req, res, next) => {
    const isMutation = ['POST', 'PATCH', 'DELETE'].includes(req.method);
    const origin = req.headers.origin;
    if (!isMutation || !origin) {
      next();
      return;
    }

    const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const selfOrigin = `${forwardedProto || req.protocol}://${req.get('host') || 'localhost'}`;
    if (origin !== selfOrigin && !allowedOrigins.includes(origin)) {
      res.status(403).json({ error: 'origin_not_allowed' });
      return;
    }
    next();
  });

  // FAS 5.4: hälsokontroll för övervakning (utanför rate limiting)
  app.get("/api/health", (_req, res) => {
    const mem = process.memoryUsage();
    res.json({
      status: "ok",
      uptimeSeconds: Math.round(process.uptime()),
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
      },
      queue: {
        waiting: scanQueue.waiting,
        running: scanQueue.running,
        concurrency: getScanConcurrency()
      }
    });
  });

  // FAS 5.3: strukturerad loggning av inkommande API-anrop (host only)
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api/')) {
      log.info('request', { method: req.method, path: req.path });
    }
    next();
  });

  // API Routes
  app.use("/api", apiRouter);

  // Unknown API routes must return a JSON 404 instead of falling through to
  // the SPA (which would answer with HTML and HTTP 200).
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  const appUrl = (process.env.APP_URL || '').toLowerCase();
  const isLocalApp =
    appUrl.includes('localhost') ||
    appUrl.includes('127.0.0.1') ||
    appUrl.includes('[::1]');
  const useViteDev =
    process.env.USE_PRODUCTION_BUILD !== 'true' &&
    (process.env.NODE_ENV !== 'production' || isLocalApp);

  if (useViteDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Own HMR port so multiple Vite dev servers can run locally at once
        hmr: { port: Number(process.env.HMR_PORT) || PORT + 1 },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexFile = path.join(distPath, "index.html");

    // Enforce CSP only for the production SPA. Vite's dev client needs inline
    // scripts and a WebSocket connection, so development keeps its own mode.
    app.use((_req, res, next) => {
      res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      next();
    });

    // Saved-report permalinks get report-specific title/OG/canonical metadata
    // when the app is served by this Express process (Render/custom domain).
    app.get("/r/:id", (req, res) => {
      const report = getReport(String(req.params.id || ''));

      if (!report) {
        res.status(404).type("html").sendFile(indexFile);
        return;
      }

      try {
        const html = fs.readFileSync(indexFile, "utf8");
        const origin = `${req.protocol}://${req.get("host") || "localhost"}`;
        res.status(200).type("html").send(injectReportMeta(html, report, origin));
      } catch (error) {
        log.warn('report meta injection failed', { error: (error as Error)?.message });
        res.sendFile(indexFile);
      }
    });

    // Saved competitor comparisons get the same server-rendered sharing
    // metadata treatment as saved reports.
    app.get("/c/:id", (req, res) => {
      const comparison = getComparison(String(req.params.id || ''));

      if (!comparison) {
        res.status(404).type("html").sendFile(indexFile);
        return;
      }

      try {
        const html = fs.readFileSync(indexFile, "utf8");
        const origin = `${req.protocol}://${req.get("host") || "localhost"}`;
        res.status(200).type("html").send(injectComparisonMeta(html, comparison, origin));
      } catch (error) {
        log.warn('comparison meta injection failed', { error: (error as Error)?.message });
        res.sendFile(indexFile);
      }
    });

    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Vite's generated asset filenames are content-hashed and safe to cache long-term.
        if (
          filePath.includes(`${path.sep}assets${path.sep}`) &&
          /-[\w-]{8,}\./.test(path.basename(filePath))
        ) {
          res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
          return;
        }
        res.setHeader(
          "Cache-Control",
          "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
        );
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader(
        "Cache-Control",
        "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
      );
      res.sendFile(indexFile);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    log.info(`Server running on http://localhost:${PORT}`);
    startMonitorScheduler();
  });
}

/** Global skanningskö med begränsad samtidighet – skapas i separat modul för testbarhet. */
import { scanQueue } from "./src/services/scanQueue.instance";

startServer();
