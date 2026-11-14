// Error types services throw; app.ts maps them to HTTP (docs/conventions.md, Error handling).
export class DomainError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Not signed in, or the sign-in attempt failed → 401. */
export class NotAuthenticatedError extends DomainError {}
