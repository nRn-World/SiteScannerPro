import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import apiRouter from "./src/routes/api.routes";
import { createLogger } from "./src/utils/logger";
import { getScanConcurrency, ScanQueue } from "./src/utils/scanQueue";

const log = createLogger('server');

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.disable('x-powered-by');

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
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-license-token');
    res.setHeader('Access-Control-Expose-Headers', 'X-Vip-Consumed, Retry-After');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json({ limit: '1mb' }));

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
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    log.info(`Server running on http://localhost:${PORT}`);
  });
}

/** Global skanningskö (Pro prioriteras) – skapas i separat modul för testbarhet. */
import { scanQueue } from "./src/services/scanQueue.instance";

startServer();
