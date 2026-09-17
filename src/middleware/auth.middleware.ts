import { Request, Response, NextFunction } from 'express';
import { LicenseService } from '../services/license.service';
import { isDevServer, isDevLicenseToken } from '../utils/devMode.server';

const licenseService = new LicenseService();

export function requireLicense(req: Request, res: Response, next: NextFunction): void {
  if (isDevServer()) {
    next();
    return;
  }

  const token = req.header('x-license-token') || '';

  if (isDevLicenseToken(token)) {
    res.status(403).json({ error: 'Giltig Pro-licens krävs.' });
    return;
  }

  licenseService
    .validateLicense(token)
    .then((license) => {
      if (!license) {
        res.status(403).json({ error: 'Giltig Pro-licens krävs.' });
        return;
      }
      next();
    })
    .catch(() => {
      res.status(500).json({ error: 'Kunde inte verifiera licensen.' });
    });
}
