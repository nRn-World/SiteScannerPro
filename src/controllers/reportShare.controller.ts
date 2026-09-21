import { Request, Response } from 'express';
import { createShareToken, decodeShareToken } from '../services/reportShare.service';
import { createLogger } from '../utils/logger';

const log = createLogger('report-share');

export class ReportShareController {
  /** POST /api/reports/share – skapar signerad delbar länk (gratis, inget konto). */
  public createShare = async (req: Request, res: Response): Promise<void> => {
    try {
      const url = typeof req.body?.url === 'string' ? req.body.url : '';
      const score = Number(req.body?.score);
      const metrics = req.body?.metrics;

      if (!url || !Number.isFinite(score)) {
        res.status(400).json({ error: 'url och score krävs.' });
        return;
      }

      const share = createShareToken({
        url,
        score,
        metrics: {
          seo: Number(metrics?.seo ?? 0),
          performance: Number(metrics?.performance ?? 0),
          security: Number(metrics?.security ?? 0),
          accessibility: Number(metrics?.accessibility ?? 0),
          code: Number(metrics?.code ?? 0)
        }
      });

      res.json(share);
    } catch (error: any) {
      log.error('Share create failed', { error: error?.message });
      res.status(500).json({ error: 'Kunde inte skapa delbar länk.' });
    }
  };

  /** GET /api/reports/:token – hämtar signerad rapportdata. */
  public getShared = async (req: Request, res: Response): Promise<void> => {
    const token = String(req.params.token || '');
    const payload = decodeShareToken(token);
    if (!payload) {
      res.status(404).json({ error: 'Rapporten finns inte eller har gått ut.' });
      return;
    }
    res.json({ report: payload });
  };

  /**
   * GET /api/badge/:token.svg – FAS 3.3: inbäddningsbar badge.
   * Varje badge är en inkommande länk till produktens sida.
   */
  public badgeSvg = async (req: Request, res: Response): Promise<void> => {
    const token = String(req.params.token || '');
    const payload = decodeShareToken(token);
    if (!payload) {
      res.status(404).type('image/svg+xml').send(badgeSvg('SiteScanner', 'invalid', '#6B6B66'));
      return;
    }

    const color =
      payload.score >= 80 ? '#16a34a' : payload.score >= 50 ? '#d97706' : '#dc2626';
    const label = payload.host.length > 28 ? `${payload.host.slice(0, 27)}…` : payload.host;

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*'); // SVG-badge får bäddas in varifrån som helst
    res.type('image/svg+xml').send(badgeSvg(label, `${payload.score}/100`, color));
  };
}

function badgeSvg(left: string, right: string, color: string): string {
  const leftWidth = 10 + left.length * 7.2;
  const rightWidth = 10 + right.length * 8.2;
  const total = Math.round(leftWidth + rightWidth);
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${escape(left)}: ${escape(right)}">
  <title>Scanned by SiteScanner Pro: ${escape(right)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${Math.round(leftWidth)}" height="20" fill="#0A0A0A"/>
    <rect x="${Math.round(leftWidth)}" width="${Math.round(rightWidth)}" height="20" fill="${color}"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${Math.round(leftWidth / 2)}" y="14">${escape(left)}</text>
    <text x="${Math.round(leftWidth + rightWidth / 2)}" y="14">${escape(right)}</text>
  </g>
</svg>`;
}
