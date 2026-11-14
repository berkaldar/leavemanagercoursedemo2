export function Home({ fullName, onSignOut }: { fullName: string; onSignOut: () => void }) {
  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <p className="brand">Leave Manager</p>
          <div className="user">
            <p>
              Signed in as <strong>{fullName}</strong>
            </p>
            <button type="button" className="secondary" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="content">
        <h1>Leave Manager</h1>
        <p className="muted">Nothing here yet.</p>
      </main>
    </div>
  );
}
