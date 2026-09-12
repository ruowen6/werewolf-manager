import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

import { useRoomGateway } from '../../app/RoomGatewayProvider';
import { PageCard } from '../../components/PageCard';
import { RoleGlyph } from '../../components/ProductGlyph';
import { ZoneNavigation } from '../../components/ZoneNavigation';
import type {
  ConfigurationRoleSummary,
  CreateRoomInput,
  HostConfigurationSetup,
  HostRoomSnapshot,
  RoleLibraryGroup,
} from '../../domain/rooms/gateway';
import { HostConfigurationPage } from './HostConfigurationPage';
import { RoleCardButton } from './RoleCardButton';

const HOST_CONFIGURATION_ZONES = [
  { id: 'zone-player-count', label: '选择人数' },
  { id: 'zone-role-library', label: '角色库' },
  { id: 'zone-rules', label: '地方规则' },
  { id: 'zone-players', label: '玩家与座位' },
] as const;

const HOST_ROOM_ZONES = [
  { id: 'zone-room-summary', label: '房间概况' },
  { id: 'zone-room-roles', label: '身份牌摘要' },
  { id: 'zone-room-players', label: '玩家顺序' },
] as const;

const ROLE_GROUP_LABELS: readonly {
  id: RoleLibraryGroup;
  label: string;
}[] = [
  { id: 'villager', label: '村民阵营' },
  { id: 'god', label: '神职阵营' },
  { id: 'werewolf', label: '狼人阵营' },
];

function RoleDescriptionDialog({
  role,
  onClose,
}: {
  role: ConfigurationRoleSummary;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="role-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        id="role-description-dialog"
        className="role-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="role-dialog__header">
          <span className="role-dialog__visual" aria-hidden="true">
            <RoleGlyph roleName={role.name} />
          </span>
          <div>
            <p className="section-kicker">身份牌 · 演示说明</p>
            <h2 id={titleId} aria-label={`${role.name} · 演示说明`}>
              {role.name}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            className="role-dialog__close"
            type="button"
            aria-label="关闭身份牌说明"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="role-dialog__summary">
          <span>{role.summary}</span>
          <strong>{role.count} 张</strong>
        </div>
        <div id={descriptionId} className="role-dialog__body">
          <h3>主持提示</h3>
          <p>{role.description}</p>
        </div>
        <button
          className="primary-button full-width"
          type="button"
          onClick={onClose}
        >
          我知道了
        </button>
      </section>
    </div>,
    document.body,
  );
}

function HostRoom({
  room,
  onBackToConfiguration,
}: {
  room: HostRoomSnapshot;
  onBackToConfiguration: () => void;
}) {
  const [copyMessage, setCopyMessage] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = room.configuration.roles.find(
    (role) => role.roleId === selectedRoleId,
  );

  async function copyRoomCode() {
    if (!navigator.clipboard?.writeText) {
      setCopyMessage('当前浏览器不支持自动复制，请长按房间号手动复制。');
      return;
    }

    try {
      await navigator.clipboard.writeText(room.code);
      setCopyMessage('房间号已复制。');
    } catch {
      setCopyMessage('复制失败，请长按房间号手动复制。');
    }
  }

  function toggleRoleDescription(role: ConfigurationRoleSummary) {
    setSelectedRoleId((current) =>
      current === role.roleId ? null : role.roleId,
    );
  }

  return (
    <PageCard
      tone="host"
      eyebrow="上帝端 · 演示模式"
      title="模拟房间已创建"
      description="配置和玩家顺序已经保存在本次页面状态中。"
    >
      <div className="status-heading">
        <span className="demo-badge">演示模式</span>
        <span className="status-copy">{room.statusLabel}</span>
      </div>

      <section
        id="zone-room-summary"
        className="room-summary"
        aria-labelledby="room-code-title"
      >
        <p id="room-code-title" className="section-kicker">
          六位房间号
        </p>
        <p className="room-code" aria-label={`房间号 ${room.code}`}>
          {room.code}
        </p>
        <button
          className="secondary-button"
          type="button"
          onClick={copyRoomCode}
        >
          复制房间号
        </button>
        <p className="inline-feedback" aria-live="polite">
          {copyMessage}
        </p>
      </section>

      <dl className="room-facts">
        <div>
          <dt>目标人数</dt>
          <dd>{room.configuration.playerCount} 人</dd>
        </div>
        <div>
          <dt>已加入</dt>
          <dd>{room.players.length} 人</dd>
        </div>
      </dl>

      <section
        id="zone-room-roles"
        className="content-section room-role-summary"
        aria-labelledby="room-role-summary"
      >
        <h2 id="room-role-summary">身份牌摘要</h2>
        <p className="section-description">
          点击角色卡查看演示说明；这里不会执行发牌或规则结算。
        </p>
        {ROLE_GROUP_LABELS.map((group) => {
          const roles = room.configuration.roles.filter(
            (role) => role.group === group.id,
          );
          if (roles.length === 0) return null;

          return (
            <section className="room-role-group" key={group.id}>
              <h3>{group.label}</h3>
              <ul className="role-card-grid role-summary-card-grid">
                {roles.map((role) => {
                  return (
                    <li
                      className={
                        selectedRoleId === role.roleId ? 'is-selected' : ''
                      }
                      key={role.roleId}
                    >
                      <RoleCardButton
                        role={role}
                        count={role.count}
                        ariaLabel={`查看${role.name}角色说明`}
                        isExpanded={selectedRoleId === role.roleId}
                        controls="role-description-dialog"
                        onClick={() => toggleRoleDescription(role)}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </section>

      <section
        id="zone-room-players"
        className="content-section"
        aria-labelledby="player-list-title"
      >
        <div className="section-heading-row">
          <h2 id="player-list-title">玩家顺序</h2>
          <span>{room.players.length} 人</span>
        </div>
        <ol className="player-list">
          {room.players.map((player) => (
            <li key={player.id}>
              <span className="seat-number">
                <strong>{player.seatNumber}</strong>
                <small>号</small>
              </span>
              <span className="room-player-name">
                <strong>{player.nickname}</strong>
                <small>座位已确认</small>
              </span>
              <span className="joined-state">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="m4 10 4 4 8-8" />
                </svg>
                已加入
              </span>
            </li>
          ))}
        </ol>
      </section>

      {selectedRole ? (
        <RoleDescriptionDialog
          role={selectedRole}
          onClose={() => setSelectedRoleId(null)}
        />
      ) : null}

      <div className="footer-actions">
        <Link
          className="night-demo-entry"
          to="/host/night-demo"
          state={{ room }}
        >
          <span className="night-demo-entry__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M31 9a17 17 0 1 0 8 30A19 19 0 0 1 31 9Z" />
              <path d="m14 10 1.5 3.5L19 15l-3.5 1.5L14 20l-1.5-3.5L9 15l3.5-1.5L14 10Z" />
            </svg>
          </span>
          <span>
            <strong>开始夜间演示</strong>
            <small>第一夜 · 8 步主持体验</small>
          </span>
          <svg
            className="night-demo-entry__arrow"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
        <button
          className="secondary-button full-width"
          type="button"
          onClick={onBackToConfiguration}
        >
          返回游戏配置
        </button>
        <Link className="text-link" to="/">
          返回首页
        </Link>
      </div>
    </PageCard>
  );
}

export function HostStartPage() {
  const gateway = useRoomGateway();
  const location = useLocation();
  const restoredRoom = (location.state as { room?: HostRoomSnapshot } | null)
    ?.room;
  const [setup, setSetup] = useState<HostConfigurationSetup | null>(null);
  const [room, setRoom] = useState<HostRoomSnapshot | null>(
    restoredRoom ?? null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCurrent = true;

    gateway
      .getHostConfiguration()
      .then((configuration) => {
        if (isCurrent) setSetup(configuration);
      })
      .catch(() => {
        if (isCurrent) {
          setErrorMessage('暂时无法载入模拟配置，请刷新后重试。');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [gateway]);

  async function createRoom(configuration: CreateRoomInput) {
    setIsCreating(true);
    setErrorMessage('');

    try {
      const createdRoom = await gateway.createRoom(configuration);
      setRoom(createdRoom);
    } catch {
      setErrorMessage('模拟房间暂时没有创建成功，请重试。');
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <PageCard
        tone="host"
        eyebrow="上帝端 · 演示模式"
        title="正在准备配置"
        description="正在读取角色库、草稿规则和模拟玩家。"
      >
        <div className="loading-panel" role="status" aria-live="polite">
          <span className="button-spinner" aria-hidden="true" />
          载入配置中…
        </div>
      </PageCard>
    );
  }

  if (!setup) {
    return (
      <PageCard
        tone="host"
        eyebrow="上帝端 · 演示模式"
        title="配置暂时没有载入"
        description={errorMessage}
      >
        <Link className="primary-button button-link" to="/">
          返回首页
        </Link>
      </PageCard>
    );
  }

  return (
    <div className={`host-flow${room ? ' host-flow--room' : ''}`}>
      <ZoneNavigation
        roomCode={room?.code}
        zones={room ? HOST_ROOM_ZONES : HOST_CONFIGURATION_ZONES}
      />
      <div className="configuration-mount" hidden={Boolean(room)}>
        <HostConfigurationPage
          setup={setup}
          isCreating={isCreating}
          onCreateRoom={createRoom}
        />
      </div>
      {room ? (
        <HostRoom room={room} onBackToConfiguration={() => setRoom(null)} />
      ) : null}
      {errorMessage ? (
        <p className="floating-form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
