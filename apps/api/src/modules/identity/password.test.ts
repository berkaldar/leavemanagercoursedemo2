import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.ts';

describe('password hashing', () => {
  it('accepts the password it was hashed from', async () => {
    expect(await verifyPassword('demo-pass-1', await hashPassword('demo-pass-1'))).toBe(true);
  });

  it('rejects a different password, including a case change', async () => {
    const stored = await hashPassword('demo-pass-1');
    expect(await verifyPassword('demo-pass-2', stored)).toBe(false);
    expect(await verifyPassword('Demo-pass-1', stored)).toBe(false);
  });

  it('salts every hash, and never stores the password itself', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toBe(b);
    expect(a).not.toContain('same');
  });

  it('rejects a malformed stored hash instead of throwing', async () => {
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
  });
});
