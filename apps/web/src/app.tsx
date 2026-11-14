import { useEffect, useState } from 'react';
import { getMe, signOut } from './api.ts';
import { Home } from './home.tsx';
import { SignIn } from './sign-in.tsx';

type View = { kind: 'checking' } | { kind: 'signed-out' } | { kind: 'signed-in'; fullName: string };

export function App() {
  const [view, setView] = useState<View>({ kind: 'checking' });

  useEffect(() => {
    void getMe().then((me) =>
      setView(me ? { kind: 'signed-in', fullName: me.fullName } : { kind: 'signed-out' }),
    );
  }, []);

  // Nothing until /api/me answers, so a signed-in user never sees the form flash (plan 0002, R8).
  if (view.kind === 'checking') return null;
  if (view.kind === 'signed-out') {
    return <SignIn onSignedIn={(me) => setView({ kind: 'signed-in', fullName: me.fullName })} />;
  }
  return (
    <Home
      fullName={view.fullName}
      onSignOut={() => void signOut().then(() => setView({ kind: 'signed-out' }))}
    />
  );
}
