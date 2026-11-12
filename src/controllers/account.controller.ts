import { Request, Response } from 'express';
import {
  loginUser,
  registerUser,
  removeSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS
} from '../services/accountStore.service';

function isSecureRequest(req: Request): boolean {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  return req.secure || forwardedProto === 'https';
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const origin = req.get('origin');
  const hostOrigin = `${isSecureRequest(req) ? 'https' : req.protocol}://${req.get('host') || 'localhost'}`;
  const crossSite = !!origin && origin !== hostOrigin;
  const secure = isSecureRequest(req) || crossSite;

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure,
    path: '/',
    maxAge: SESSION_MAX_AGE_MS
  });
}

function bodyString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export class AccountController {
  /** POST /api/auth/register */
  public register = (req: Request, res: Response): void => {
    const result = registerUser(bodyString(req.body?.email), bodyString(req.body?.password));

    res.setHeader('Cache-Control', 'no-store');
    if (result.ok === false) {
      const status = result.error === 'email_taken' ? 409 : 400;
      res.status(status).json({ error: result.error });
      return;
    }

    setSessionCookie(req, res, result.token);
    res.status(201).json({ user: result.user });
  };

  /** POST /api/auth/login */
  public login = (req: Request, res: Response): void => {
    const result = loginUser(bodyString(req.body?.email), bodyString(req.body?.password));

    res.setHeader('Cache-Control', 'no-store');
    if (!result) {
      res.status(401).json({ error: 'invalid_credentials' });
      return;
    }

    setSessionCookie(req, res, result.token);
    res.json({ user: result.user });
  };

  /** POST /api/auth/logout */
  public logout = (req: Request, res: Response): void => {
    removeSession(req.sessionToken);
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true });
  };

  /** GET /api/auth/me */
  public me = (req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.json({ user: req.user ?? null });
  };
}
