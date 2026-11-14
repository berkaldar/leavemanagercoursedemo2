import type { HealthResponse } from '@leave/contracts';

// Reveals nothing but "up" (docs/security.md): no version, uptime or environment.
export function health(): HealthResponse {
  return { status: 'ok' };
}
