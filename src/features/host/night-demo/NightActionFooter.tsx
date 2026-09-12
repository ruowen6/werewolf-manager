interface NightActionFooterProps {
  canGoBack: boolean;
  canSkip: boolean;
  primaryDisabled: boolean;
  primaryLabel: string;
  requirement: string;
  onBack: () => void;
  onRepeat: () => void;
  onSkip: () => void;
  onPrimary: () => void;
}

export function NightActionFooter({
  canGoBack,
  canSkip,
  primaryDisabled,
  primaryLabel,
  requirement,
  onBack,
  onRepeat,
  onSkip,
  onPrimary,
}: NightActionFooterProps) {
  return (
    <footer className="night-action-footer">
      <p
        className={`night-requirement${primaryDisabled ? '' : ' is-ready'}`}
        aria-live="polite"
      >
        {requirement}
      </p>
      <div className="night-helper-actions">
        <button type="button" onClick={onBack} disabled={!canGoBack}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          上一步
        </button>
        <button type="button" onClick={onRepeat}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />
          </svg>
          重复提示
        </button>
        {canSkip ? (
          <button type="button" onClick={onSkip}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m7 6 7 6-7 6V6Zm8 0h2v12h-2" />
            </svg>
            跳过
          </button>
        ) : null}
      </div>
      <button
        className="night-primary-button"
        type="button"
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </footer>
  );
}
