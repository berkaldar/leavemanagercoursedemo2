import { DatabaseSync } from 'node:sqlite';

// shortcut: tables are created if missing, no migrations; the dev DB is disposable until a spec
// needs a column change (plan 0002, R3).
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL -- UTC ISO-8601 (docs/conventions.md, Data rules)
);
`;

/** Opens the database (a file path, or ':memory:') and makes sure the tables exist. */
export function openDb(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}
