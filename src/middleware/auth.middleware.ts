import { Request, Response, NextFunction } from 'express';
import { LicenseRecord, LicenseService } from '../services/license.service';
import { VipService } from '../services/vip.service';

const licenseService = new LicenseService();
const vipService = new VipService();

declare global {
  namespace Express {
    interface Request {
      license?: LicenseRecord;
    }
  }
}

export function requireLicense(req: Request, res: Response, next: NextFunction): void {
  const token = req.header('x-license-token') || '';

  licenseService
    .validateLicense(token)
    .then((license) => {
      if (!license) {
        res.status(403).json({ error: 'Giltig Pro-licens krävs.' });
        return;
      }

      if (license.kind === 'vip' || license.source === 'vip') {
        const vipId = license.vipId;
        if (!vipId || !vipService.isAvailable(vipId)) {
          res.status(403).json({ error: 'VIP-länken är redan använd.' });
          return;
        }
      }

      req.license = license;
      next();
    })
    .catch(() => {
      res.status(500).json({ error: 'Kunde inte verifiera licensen.' });
    });
}
