import { Request, Response } from 'express';
import { VipService } from '../services/vip.service';

const DEFAULT_SHARE_BASE = 'https://nrnworld.one/SiteScannerPro/';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.RENDER;
}

function getShareBaseUrl(): string {
  // Delningslänkar ska alltid peka på livesajten, även när de skapas lokalt.
  const raw =
    (process.env.VIP_SHARE_BASE_URL || '').trim() ||
    DEFAULT_SHARE_BASE;
  const base = raw.endsWith('/') ? raw : `${raw}/`;
  // Skydda mot att lokalt APP_URL råkar bli delningsbas
  if (/localhost|127\.0\.0\.1/i.test(base)) {
    return DEFAULT_SHARE_BASE;
  }
  return base;
}

function buildShareUrl(code: string): string {
  const base = getShareBaseUrl().replace(/\/?$/, '/');
  return `${base}?vip=${encodeURIComponent(code)}`;
}

function adminSecretConfigured(): string | null {
  const secret = (process.env.VIP_ADMIN_SECRET || '').trim();
  if (secret.length < 4) {
    return null;
  }
  return secret;
}

export class VipController {
  private vipService = new VipService();

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      // VIP-länkar skapas bara lokalt; redeem/consume körs online.
      if (isProduction()) {
        res.status(403).json({ error: 'VIP-länkar skapas endast lokalt.' });
        return;
      }

      const expected = adminSecretConfigured();
      if (!expected) {
        res.status(503).json({ error: 'VIP_ADMIN_SECRET är inte konfigurerad lokalt.' });
        return;
      }

      const adminSecret = typeof req.body?.adminSecret === 'string' ? req.body.adminSecret : '';
      if (adminSecret !== expected) {
        res.status(403).json({ error: 'Ogiltig admin-hemlighet.' });
        return;
      }

      let count = 1;
      if (req.body?.count !== undefined && req.body?.count !== null) {
        const parsed = Number(req.body.count);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
          res.status(400).json({ error: 'count måste vara ett heltal mellan 1 och 20.' });
          return;
        }
        count = parsed;
      }

      const links = Array.from({ length: count }, () => {
        const link = this.vipService.createLink();
        return {
          code: link.code,
          url: buildShareUrl(link.code)
        };
      });

      res.json({ links });
    } catch (error: any) {
      console.error('VIP create error:', error);
      res.status(500).json({ error: 'Kunde inte skapa VIP-länk.' });
    }
  };

  public redeem = async (req: Request, res: Response): Promise<void> => {
    try {
      const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
      if (!code) {
        res.status(400).json({ error: 'Ange en VIP-kod.' });
        return;
      }

      const status = this.vipService.getStatus(code);
      if (!status) {
        res.status(404).json({ error: 'VIP-länken hittades inte.' });
        return;
      }
      if (status.exhausted || status.scansUsed >= status.scansAllowed) {
        res.status(403).json({ error: 'VIP-länken är redan använd.' });
        return;
      }

      const redeemed = this.vipService.redeem(code);
      if (!redeemed) {
        res.status(403).json({ error: 'VIP-länken är redan använd.' });
        return;
      }

      res.json({
        licensed: true,
        token: redeemed.token,
        source: 'vip',
        scansRemaining: redeemed.scansRemaining
      });
    } catch (error: any) {
      console.error('VIP redeem error:', error);
      res.status(500).json({ error: 'Kunde inte lösa in VIP-länken.' });
    }
  };
}
