import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="brand-mark" aria-hidden="true">
          ◐
        </span>
        <span>狼人杀上帝助手</span>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
