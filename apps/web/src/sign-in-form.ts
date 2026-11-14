// The sign-in form's behavior as pure functions, so it is unit-tested without a browser
// (docs/testing.md, Test scope). sign-in.tsx only renders this state.

export const MESSAGES = {
  emailMissing: 'Enter your email.',
  passwordMissing: 'Enter your password.',
  credentials: 'Email or password is incorrect.',
  unavailable: "Can't sign in right now. Try again.",
} as const;

export interface SignInFormState {
  email: string;
  password: string;
  submitting: boolean;
  fieldErrors: { email?: string; password?: string };
  formError?: string;
}

export type Field = 'email' | 'password';
export type Outcome = 'ok' | 'credentials' | 'unavailable';

export const initialSignInForm: SignInFormState = {
  email: '',
  password: '',
  submitting: false,
  fieldErrors: {},
};

/** Typing into a field clears that field's message. */
export function edit(state: SignInFormState, field: Field, value: string): SignInFormState {
  return { ...state, [field]: value, fieldErrors: { ...state.fieldErrors, [field]: undefined } };
}

/** Pressing Sign in: the next state, and whether an attempt is sent (AC-5, AC-6). */
export function submit(state: SignInFormState): { state: SignInFormState; send: boolean } {
  if (state.submitting) return { state, send: false };
  const fieldErrors = {
    email: state.email.trim() === '' ? MESSAGES.emailMissing : undefined,
    password: state.password === '' ? MESSAGES.passwordMissing : undefined,
  };
  if (fieldErrors.email || fieldErrors.password) {
    return { state: { ...state, fieldErrors, formError: undefined }, send: false };
  }
  return {
    state: { ...state, submitting: true, fieldErrors: {}, formError: undefined },
    send: true,
  };
}

/** A failed attempt (AC-4, AC-7). */
export function failed(state: SignInFormState, kind: Exclude<Outcome, 'ok'>): SignInFormState {
  return kind === 'credentials'
    ? { ...state, submitting: false, password: '', formError: MESSAGES.credentials }
    : { ...state, submitting: false, formError: MESSAGES.unavailable };
}

/** What the server's answer to a sign-in attempt means for the form. */
export function classify(result: number | 'network-error'): Outcome {
  if (result === 'network-error') return 'unavailable';
  if (result >= 200 && result < 300) return 'ok';
  // 400: input the server refused; 401: wrong email or password. Both look the same (AC-4).
  if (result === 400 || result === 401) return 'credentials';
  return 'unavailable';
}

/** The first field that needs attention after a failed submit, for keyboard focus. */
export function focusTarget(state: SignInFormState): Field | undefined {
  if (state.fieldErrors.email) return 'email';
  if (state.fieldErrors.password) return 'password';
  if (state.formError === MESSAGES.credentials) return 'password';
  return undefined;
}
