import { NIGHT_DEMO_PLAYERS } from '../../../mocks/night-demo/data';

type TargetAction = 'guard' | 'wolf' | 'seer' | 'poison';

interface SeatTargetGridProps {
  action: TargetAction;
  selectedId?: string;
  onSelect: (playerId: string) => void;
  label: string;
}

export function SeatTargetGrid({
  action,
  selectedId,
  onSelect,
  label,
}: SeatTargetGridProps) {
  return (
    <fieldset className="seat-picker">
      <legend>{label}</legend>
      <div className="seat-grid">
        {NIGHT_DEMO_PLAYERS.map((player) => {
          const reason = player.disabledFor[action];
          const isDead = player.status === 'dead';
          const isDisabled = isDead || Boolean(reason);
          const isSelected = player.id === selectedId;
          const statusLabel = isDead
            ? '已死亡'
            : reason
              ? '禁选'
              : isSelected
                ? '已选'
                : '可选';

          return (
            <button
              key={player.id}
              className={`seat-target${isSelected ? ' is-selected' : ''}${isDisabled ? ' is-disabled' : ''}${isDead ? ' is-dead' : ''}`}
              type="button"
              aria-pressed={isSelected}
              aria-describedby={
                isDisabled ? `${action}-${player.id}-reason` : undefined
              }
              disabled={isDisabled}
              onClick={() => onSelect(player.id)}
            >
              <span className="seat-target__number">{player.seatNumber}</span>
              <span className="seat-target__meta">
                <strong>{player.nickname}</strong>
                <small>{statusLabel}</small>
              </span>
              {isDisabled ? (
                <span
                  id={`${action}-${player.id}-reason`}
                  className="seat-target__reason"
                >
                  {isDead ? '已死亡，不可选择' : reason}
                </span>
              ) : null}
              {isSelected ? (
                <svg
                  className="seat-target__check"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="m4 10 4 4 8-9" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
