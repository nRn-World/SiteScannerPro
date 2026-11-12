import { NextFunction, Request, Response } from 'express';
import {
  getUserForSession,
  SESSION_COOKIE_NAME
} from '../services/accountStore.service';
import type { AccountUser } from '../types/account';

declare global {
  namespace Express {
    interface Request {
      user?: AccountUser;
      sessionToken?: string;
    }
  }
}

/** Read the session cookie without adding a cookie-parser dependency. */
export function getSessionToken(req: Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    if (name !== SESSION_COOKIE_NAME) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}

/** Resolve the cookie to an account on every request; never throws. */
export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const token = getSessionToken(req);
  if (token) {
    req.sessionToken = token;
    const user = getUserForSession(token);
    if (user) req.user = user;
  }
  next();
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'auth_required' });
    return;
  }
  next();
}
