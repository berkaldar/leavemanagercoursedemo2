import { useRef, useState, type FormEvent } from 'react';
import type { MeResponse } from '@leave/contracts';
import { signIn } from './api.ts';
import {
  edit,
  failed,
  focusTarget,
  initialSignInForm,
  MESSAGES,
  submit,
  type Field,
  type SignInFormState,
} from './sign-in-form.ts';

export function SignIn({ onSignedIn }: { onSignedIn: (me: MeResponse) => void }) {
  const [state, setState] = useState(initialSignInForm);
  // The latest state, read synchronously: a second click before re-render still sees "in flight".
  const current = useRef(state);
  const inputs = {
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  const update = (next: SignInFormState) => {
    current.current = next;
    setState(next);
  };
  const focusFirstProblem = (next: SignInFormState) => {
    const target = focusTarget(next);
    if (target) inputs[target].current?.focus();
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { state: next, send } = submit(current.current);
    update(next);
    if (!send) {
      focusFirstProblem(next);
      return;
    }
    const result = await signIn({ email: next.email, password: next.password });
    if (result.outcome === 'ok' && result.me) {
      onSignedIn(result.me);
      return;
    }
    const after = failed(next, result.outcome === 'credentials' ? 'credentials' : 'unavailable');
    update(after);
    focusFirstProblem(after);
  }

  const field = (name: Field, label: string, type: string, autoComplete: string) => {
    const error = state.fieldErrors[name];
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          ref={inputs[name]}
          type={type}
          autoComplete={autoComplete}
          value={state[name]}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          onChange={(e) => update(edit(current.current, name, e.target.value))}
        />
        {error && (
          <p id={`${name}-error`} className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="center">
      <form
        className="card"
        noValidate
        aria-busy={state.submitting}
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="title">
          <h1>Leave Manager</h1>
          <p className="muted">Sign in to continue</p>
        </div>
        {state.formError && (
          <div
            role="alert"
            className={`banner ${state.formError === MESSAGES.credentials ? 'error' : 'warning'}`}
          >
            {state.formError}
          </div>
        )}
        {field('email', 'Email', 'email', 'username')}
        {field('password', 'Password', 'password', 'current-password')}
        <button type="submit" className="primary" disabled={state.submitting}>
          {state.submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
