import { useState } from 'react';

interface ZoneLink {
  id: string;
  label: string;
}

interface ZoneNavigationProps {
  roomCode?: string;
  zones: readonly ZoneLink[];
}

export function ZoneNavigation({ roomCode, zones }: ZoneNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  function goToZone(zoneId: string) {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.getElementById(zoneId)?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    setIsOpen(false);
  }

  return (
    <nav className="zone-navigation" aria-label="房间分区导航">
      <button
        className="zone-navigation-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="zone-navigation-menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="zone-room-code">
          <small>当前房间号</small>
          <strong>{roomCode ?? '待创建'}</strong>
        </span>
        <span className="zone-navigation-action">
          {isOpen ? '收起导航' : '前往分区'}
          <span className="collapsible-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </span>
      </button>

      <div
        id="zone-navigation-menu"
        className="zone-navigation-menu"
        hidden={!isOpen}
      >
        {zones.map((zone, index) => (
          <button type="button" key={zone.id} onClick={() => goToZone(zone.id)}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {zone.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
