import { createHash, randomBytes } from 'node:crypto';
import type { Clock } from '../../shared/clock.ts';
import { NotAuthenticatedError } from '../../shared/errors.ts';
import { hashPassword, verifyPassword } from './password.ts';
import type { IdentityRepo } from './repo.ts';

export const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PASSWORD_LENGTH = 128;

export interface SignedInUser {
  id: number;
  fullName: string;
}

export interface IdentityService {
  /** Returns a new session token; every failure is the same INVALID_CREDENTIALS error. */
  signIn(email: string, password: string): Promise<{ token: string; user: SignedInUser }>;
  /** The user a token belongs to, or undefined when it is missing, unknown, ended or expired. */
  currentUser(token: string | undefined): SignedInUser | undefined;
  signOut(token: string | undefined): void;
  /** Dev seed: creates the user unless the email exists. */
  ensureUser(email: string, fullName: string, password: string): Promise<void>;
}

const invalidCredentials = () =>
  new NotAuthenticatedError('INVALID_CREDENTIALS', 'Email or password is incorrect.');

const normalizeEmail = (email: string) => email.trim().toLowerCase();
// Only the token's hash is stored, so a leaked DB cannot be replayed as cookies (plan 0002, R2).
const hashToken = (token: string) => createHash('sha256').update(token).digest('base64url');

/** Default-deny (docs/security.md): only these two requests need no session. */
export function requiresSession(method: string, url: string): boolean {
  const path = url.split('?')[0];
  return !((method === 'POST' && path === '/login') || (method === 'GET' && path === '/health'));
}

export function identityService(repo: IdentityRepo, clock: Clock): IdentityService {
  // Unknown emails are checked against this too, so timing does not reveal them (plan 0002, R1).
  let dummyHash: Promise<string> | undefined;

  return {
    async signIn(email, password) {
      const normalized = normalizeEmail(email);
      if (normalized.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
        throw invalidCredentials();
      }
      const user = repo.findUserByEmail(normalized);
      dummyHash ??= hashPassword('not-a-real-password');
      const matches = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));
      if (!user || !matches) throw invalidCredentials();

      const token = randomBytes(32).toString('base64url');
      repo.insertSession(hashToken(token), user.id, clock.now());
      return { token, user: { id: user.id, fullName: user.fullName } };
    },

    currentUser(token) {
      if (!token) return undefined;
      const tokenHash = hashToken(token);
      const session = repo.findSession(tokenHash);
      if (!session) return undefined;
      if (Date.parse(clock.now()) - Date.parse(session.createdAt) >= SESSION_LIFETIME_MS) {
        repo.deleteSession(tokenHash);
        return undefined;
      }
      const user = repo.findUserById(session.userId);
      return user && { id: user.id, fullName: user.fullName };
    },

    signOut(token) {
      if (token) repo.deleteSession(hashToken(token));
    },

    async ensureUser(email, fullName, password) {
      const normalized = normalizeEmail(email);
      if (repo.findUserByEmail(normalized)) return;
      repo.insertUser(normalized, fullName, await hashPassword(password));
    },
  };
}
