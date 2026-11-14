import Fastify, { type FastifyInstance } from 'fastify';
import { health } from './health.ts';

// The serializer drops any field not listed here, so /health can only ever say "up" (AC-2).
const healthSchema = {
  type: 'object',
  properties: { status: { const: 'ok' } },
  required: ['status'],
  additionalProperties: false,
} as const;

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });
  // Default-deny exception (docs/security.md): /health needs no session.
  app.get('/health', { schema: { response: { 200: healthSchema } } }, () => health());
  return app;
}
