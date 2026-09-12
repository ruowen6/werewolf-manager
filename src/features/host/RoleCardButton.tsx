import { RoleGlyph } from '../../components/ProductGlyph';

interface RoleCardVisual {
  name: string;
  symbol: string;
  summary: string;
}

interface RoleCardButtonProps {
  role: RoleCardVisual;
  count: number;
  ariaLabel: string;
  isExpanded?: boolean;
  controls?: string;
  onClick: () => void;
}

export function RoleCardButton({
  role,
  count,
  ariaLabel,
  isExpanded,
  controls,
  onClick,
}: RoleCardButtonProps) {
  return (
    <button
      className="role-image-button"
      type="button"
      aria-label={ariaLabel}
      aria-expanded={isExpanded}
      aria-controls={controls}
      onClick={onClick}
    >
      <span className="role-symbol" aria-hidden="true">
        <RoleGlyph roleName={role.name} />
      </span>
      <span className="role-button-copy">
        <strong>{role.name}</strong>
        <small>{role.summary}</small>
      </span>
      {count > 0 ? <span className="role-count-badge">{count}</span> : null}
    </button>
  );
}
