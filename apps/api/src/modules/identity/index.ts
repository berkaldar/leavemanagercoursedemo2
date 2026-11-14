// Public API of the identity module (docs/architecture.md, rule 3).
import type { DatabaseSync } from 'node:sqlite';
import type { Clock } from '../../shared/clock.ts';
import { sqliteIdentityRepo } from './repo.ts';
import { identityRoutes } from './routes.ts';
import { identityService, type IdentityService } from './service.ts';

export type { IdentityService, SignedInUser } from './service.ts';

export function createIdentity(db: DatabaseSync, clock: Clock): IdentityService {
  return identityService(sqliteIdentityRepo(db), clock);
}

export { identityRoutes as registerIdentity };
