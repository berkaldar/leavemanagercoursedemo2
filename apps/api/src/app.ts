import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import type { DatabaseSync } from 'node:sqlite';
import type { ErrorResponse } from '@leave/contracts';
import { health } from './health.ts';
import { createIdentity, registerIdentity } from './modules/identity/index.ts';
import type { Clock } from './shared/clock.ts';
import { DomainError, NotAuthenticatedError } from './shared/errors.ts';

// The serializer drops any field not listed here, so /health can only ever say "up" (AC-2).
const healthSchema = {
  type: 'object',
  properties: { status: { const: 'ok' } },
  required: ['status'],
  additionalProperties: false,
} as const;

export interface AppDeps {
  db: DatabaseSync;
  clock: Clock;
}

const errorBody = (code: string, message: string): ErrorResponse => ({ error: { code, message } });

export function buildApp({ db, clock }: AppDeps): FastifyInstance {
  const app = Fastify({ logger: true });
  // JSON bodies only (docs/security.md, CSRF); Fastify also parses text/plain by default.
  app.removeContentTypeParser('text/plain');

  // docs/conventions.md, Error handling: one place maps errors, never leaking internals.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof NotAuthenticatedError) {
      return reply.code(401).send(errorBody(error.code, error.message));
    }
    if (error instanceof DomainError) {
      return reply.code(422).send(errorBody(error.code, error.message));
    }
    // Schema failures, malformed or empty JSON, wrong content type: the client's input (4xx).
    if (
      error.validation ||
      (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)
    ) {
      return reply
        .code(error.statusCode ?? 400)
        .send(errorBody('INVALID_INPUT', 'Invalid request.'));
    }
    request.log.error(error);
    return reply.code(500).send(errorBody('INTERNAL', 'Something went wrong.'));
  });

  registerIdentity(app, createIdentity(db, clock));
  app.addHook('onClose', () => db.close());

  // Default-deny exception (docs/security.md): /health needs no session.
  app.get('/health', { schema: { response: { 200: healthSchema } } }, () => health());
  return app;
}
