import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { AccountUser } from '../types/account';

/**
 * File-based accounts for the self-hosted build.
 *
 * This deliberately has no external auth/email dependency: an account is an
 * email, a scrypt password hash and a random server-side session. The session
 * token is only sent to the browser as an HttpOnly cookie; only its SHA-256
 * hash is persisted.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const ACCOUNTS_PATH = path.join(DATA_DIR, 'accounts.json');
const SESSIONS_PATH = path.join(DATA_DIR, 'account-sessions.json');

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS_PER_USER = 20;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 200;

interface StoredUser extends AccountUser {
  password: string;
}

interface SessionRecord {
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface AccountFile {
  users: StoredUser[];
}

interface SessionFile {
  sessions: SessionRecord[];
}

export type RegisterError = 'invalid_email' | 'weak_password' | 'email_taken' | 'storage';

export type RegisterResult =
  | { ok: true; user: AccountUser; token: string }
  | { ok: false; error: RegisterError };

function ensureDataDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, value: unknown): void {
  ensureDataDir();
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function publicUser(user: StoredUser): AccountUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function encodePassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  return `scrypt$${salt}$${hashPassword(password, salt)}`;
}

function verifyPassword(password: string, encoded: string): boolean {
  const parts = encoded.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt' || !parts[1] || !parts[2]) return false;
  const expected = Buffer.from(parts[2], 'hex');
  const actual = Buffer.from(hashPassword(password, parts[1]), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function readUsers(): StoredUser[] {
  const data = readJson<AccountFile>(ACCOUNTS_PATH, { users: [] });
  return Array.isArray(data?.users) ? data.users : [];
}

function writeUsers(users: StoredUser[]): void {
  writeJson(ACCOUNTS_PATH, { users });
}

function readSessions(): SessionRecord[] {
  const data = readJson<SessionFile>(SESSIONS_PATH, { sessions: [] });
  return Array.isArray(data?.sessions) ? data.sessions : [];
}

function writeSessions(sessions: SessionRecord[]): void {
  writeJson(SESSIONS_PATH, { sessions });
}

function cleanupSessions(sessions: SessionRecord[]): SessionRecord[] {
  const now = Date.now();
  return sessions.filter((session) => Date.parse(session.expiresAt) > now);
}

function createSession(userId: string, sessions: SessionRecord[]): { token: string; sessions: SessionRecord[] } {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const next = cleanupSessions(sessions);

  // Keep the session file bounded if a client logs in repeatedly.
  const userSessions = next.filter((session) => session.userId === userId);
  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    const oldest = userSessions.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0];
    const index = next.indexOf(oldest);
    if (index >= 0) next.splice(index, 1);
  }

  next.push({
    tokenHash: hashToken(token),
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString()
  });

  return { token, sessions: next };
}

export function registerUser(emailInput: string, password: string): RegisterResult {
  const email = normalizeEmail(emailInput);

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, error: 'invalid_email' };
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, error: 'weak_password' };
  }

  try {
    const users = readUsers();
    if (users.some((user) => user.email === email)) {
      return { ok: false, error: 'email_taken' };
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      email,
      createdAt: new Date().toISOString(),
      password: encodePassword(password)
    };

    users.push(user);
    writeUsers(users);

    const session = createSession(user.id, readSessions());
    writeSessions(session.sessions);

    return { ok: true, user: publicUser(user), token: session.token };
  } catch {
    return { ok: false, error: 'storage' };
  }
}

export function loginUser(emailInput: string, password: string): { user: AccountUser; token: string } | null {
  const email = normalizeEmail(emailInput);
  if (!email || !password) return null;

  try {
    const user = readUsers().find((record) => record.email === email);
    if (!user || !verifyPassword(password, user.password)) return null;

    const session = createSession(user.id, readSessions());
    writeSessions(session.sessions);
    return { user: publicUser(user), token: session.token };
  } catch {
    return null;
  }
}

export function getUserForSession(token: string | null | undefined): AccountUser | null {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;

  try {
    const tokenHash = hashToken(token);
    const sessions = readSessions();
    const session = sessions.find((record) => record.tokenHash === tokenHash);
    if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;

    const user = readUsers().find((record) => record.id === session.userId);
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
}

export function removeSession(token: string | null | undefined): void {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return;

  try {
    const tokenHash = hashToken(token);
    const sessions = readSessions().filter((record) => record.tokenHash !== tokenHash);
    writeSessions(cleanupSessions(sessions));
  } catch {
    // Logout is best-effort; the cookie is cleared by the controller regardless.
  }
}

export const SESSION_COOKIE_NAME = 'ssp_session';
export const SESSION_MAX_AGE_MS = SESSION_TTL_MS;
