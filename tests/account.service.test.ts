import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitescanner-account-'));
process.env.DATA_DIR = tempDir;

after(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

const {
  registerUser,
  loginUser,
  getUserForSession,
  removeSession
} = await import('../src/services/accountStore.service');

test('registerUser creates an account and a working session', () => {
  const result = registerUser('Person@Example.com', 'TestPassword123');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.user.email, 'person@example.com');
  assert.equal(getUserForSession(result.token)?.id, result.user.id);

  const stored = fs.readFileSync(path.join(tempDir, 'accounts.json'), 'utf8');
  assert.ok(!stored.includes('TestPassword123'));
  assert.ok(stored.includes('scrypt$'));
});

test('loginUser rejects wrong passwords and accepts the right one', () => {
  assert.equal(loginUser('person@example.com', 'wrong-password'), null);

  const login = loginUser('person@example.com', 'TestPassword123');
  assert.ok(login);
  assert.equal(login.user.email, 'person@example.com');
  assert.equal(getUserForSession(login.token)?.email, 'person@example.com');

  removeSession(login.token);
  assert.equal(getUserForSession(login.token), null);
});

test('registerUser rejects duplicate emails case-insensitively', () => {
  const duplicate = registerUser('PERSON@example.com', 'AnotherPassword123');
  assert.equal(duplicate.ok, false);
  if (!duplicate.ok) assert.equal(duplicate.error, 'email_taken');
});

test('registerUser validates email and password length', () => {
  const badEmail = registerUser('not-an-email', 'TestPassword123');
  assert.equal(badEmail.ok, false);
  if (!badEmail.ok) assert.equal(badEmail.error, 'invalid_email');

  const weakPassword = registerUser('valid@example.com', 'short');
  assert.equal(weakPassword.ok, false);
  if (!weakPassword.ok) assert.equal(weakPassword.error, 'weak_password');
});
