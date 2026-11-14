import type { DatabaseSync } from 'node:sqlite';

export interface UserRow {
  id: number;
  email: string;
  fullName: string;
  passwordHash: string;
}

export interface SessionRow {
  userId: number;
  /** UTC ISO-8601. */
  createdAt: string;
}

/** SQL only, no logic (docs/testing.md, Test scope 2); services test against a fake. */
export interface IdentityRepo {
  findUserByEmail(email: string): UserRow | undefined;
  findUserById(id: number): UserRow | undefined;
  insertUser(email: string, fullName: string, passwordHash: string): void;
  insertSession(tokenHash: string, userId: number, createdAt: string): void;
  findSession(tokenHash: string): SessionRow | undefined;
  deleteSession(tokenHash: string): void;
}

export function sqliteIdentityRepo(db: DatabaseSync): IdentityRepo {
  return {
    findUserByEmail: (email) =>
      db
        .prepare(
          'SELECT id, email, full_name AS fullName, password_hash AS passwordHash FROM users WHERE email = ?',
        )
        .get(email) as UserRow | undefined,
    findUserById: (id) =>
      db
        .prepare(
          'SELECT id, email, full_name AS fullName, password_hash AS passwordHash FROM users WHERE id = ?',
        )
        .get(id) as UserRow | undefined,
    insertUser: (email, fullName, passwordHash) => {
      db.prepare('INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)').run(
        email,
        fullName,
        passwordHash,
      );
    },
    insertSession: (tokenHash, userId, createdAt) => {
      db.prepare('INSERT INTO sessions (token_hash, user_id, created_at) VALUES (?, ?, ?)').run(
        tokenHash,
        userId,
        createdAt,
      );
    },
    findSession: (tokenHash) =>
      db
        .prepare(
          'SELECT user_id AS userId, created_at AS createdAt FROM sessions WHERE token_hash = ?',
        )
        .get(tokenHash) as SessionRow | undefined,
    deleteSession: (tokenHash) => {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    },
  };
}
