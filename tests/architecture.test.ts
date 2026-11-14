import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkArchitecture, loadSourceTree, type SourceFile } from './architecture.ts';

const rulesBroken = (path: string, source: string) =>
  checkArchitecture([{ path, source }]).map((v) => v.rule);

describe('rule 1 — apps/web never imports from apps/api', () => {
  const web = 'apps/web/src/app.tsx';
  it('fails on a relative import into apps/api', () => {
    expect(rulesBroken(web, "import { x } from '../../api/src/app.ts';")).toEqual([1]);
  });
  it('fails on the api package', () => {
    expect(rulesBroken(web, "import '@leave/api';")).toEqual([1]);
  });
  it('passes on the contracts package', () => {
    expect(rulesBroken(web, "import type { HealthResponse } from '@leave/contracts';")).toEqual([]);
  });
});

describe('rule 2 — routes never import a repo or node:sqlite', () => {
  const routes = 'apps/api/src/modules/leave/routes.ts';
  it('fails on a repo import', () => {
    expect(rulesBroken(routes, "import { insert } from './repo.ts';")).toEqual([2]);
  });
  it('fails on node:sqlite', () => {
    expect(rulesBroken(routes, "import { DatabaseSync } from 'node:sqlite';")).toEqual([2]);
  });
  it('passes on its service', () => {
    expect(rulesBroken(routes, "import { request } from './service.ts';")).toEqual([]);
  });
});

describe('rule 3 — another module only through its index.ts', () => {
  const service = 'apps/api/src/modules/leave/service.ts';
  it('fails on the service file of another module', () => {
    expect(rulesBroken(service, "import { deduct } from '../balance/service.ts';")).toEqual([3]);
  });
  it('passes on the index.ts of another module', () => {
    expect(rulesBroken(service, "import { deduct } from '../balance/index.ts';")).toEqual([]);
  });
  it('passes on internals of its own module', () => {
    expect(rulesBroken(service, "import { insert } from './repo.ts';")).toEqual([]);
  });
});

describe('rule 4 — only modules/balance writes balance rows', () => {
  const sql = "db.prepare('UPDATE balances SET days = ? WHERE id = ?');";
  it('fails when another module updates balances', () => {
    expect(rulesBroken('apps/api/src/modules/leave/repo.ts', sql)).toEqual([4]);
  });
  it('passes when modules/balance writes them', () => {
    expect(rulesBroken('apps/api/src/modules/balance/repo.ts', sql)).toEqual([]);
  });
});

describe('rule 5 — services and working-days import neither fastify nor node:sqlite', () => {
  it('fails on fastify in a service', () => {
    expect(
      rulesBroken(
        'apps/api/src/modules/leave/service.ts',
        "import type { FastifyRequest } from 'fastify';",
      ),
    ).toEqual([5]);
  });
  it('fails on node:sqlite in working-days', () => {
    expect(rulesBroken('apps/api/src/shared/working-days.ts', "import 'node:sqlite';")).toEqual([
      5,
    ]);
  });
  it('passes on the clock', () => {
    expect(
      rulesBroken(
        'apps/api/src/modules/leave/service.ts',
        "import type { Clock } from '../../shared/clock.ts';",
      ),
    ).toEqual([]);
  });
});

describe('the real source tree', () => {
  const tree: SourceFile[] = loadSourceTree(fileURLToPath(new URL('..', import.meta.url)));

  it('is actually read (guards against a vacuous pass)', () => {
    expect(tree.map((f) => f.path)).toContain('apps/api/src/app.ts');
  });
  it('breaks no forbidden dependency', () => {
    expect(checkArchitecture(tree)).toEqual([]);
  });
});
