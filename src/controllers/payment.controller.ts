import { Request, Response } from 'express';
import { LicenseService } from '../services/license.service';

const DEFAULT_KOFI_PRO_URL = 'https://ko-fi.com/nrnworld';

export class PaymentController {
  private licenseService: LicenseService;

  constructor() {
    this.licenseService = new LicenseService();
  }

  // Arrow-egenskaper krävs - Express anropar handlern utan klasskontext
  public createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const url = process.env.KOFI_PRO_URL || DEFAULT_KOFI_PRO_URL;
      res.json({ url });
    } catch (error: any) {
      console.error('Ko-fi checkout error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Aktiverar en Ko-fi Pro-kod. Ko-fi visar plaintext-koden efter köp;
   * servern jämför bara dess hash och returnerar digesten som Pro-token.
   */
  public verifyLicense = async (req: Request, res: Response): Promise<void> => {
    try {
      const licenseKey = req.body?.licenseKey || req.body?.token;

      if (!licenseKey || typeof licenseKey !== 'string') {
        res.status(400).json({ error: 'Ange en Pro-licenskod.' });
        return;
      }

      const license = await this.licenseService.validateLicense(licenseKey);
      if (!license) {
        res.status(403).json({ error: 'Ogiltig Pro-licenskod.' });
        return;
      }

      res.json({
        licensed: true,
        token: license.sessionId,
        createdAt: license.createdAt,
        source: license.source ?? 'ko-fi'
      });
    } catch (error: any) {
      console.error('Verify license error:', error);
      res.status(500).json({ error: 'Kunde inte verifiera Pro-licensen.' });
    }
  };

  public verifySession = this.verifyLicense;
}
