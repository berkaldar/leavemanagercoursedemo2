// The forbidden dependencies of docs/architecture.md as pure functions over source files.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export interface SourceFile {
  /** Repo-relative path with forward slashes, e.g. apps/api/src/app.ts */
  path: string;
  source: string;
}

export interface Violation {
  rule: 1 | 2 | 3 | 4 | 5;
  file: string;
  detail: string;
}

const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;

export function importsOf(source: string): string[] {
  return [...source.matchAll(IMPORT_RE)].map((m) => m[1] ?? m[2] ?? m[3] ?? '');
}

/** Relative specifiers become repo-relative paths; package specifiers stay as they are. */
function resolve(from: string, spec: string): string {
  return spec.startsWith('.') ? path.posix.join(path.posix.dirname(from), spec) : spec;
}

const MODULE_RE = /^apps\/api\/src\/modules\/([^/]+)\/(.+)$/;
// SQLite write forms incl. conflict clauses (INSERT OR REPLACE, UPDATE OR IGNORE) and schema prefixes.
const BALANCE_WRITE_RE =
  /\b(?:insert(?:\s+or\s+\w+)?\s+into|replace\s+into|update(?:\s+or\s+\w+)?|delete\s+from)\s+(?:\w+\.)?["'`]?balances\b/i;

const isRepo = (target: string) => /(^|\/)repo(\.ts)?$/.test(target);
const isIndex = (rest: string) => /^index(\.ts)?$/.test(rest);

export function checkArchitecture(files: SourceFile[]): Violation[] {
  const violations: Violation[] = [];
  const add = (rule: Violation['rule'], file: string, detail: string) =>
    violations.push({ rule, file, detail });

  for (const file of files) {
    const from = MODULE_RE.exec(file.path);
    const isRoutes = file.path.endsWith('/routes.ts');
    const isDomain =
      file.path.endsWith('/service.ts') || file.path === 'apps/api/src/shared/working-days.ts';

    for (const spec of importsOf(file.source)) {
      const target = resolve(file.path, spec);

      // 1. apps/web never imports from apps/api.
      if (
        file.path.startsWith('apps/web/') &&
        (target.startsWith('apps/api/') || spec === '@leave/api' || spec.startsWith('@leave/api/'))
      ) {
        add(1, file.path, `imports ${spec}`);
      }
      // 2. routes never import a repo or node:sqlite.
      if (isRoutes && (isRepo(target) || spec === 'node:sqlite')) {
        add(2, file.path, `imports ${spec}`);
      }
      // 3. another module only through its index.ts.
      const to = MODULE_RE.exec(target);
      if (from && to && from[1] !== to[1] && !isIndex(to[2] ?? '')) {
        add(3, file.path, `imports ${spec}`);
      }
      // 5. services and working-days stay free of fastify and node:sqlite.
      if (
        isDomain &&
        (spec === 'fastify' || spec.startsWith('fastify/') || spec === 'node:sqlite')
      ) {
        add(5, file.path, `imports ${spec}`);
      }
    }

    // 4. only modules/balance writes balance rows.
    if (
      !file.path.startsWith('apps/api/src/modules/balance/') &&
      BALANCE_WRITE_RE.test(file.source)
    ) {
      add(4, file.path, 'writes the balances table');
    }
  }
  return violations;
}

/** Every .ts/.tsx file under apps/ and packages/; node_modules and dist skipped. */
export function loadSourceTree(root: string): SourceFile[] {
  const files: SourceFile[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name)) {
        files.push({
          path: path.relative(root, full).split(path.sep).join('/'),
          source: readFileSync(full, 'utf8'),
        });
      }
    }
  };
  for (const top of ['apps', 'packages']) walk(path.join(root, top));
  return files;
}
