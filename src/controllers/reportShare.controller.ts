import { Request, Response } from 'express';
import { createShareToken, decodeShareToken } from '../services/reportShare.service';
import { getReport, getReportAsset } from '../services/reportStore.service';
import { LicenseService } from '../services/license.service';
import { isDevServer } from '../utils/devMode.server';
import { toPublicResult } from '../utils/reportPresenter';
import { createLogger } from '../utils/logger';

const log = createLogger('report-share');
const licenseService = new LicenseService();

export class ReportShareController {
  /**
   * POST /api/reports/:id/share
   * Creates a share link and badge token from a report that is already stored
   * on the server. The client can no longer supply its own score.
   */
  public createShare = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportId = String(req.params.id || '');
      const report = getReport(reportId);

      if (!report) {
        res.status(404).json({ error: 'Rapporten finns inte eller har gått ut.' });
        return;
      }

      const share = createShareToken({
        reportId: report.id,
        url: report.url,
        score: report.result.overallScore,
        metrics: report.result.metrics
      });

      res.json({
        ...share,
        reportId: report.id,
        badgeUrlPath: `/api/badge/${encodeURIComponent(share.token)}.svg`,
        rulesetVersion: report.rulesetVersion,
        createdAt: report.createdAt
      });
    } catch (error: any) {
      log.error('Share create failed', { error: error?.message });
      res.status(500).json({ error: 'Kunde inte skapa delbar länk.' });
    }
  };

  /**
   * GET /api/reports/:id
   * Full saved report. Paid fields are only included for a valid Pro/VIP token.
   */
  public getReport = async (req: Request, res: Response): Promise<void> => {
    const report = getReport(String(req.params.id || ''));

    if (!report) {
      res.status(404).json({ error: 'Rapporten finns inte eller har gått ut.' });
      return;
    }

    const token = req.header('x-license-token') || '';
    let unlocked = isDevServer();

    if (!unlocked && token) {
      try {
        const license = await licenseService.validateLicense(token);
        unlocked = !!license;
      } catch {
        // An invalid or unreadable token simply keeps the report locked.
        unlocked = false;
      }
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.json({
      report: {
        id: report.id,
        createdAt: report.createdAt,
        rulesetVersion: report.rulesetVersion,
        url: report.url,
        host: report.host,
        unlocked
      },
      result: {
        ...(unlocked ? report.result : toPublicResult(report.result)),
        reportId: report.id
      }
    });
  };

  /** GET /api/reports/:id/assets/:file – screenshot files for a saved report. */
  public getAsset = async (req: Request, res: Response): Promise<void> => {
    const asset = getReportAsset(String(req.params.id || ''), String(req.params.file || ''));

    if (!asset) {
      res.status(404).end();
      return;
    }

    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.type(asset.contentType).sendFile(asset.filePath);
  };

  /** Legacy signed-token endpoint (kept for already-issued links). */
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
   * GET /api/badge/:token.svg – embeddable badge.
   * The token can only be minted by the server from a stored report.
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
