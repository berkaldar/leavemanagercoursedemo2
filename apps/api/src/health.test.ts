import { expect, it } from 'vitest';
import { health } from './health.ts';

it('reports the API is up and nothing else', () => {
  expect(health()).toStrictEqual({ status: 'ok' });
});
