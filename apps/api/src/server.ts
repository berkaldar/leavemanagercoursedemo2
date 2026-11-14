import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.ts';
import { createIdentity } from './modules/identity/index.ts';
import { seedDevUsers } from './seed.ts';
import { systemClock } from './shared/clock.ts';
import { openDb } from './shared/db.ts';

const dataDir = new URL('../.data/', import.meta.url);
mkdirSync(dataDir, { recursive: true });
const db = openDb(fileURLToPath(new URL('leave.sqlite', dataDir)));
const clock = systemClock();

if (process.env.NODE_ENV !== 'production') await seedDevUsers(createIdentity(db, clock));

const app = buildApp({ db, clock });

// Close on Ctrl+C / termination so nothing keeps running (docs/testing.md, Resource hygiene).
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    app.close().then(
      () => process.exit(0),
      () => process.exit(1),
    );
  });
}

await app.listen({ port: Number(process.env.PORT ?? 3000), host: '127.0.0.1' });
