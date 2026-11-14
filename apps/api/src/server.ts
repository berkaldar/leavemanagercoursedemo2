import { buildApp } from './app.ts';

const app = buildApp();

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
