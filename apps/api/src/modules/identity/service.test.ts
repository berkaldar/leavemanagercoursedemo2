import { beforeEach, describe, expect, it } from 'vitest';
import type { Clock } from '../../shared/clock.ts';
import { NotAuthenticatedError } from '../../shared/errors.ts';
import type { IdentityRepo, SessionRow, UserRow } from './repo.ts';
import { identityService, requiresSession, type IdentityService } from './service.ts';

function fakeRepo(): IdentityRepo {
  const users: UserRow[] = [];
  const sessions = new Map<string, SessionRow>();
  return {
    findUserByEmail: (email) => users.find((u) => u.email === email),
    findUserById: (id) => users.find((u) => u.id === id),
    insertUser: (email, fullName, passwordHash) => {
      users.push({ id: users.length + 1, email, fullName, passwordHash });
    },
    insertSession: (tokenHash, userId, createdAt) => {
      sessions.set(tokenHash, { userId, createdAt });
    },
    findSession: (tokenHash) => sessions.get(tokenHash),
    deleteSession: (tokenHash) => {
      sessions.delete(tokenHash);
    },
  };
}

// A clock whose instant the test moves forward.
function movableClock(start: string): Clock & { set(iso: string): void } {
  let instant = start;
  return {
    today: () => instant.slice(0, 10),
    now: () => instant,
    set: (iso) => {
      instant = iso;
    },
  };
}

const SIGN_IN_AT = '2026-11-14T09:00:00.000Z';
let clock: ReturnType<typeof movableClock>;
let identity: IdentityService;

beforeEach(async () => {
  clock = movableClock(SIGN_IN_AT);
  identity = identityService(fakeRepo(), clock);
  await identity.ensureUser('alex.sample@example.com', 'Alex Sample', 'demo-pass-1');
  await identity.ensureUser('morgan.example@example.com', 'Morgan Example', 'demo-pass-2');
});

const expectInvalidCredentials = async (attempt: Promise<unknown>) => {
  const error: unknown = await attempt.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(NotAuthenticatedError);
  expect(error).toMatchObject({
    code: 'INVALID_CREDENTIALS',
    message: 'Email or password is incorrect.',
  });
};

describe('sign in', () => {
  it('correct credentials → a session for that user (AC-2)', async () => {
    const { token, user } = await identity.signIn('alex.sample@example.com', 'demo-pass-1');
    expect(user.fullName).toBe('Alex Sample');
    expect(identity.currentUser(token)?.fullName).toBe('Alex Sample');
  });

  it('email ignores case and surrounding spaces (AC-3)', async () => {
    const { user } = await identity.signIn('  Alex.Sample@EXAMPLE.com ', 'demo-pass-1');
    expect(user.fullName).toBe('Alex Sample');
  });

  it('password is case-sensitive (AC-3)', async () => {
    await expectInvalidCredentials(identity.signIn('alex.sample@example.com', 'Demo-pass-1'));
  });

  it('every failure is the same INVALID_CREDENTIALS error (AC-4)', async () => {
    await expectInvalidCredentials(identity.signIn('alex.sample@example.com', 'wrong'));
    await expectInvalidCredentials(identity.signIn('nobody@example.com', 'demo-pass-1'));
    await expectInvalidCredentials(identity.signIn('not an address', 'demo-pass-1'));
    await expectInvalidCredentials(identity.signIn(`${'a'.repeat(243)}@example.com`, 'x'));
    await expectInvalidCredentials(
      identity.signIn('alex.sample@example.com', 'demo-pass-1' + 'x'.repeat(118)),
    );
  });

  it('accepts inputs exactly at the length limits (AC-4 boundary)', async () => {
    const email = `${'b'.repeat(242)}@example.com`; // 254 characters
    const password = 'p'.repeat(128);
    await identity.ensureUser(email, 'Long Name', password);
    const { user } = await identity.signIn(email, password);
    expect(user.fullName).toBe('Long Name');
  });
});

describe('current user', () => {
  it('no token or an unknown token → no user (AC-1, AC-11)', () => {
    expect(identity.currentUser(undefined)).toBeUndefined();
    expect(identity.currentUser('made-up-token')).toBeUndefined();
  });

  it('a session stays valid just under 8 hours (AC-8, AC-10)', async () => {
    const { token } = await identity.signIn('alex.sample@example.com', 'demo-pass-1');
    clock.set('2026-11-14T16:59:59.999Z');
    expect(identity.currentUser(token)?.fullName).toBe('Alex Sample');
  });

  it('a session ends at exactly 8 hours (AC-10)', async () => {
    const { token } = await identity.signIn('alex.sample@example.com', 'demo-pass-1');
    clock.set('2026-11-14T17:00:00.000Z');
    expect(identity.currentUser(token)).toBeUndefined();
    clock.set(SIGN_IN_AT);
    expect(identity.currentUser(token)).toBeUndefined(); // ended for good, not just hidden
  });
});

describe('sign out', () => {
  it('ends that session for good, and only that one (AC-9)', async () => {
    const first = await identity.signIn('alex.sample@example.com', 'demo-pass-1');
    const second = await identity.signIn('alex.sample@example.com', 'demo-pass-1');
    identity.signOut(first.token);
    expect(identity.currentUser(first.token)).toBeUndefined();
    expect(identity.currentUser(second.token)?.fullName).toBe('Alex Sample');
  });

  it('without a token does nothing', () => {
    expect(() => identity.signOut(undefined)).not.toThrow();
  });
});

describe('default-deny', () => {
  it('only POST /login and GET /health are public (AC-11)', () => {
    expect(requiresSession('POST', '/login')).toBe(false);
    expect(requiresSession('GET', '/health')).toBe(false);
    expect(requiresSession('GET', '/health?x=1')).toBe(false);
    expect(requiresSession('GET', '/me')).toBe(true);
    expect(requiresSession('POST', '/logout')).toBe(true);
    expect(requiresSession('GET', '/login')).toBe(true);
    expect(requiresSession('POST', '/health')).toBe(true);
    expect(requiresSession('GET', '/anything-else')).toBe(true);
  });
});
