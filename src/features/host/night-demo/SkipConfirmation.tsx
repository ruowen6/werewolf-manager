import { useEffect, useRef } from 'react';

interface SkipConfirmationProps {
  actionLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SkipConfirmation({
  actionLabel,
  onCancel,
  onConfirm,
}: SkipConfirmationProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="night-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="night-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-dialog-title"
      >
        <span className="night-dialog__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 4 3 20h18L12 4Zm0 6v4m0 3v1" />
          </svg>
        </span>
        <p className="night-kicker">需要再次确认</p>
        <h2 id="skip-dialog-title">确定要{actionLabel}吗？</h2>
        <p>这会在演示记录中留下“手动跳过”。之后仍可通过“上一步”返回修改。</p>
        <div>
          <button
            ref={cancelRef}
            className="night-dialog-cancel"
            type="button"
            onClick={onCancel}
          >
            继续选择
          </button>
          <button
            className="night-dialog-confirm"
            type="button"
            onClick={onConfirm}
          >
            确认{actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
