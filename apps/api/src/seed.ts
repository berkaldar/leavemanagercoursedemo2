import type { IdentityService } from './modules/identity/index.ts';

// Invented demo accounts; demo credentials are not secrets (docs/security.md). Roles come with
// the approval spec (plan 0002, R4).
export const DEV_USERS = [
  { email: 'alex.sample@example.com', fullName: 'Alex Sample', password: 'demo-employee' }, // employee
  { email: 'morgan.example@example.com', fullName: 'Morgan Example', password: 'demo-manager' }, // manager
] as const;

export async function seedDevUsers(identity: IdentityService): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The development seed never runs in production.');
  }
  for (const user of DEV_USERS) await identity.ensureUser(user.email, user.fullName, user.password);
}
