import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { MeResponse, SignInRequest } from '@leave/contracts';
import { NotAuthenticatedError } from '../../shared/errors.ts';
import {
  requiresSession,
  SESSION_LIFETIME_MS,
  type IdentityService,
  type SignedInUser,
} from './service.ts';

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the default-deny hook; present on every route that requires a session. */
    user?: SignedInUser;
  }
}

const COOKIE = 'lm_session';

function sessionToken(request: FastifyRequest): string | undefined {
  for (const part of (request.headers.cookie ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === COOKIE) return value.join('=') || undefined;
  }
  return undefined;
}

// docs/security.md: HttpOnly, SameSite=Strict, Secure outside localhost, 8-hour expiry.
function setSessionCookie(reply: FastifyReply, token: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  void reply.header(
    'set-cookie',
    `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secure}`,
  );
}

const meSchema = {
  type: 'object',
  properties: { fullName: { type: 'string' } },
  required: ['fullName'],
  additionalProperties: false,
} as const;

// Generous bounds only; the real limits (254 / 128) answer like any failed attempt (AC-4).
const signInSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', maxLength: 1024 },
      password: { type: 'string', maxLength: 1024 },
    },
    required: ['email', 'password'],
    additionalProperties: false,
  },
  response: { 200: meSchema },
} as const;

export function identityRoutes(app: FastifyInstance, identity: IdentityService): void {
  // Default-deny (docs/security.md): every request without a valid session is refused here.
  app.addHook('onRequest', (request, _reply, done) => {
    request.user = identity.currentUser(sessionToken(request));
    if (!request.user && requiresSession(request.method, request.url)) {
      done(new NotAuthenticatedError('NOT_SIGNED_IN', 'Sign in to continue.'));
      return;
    }
    done();
  });

  app.post<{ Body: SignInRequest }>('/login', { schema: signInSchema }, async (request, reply) => {
    const { token, user } = await identity.signIn(request.body.email, request.body.password);
    setSessionCookie(reply, token, SESSION_LIFETIME_MS / 1000);
    return { fullName: user.fullName } satisfies MeResponse;
  });

  app.post('/logout', async (request, reply) => {
    identity.signOut(sessionToken(request));
    setSessionCookie(reply, '', 0);
    return reply.code(204).send();
  });

  app.get('/me', { schema: { response: { 200: meSchema } } }, (request) => {
    return { fullName: request.user?.fullName ?? '' } satisfies MeResponse;
  });
}
