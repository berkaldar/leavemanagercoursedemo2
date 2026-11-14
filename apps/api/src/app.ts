import Fastify, { type FastifyInstance } from 'fastify';
import { health } from './health.ts';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });
  // Default-deny exception (docs/security.md): /health needs no session.
  app.get('/health', () => health());
  return app;
}
