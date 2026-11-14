import { describe, expect, it } from 'vitest';
import {
  classify,
  edit,
  failed,
  focusTarget,
  initialSignInForm,
  MESSAGES,
  submit,
  type SignInFormState,
} from './sign-in-form.ts';

const filled: SignInFormState = {
  ...initialSignInForm,
  email: 'alex.sample@example.com',
  password: 'demo-employee',
};

describe('missing input (AC-5)', () => {
  it('empty fields → a message under each, nothing sent', () => {
    const { state, send } = submit(initialSignInForm);
    expect(send).toBe(false);
    expect(state.fieldErrors).toEqual({
      email: MESSAGES.emailMissing,
      password: MESSAGES.passwordMissing,
    });
    expect(focusTarget(state)).toBe('email');
  });

  it('only the password empty → only its message; spaces-only email counts as empty', () => {
    expect(submit({ ...filled, password: '' }).state.fieldErrors).toEqual({
      email: undefined,
      password: MESSAGES.passwordMissing,
    });
    expect(submit({ ...filled, email: '   ' }).state.fieldErrors.email).toBe(MESSAGES.emailMissing);
  });

  it('typing into a field clears its message', () => {
    const { state } = submit(initialSignInForm);
    const next = edit(state, 'email', 'a');
    expect(next.fieldErrors.email).toBeUndefined();
    expect(next.fieldErrors.password).toBe(MESSAGES.passwordMissing);
  });
});

describe('signing in (AC-6)', () => {
  it('a filled form is sent and marked as in flight', () => {
    const { state, send } = submit(filled);
    expect(send).toBe(true);
    expect(state.submitting).toBe(true);
  });

  it('no second attempt while one is in flight', () => {
    const inFlight = submit(filled).state;
    const again = submit(inFlight);
    expect(again.send).toBe(false);
    expect(again.state).toBe(inFlight);
  });
});

describe('failed attempts', () => {
  it('credentials failure keeps the email, clears the password (AC-4)', () => {
    const state = failed(submit(filled).state, 'credentials');
    expect(state).toMatchObject({
      email: 'alex.sample@example.com',
      password: '',
      submitting: false,
      formError: 'Email or password is incorrect.',
    });
    expect(focusTarget(state)).toBe('password');
  });

  it('network error or 5xx → unavailable, both fields kept (AC-7)', () => {
    const state = failed(submit(filled).state, 'unavailable');
    expect(state).toMatchObject({
      email: 'alex.sample@example.com',
      password: 'demo-employee',
      submitting: false,
      formError: "Can't sign in right now. Try again.",
    });
    expect(submit(state).send).toBe(true); // the form stays usable
  });
});

describe('classify the server answer', () => {
  it('maps every answer to ok, credentials or unavailable (AC-4, AC-7)', () => {
    expect(classify(200)).toBe('ok');
    expect(classify(401)).toBe('credentials');
    expect(classify(400)).toBe('credentials');
    expect(classify(500)).toBe('unavailable');
    expect(classify(502)).toBe('unavailable');
    expect(classify(404)).toBe('unavailable');
    expect(classify('network-error')).toBe('unavailable');
  });
});
