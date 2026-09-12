import { Link, Outlet, useLocation } from 'react-router-dom';

import { ProductGlyph } from '../components/ProductGlyph';

export function RootLayout() {
  const location = useLocation();
  const isNightDemo = location.pathname === '/host/night-demo';

  return (
    <div className={`app-shell${isNightDemo ? ' app-shell--night-demo' : ''}`}>
      <header
        className={`app-header${isNightDemo ? ' app-header--night-demo' : ''}`}
      >
        <Link className="brand-link" to="/" aria-label="返回狼人杀助手首页">
          <span className="brand-mark" aria-hidden="true">
            <ProductGlyph name="brand" />
          </span>
          <span className="brand-copy">
            <strong>狼人杀上帝助手</strong>
            <small>MOONLIGHT GUIDE</small>
          </span>
        </Link>
      </header>
      <main className={`app-main${isNightDemo ? ' app-main--night-demo' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
