import type { MeResponse, SignInRequest } from '@leave/contracts';
import { classify, type Outcome } from './sign-in-form.ts';

// '/api' is proxied to the API by Vite, so the session cookie stays same-origin.
async function call(path: string, init?: RequestInit): Promise<Response | 'network-error'> {
  try {
    return await fetch(`/api${path}`, { credentials: 'same-origin', ...init });
  } catch {
    return 'network-error';
  }
}

/** The signed-in user, or undefined when signed out (or the API is unreachable). */
export async function getMe(): Promise<MeResponse | undefined> {
  const response = await call('/me');
  if (response === 'network-error' || !response.ok) return undefined;
  return (await response.json()) as MeResponse;
}

export async function signIn(body: SignInRequest): Promise<{ outcome: Outcome; me?: MeResponse }> {
  const response = await call('/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const outcome = classify(response === 'network-error' ? response : response.status);
  if (outcome !== 'ok' || response === 'network-error') return { outcome };
  return { outcome, me: (await response.json()) as MeResponse };
}

export async function signOut(): Promise<void> {
  await call('/logout', { method: 'POST' });
}
