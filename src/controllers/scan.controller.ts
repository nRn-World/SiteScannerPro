import { Request, Response } from 'express';
import { ScannerService } from '../services/scanner.service';
import { ScanResult } from '../rules/types';

const PRIVATE_HOST_PATTERN = /^(localhost$|.*\.localhost$|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0$|\[::1?\]?$|::1$)/;
const DESCRIPTION_TEASER_LENGTH = 90;

function validateTargetUrl(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (PRIVATE_HOST_PATTERN.test(hostname)) {
    return null;
  }

  return parsed.toString();
}

/**
 * Förkortar en beskrivning till en teaser så att gratisanvändaren förstår
 * vad problemet är men inte får hela lösningsbeskrivningen.
 */
function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_TEASER_LENGTH) {
    return description;
  }
  const cutoff = description.slice(0, DESCRIPTION_TEASER_LENGTH);
  const lastSpace = cutoff.lastIndexOf(' ');
  return `${cutoff.slice(0, lastSpace > 40 ? lastSpace : DESCRIPTION_TEASER_LENGTH).trimEnd()}…`;
}

export class ScanController {
  private scannerService: ScannerService;

  constructor() {
    this.scannerService = new ScannerService();
  }

  /**
   * Hämtar målwebbplatsen och kör den lokala analysmotorn.
   * Kostnad: 0 kr - allt körs på egen server.
   */
  private async fetchAndScan(targetUrl: string): Promise<ScanResult> {
    const startTime = Date.now();

    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteScannerBot/1.0)' },
      signal: AbortSignal.timeout(20000),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Webbplatsen svarade med status ${response.status}`);
    }

    const html = await response.text();
    const loadTime = Date.now() - startTime;

    const context = {
      loadTime,
      isHttps: targetUrl.startsWith('https://'),
      headers: response.headers as unknown as Headers
    };

    return this.scannerService.scan(html, context);
  }

  /**
   * Tar bort alla lösningsdelar innan resultatet skickas till
   * gratisanvändare - det enda sättet att garantera att lösningarna
   * aldrig läcker är att de aldrig skickas från servern.
   */
  private toPublicResult(result: ScanResult): ScanResult {
    return {
      overallScore: result.overallScore,
      summary: result.summary,
      metrics: result.metrics,
      issues: result.issues.map((issue) => ({
        category: issue.category,
        severity: issue.severity,
        title: issue.title,
        description: truncateDescription(issue.description)
      }))
    };
  }

  public scanFree = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;

      const targetUrl = typeof url === 'string' ? validateTargetUrl(url) : null;
      if (!targetUrl) {
        res.status(400).json({ error: 'Ogiltig URL. Endast publika http(s)-adresser kan skannas.' });
        return;
      }

      // Artificial delay for UX (matching the scanning animation)
      await new Promise(resolve => setTimeout(resolve, 8000));

      const result = await this.fetchAndScan(targetUrl);
      res.json(this.toPublicResult(result));
    } catch (error: any) {
      console.error('Free scan error:', error);
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({ error: 'Webbplatsen svarade inte inom tidsgränsen.' });
        return;
      }
      res.status(500).json({ error: `Analys misslyckades: ${error.message}` });
    }
  };

  /**
   * Pro-djupläge: samma lokala motor men med fullständiga lösningar
   * (rekommendationer + kodexempel) med kortare väntetid. Kräver giltig
   * licens-token via requireLicense-middleware.
   */
  public scanPremium = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;

      const targetUrl = typeof url === 'string' ? validateTargetUrl(url) : null;
      if (!targetUrl) {
        res.status(400).json({ error: 'Ogiltig URL. Endast publika http(s)-adresser kan skannas.' });
        return;
      }

      // Pro-användare får kortare väntetid
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = await this.fetchAndScan(targetUrl);
      res.json(result);
    } catch (error: any) {
      console.error('Premium scan error:', error);
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({ error: 'Webbplatsen svarade inte inom tidsgränsen.' });
        return;
      }
      res.status(500).json({ error: `Analys misslyckades: ${error.message}` });
    }
  };
}
