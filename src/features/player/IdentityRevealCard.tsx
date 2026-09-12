import { useCallback, useEffect, useRef, useState } from 'react';

import { ProductGlyph, RoleGlyph } from '../../components/ProductGlyph';
import type { PrivateIdentity } from '../../domain/rooms/gateway';

export const IDENTITY_REVEAL_TIMEOUT_MS = 10_000;

interface IdentityRevealCardProps {
  identity: PrivateIdentity;
}

export function IdentityRevealCard({ identity }: IdentityRevealCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState(
    '身份默认遮盖，请确认身边没有其他玩家。',
  );
  const isRevealedRef = useRef(false);

  const hideIdentity = useCallback((message: string) => {
    if (!isRevealedRef.current) {
      return;
    }

    isRevealedRef.current = false;
    setIsRevealed(false);
    setPrivacyMessage(message);
  }, []);

  function revealIdentity() {
    isRevealedRef.current = true;
    setIsRevealed(true);
    setPrivacyMessage('身份正在显示，10 秒后会自动隐藏。');
  }

  useEffect(() => {
    if (!isRevealed) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      hideIdentity('展示已超时，身份已自动隐藏。');
    }, IDENTITY_REVEAL_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hideIdentity, isRevealed]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        hideIdentity('页面进入后台，身份已自动隐藏。');
      }
    }

    function handleWindowBlur() {
      hideIdentity('窗口失去焦点，身份已自动隐藏。');
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      isRevealedRef.current = false;
    };
  }, [hideIdentity]);

  if (!isRevealed) {
    return (
      <section
        className="identity-card identity-card--covered"
        aria-label="已遮盖的身份卡"
      >
        <div className="privacy-shield" aria-hidden="true">
          <ProductGlyph name="privacy" />
        </div>
        <p className="section-kicker">身份保护中</p>
        <h2>你的身份已遮盖</h2>
        <p>角色名称、阵营和技能不会留在当前页面内容中。</p>
        <button
          className="primary-button full-width"
          type="button"
          onClick={revealIdentity}
        >
          查看我的身份
        </button>
        <p className="privacy-feedback" aria-live="polite">
          {privacyMessage}
        </p>
      </section>
    );
  }

  return (
    <section
      className="identity-card identity-card--revealed"
      aria-label="当前模拟身份"
    >
      <div className="identity-heading">
        <span className="demo-badge">演示身份</span>
        <span className="reveal-timer">10 秒后自动隐藏</span>
      </div>
      <span className="identity-role-glyph" aria-hidden="true">
        <RoleGlyph roleName={identity.name} />
      </span>
      <p className="section-kicker">你的身份是</p>
      <h2 className="role-name">{identity.name}</h2>
      <p className="faction-label">{identity.factionLabel}</p>

      <section className="identity-detail" aria-labelledby="skill-title">
        <h3 id="skill-title">技能说明</h3>
        <p>{identity.skillSummary}</p>
      </section>

      <section className="identity-detail" aria-labelledby="rule-note-title">
        <h3 id="rule-note-title">规则说明</h3>
        <ul>
          {identity.publicNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <p className="warning-note">演示身份，不代表最终规则。</p>
      <button
        className="secondary-button full-width"
        type="button"
        onClick={() => hideIdentity('你已主动隐藏身份。')}
      >
        隐藏身份
      </button>
    </section>
  );
}
