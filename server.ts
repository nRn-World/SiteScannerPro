import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import apiRouter from "./src/routes/api.routes";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!process.env.CORS_ORIGIN) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-license-token');
    res.setHeader('Access-Control-Expose-Headers', 'X-Vip-Consumed');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json());

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
      server: { middlewareMode: true },
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
