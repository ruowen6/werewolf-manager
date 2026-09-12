import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { PageCard } from '../../components/PageCard';
import { RoleGlyph } from '../../components/ProductGlyph';
import type {
  CreateRoomInput,
  HostConfigurationSetup,
  RoleCatalogEntry,
  RoleLibraryGroup,
  RoomPlayer,
  RuleChoiceField,
} from '../../domain/rooms/gateway';
import { RoleCardButton } from './RoleCardButton';

interface HostConfigurationPageProps {
  setup: HostConfigurationSetup;
  isCreating: boolean;
  onCreateRoom: (configuration: CreateRoomInput) => void;
}

const PLAYER_COUNTS = [7, 8, 9, 10, 11, 12, 13] as const;
const MIN_PLAYER_COUNT = 7;
const MAX_PLAYER_COUNT = 13;

const ROLE_GROUPS: readonly {
  id: RoleLibraryGroup;
  title: string;
  description: string;
}[] = [
  { id: 'villager', title: '村民阵营', description: '普通民牌' },
  { id: 'god', title: '神职阵营', description: '拥有特殊能力的好人牌' },
  { id: 'werewolf', title: '狼人阵营', description: '普通狼与特殊狼牌' },
];

function getDefaultRoleCounts(
  roles: readonly RoleCatalogEntry[],
): Record<string, number> {
  return roles.reduce<Record<string, number>>((counts, role) => {
    counts[role.id] = role.defaultCount;
    return counts;
  }, {});
}

function getDefaultRuleSelections(
  fields: readonly RuleChoiceField[],
): Record<string, string> {
  return fields.reduce<Record<string, string>>((selections, field) => {
    selections[field.id] = field.defaultValue;
    return selections;
  }, {});
}

function reseatPlayers(players: readonly RoomPlayer[]): RoomPlayer[] {
  return players.map((player, index) => ({
    ...player,
    seatNumber: index + 1,
  }));
}

function getSeatDrafts(players: readonly RoomPlayer[]): Record<string, string> {
  return players.reduce<Record<string, string>>((drafts, player, index) => {
    drafts[player.id] = String(index + 1);
    return drafts;
  }, {});
}

function RuleChoice({
  field,
  selectedValue,
  onChange,
}: {
  field: RuleChoiceField;
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="rule-choice">
      <legend>{field.label}</legend>
      <p>{field.description}</p>
      <span className="rule-source">来源：{field.sourceRuleId}</span>
      <div className="rule-option-grid">
        {field.options.map((option) => (
          <label
            className={selectedValue === option.value ? 'is-selected' : ''}
            key={option.value}
          >
            <input
              type="radio"
              name={field.id}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function RuleCluster({
  clusterId,
  title,
  description,
  visualName,
  fields,
  isOpen,
  selections,
  onToggle,
  onChange,
}: {
  clusterId: string;
  title: string;
  description: string;
  visualName: string;
  fields: readonly RuleChoiceField[];
  isOpen: boolean;
  selections: Readonly<Record<string, string>>;
  onToggle: () => void;
  onChange: (fieldId: string, value: string) => void;
}) {
  const contentId = `rule-cluster-${clusterId}`;

  return (
    <section className="rule-cluster">
      <h3 className="collapsible-heading rule-cluster-heading">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span className="collapsible-heading-symbol" aria-hidden="true">
            <RoleGlyph roleName={visualName} />
          </span>
          <span className="collapsible-heading-copy">
            <strong>{title}</strong>
            <small>
              {description} · {fields.length} 项
            </small>
          </span>
          <span className="collapsible-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </h3>
      <div id={contentId} className="rule-list" hidden={!isOpen}>
        {fields.map((field) => (
          <RuleChoice
            key={field.id}
            field={field}
            selectedValue={selections[field.id] ?? field.defaultValue}
            onChange={(value) => onChange(field.id, value)}
          />
        ))}
      </div>
    </section>
  );
}

export function HostConfigurationPage({
  setup,
  isCreating,
  onCreateRoom,
}: HostConfigurationPageProps) {
  const [playerCount, setPlayerCount] = useState(setup.defaultPlayerCount);
  const [playerCountInput, setPlayerCountInput] = useState(
    String(setup.defaultPlayerCount),
  );
  const [playerCountError, setPlayerCountError] = useState('');
  const [roleCounts, setRoleCounts] = useState(() =>
    getDefaultRoleCounts(setup.roles),
  );
  const [ruleSelections, setRuleSelections] = useState(() =>
    getDefaultRuleSelections(setup.ruleFields),
  );
  const [openRoleGroups, setOpenRoleGroups] = useState<
    Record<RoleLibraryGroup, boolean>
  >({ villager: true, god: true, werewolf: true });
  const [openRuleClusters, setOpenRuleClusters] = useState<
    Record<string, boolean>
  >({ general: true });
  const [players, setPlayers] = useState(() => reseatPlayers(setup.players));
  const [seatDrafts, setSeatDrafts] = useState(() =>
    getSeatDrafts(setup.players),
  );
  const [seatErrors, setSeatErrors] = useState<Record<string, string>>({});
  const [reorderAnnouncement, setReorderAnnouncement] = useState('');
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dropTargetPlayerId, setDropTargetPlayerId] = useState<string | null>(
    null,
  );
  const draggedPlayerIdRef = useRef<string | null>(null);
  const dropTargetPlayerIdRef = useRef<string | null>(null);
  const playerItemRefs = useRef(new Map<string, HTMLLIElement>());
  const pendingPlayerPositionsRef = useRef<Map<string, number> | null>(null);

  const totalRoleCount = useMemo(
    () => Object.values(roleCounts).reduce((total, count) => total + count, 0),
    [roleCounts],
  );
  const countsMatch = totalRoleCount === playerCount;
  const hasSeatErrors = Object.values(seatErrors).some(Boolean);
  const generalRuleFields = setup.ruleFields.filter(
    (field) => !field.relatedRoleId,
  );
  const relatedRuleGroups = setup.roles.reduce<
    { role: RoleCatalogEntry; fields: RuleChoiceField[] }[]
  >((groups, role) => {
    if ((roleCounts[role.id] ?? 0) === 0) return groups;
    const fields = setup.ruleFields.filter(
      (field) => field.relatedRoleId === role.id,
    );
    if (fields.length > 0) groups.push({ role, fields });
    return groups;
  }, []);

  useLayoutEffect(() => {
    const previousPositions = pendingPlayerPositionsRef.current;
    pendingPlayerPositionsRef.current = null;
    if (!previousPositions) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    playerItemRefs.current.forEach((element, playerId) => {
      const previousTop = previousPositions.get(playerId);
      if (previousTop === undefined || typeof element.animate !== 'function') {
        return;
      }

      const deltaY = previousTop - element.getBoundingClientRect().top;
      if (Math.abs(deltaY) < 1) return;

      element.animate(
        [
          { transform: `translateY(${deltaY}px)`, boxShadow: '0 0 0 #0000' },
          {
            transform: 'translateY(0)',
            boxShadow: '0 0.65rem 1.4rem rgb(0 0 0 / 24%)',
          },
        ],
        { duration: 280, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      );
    });
  }, [players]);

  function choosePlayerCount(count: number) {
    setPlayerCount(count);
    setPlayerCountInput(String(count));
    setPlayerCountError('');
  }

  function handlePlayerCountInput(value: string) {
    setPlayerCountInput(value);
    const parsedCount = Number(value);

    if (
      Number.isInteger(parsedCount) &&
      parsedCount >= MIN_PLAYER_COUNT &&
      parsedCount <= MAX_PLAYER_COUNT
    ) {
      setPlayerCount(parsedCount);
      setPlayerCountError('');
    } else {
      setPlayerCountError('请输入 7 到 13 之间的整数。');
    }
  }

  function changeRoleCount(roleId: string, amount: number) {
    setRoleCounts((current) => ({
      ...current,
      [roleId]: Math.min(13, Math.max(0, (current[roleId] ?? 0) + amount)),
    }));
  }

  function removeRole(roleId: string) {
    setRoleCounts((current) => ({ ...current, [roleId]: 0 }));
  }

  function toggleRoleGroup(groupId: RoleLibraryGroup) {
    setOpenRoleGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  }

  function toggleRuleCluster(clusterId: string) {
    setOpenRuleClusters((current) => ({
      ...current,
      [clusterId]: !(current[clusterId] ?? false),
    }));
  }

  function capturePlayerPositions() {
    pendingPlayerPositionsRef.current = new Map(
      [...playerItemRefs.current].map(([playerId, element]) => [
        playerId,
        element.getBoundingClientRect().top,
      ]),
    );
  }

  function reorderPlayers(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;

    const sourceIndex = players.findIndex((player) => player.id === sourceId);
    const targetIndex = players.findIndex((player) => player.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextPlayers = [...players];
    const [movedPlayer] = nextPlayers.splice(sourceIndex, 1);
    if (!movedPlayer) return;
    nextPlayers.splice(targetIndex, 0, movedPlayer);

    capturePlayerPositions();
    const reseatedPlayers = reseatPlayers(nextPlayers);
    setPlayers(reseatedPlayers);
    setSeatDrafts(getSeatDrafts(reseatedPlayers));
    setSeatErrors((current) => ({ ...current, [sourceId]: '' }));
    setReorderAnnouncement(
      `${movedPlayer.nickname}已移至玩家序号 ${targetIndex + 1}。`,
    );
  }

  function movePlayer(playerId: string, offset: -1 | 1) {
    const currentIndex = players.findIndex((player) => player.id === playerId);
    const targetPlayer = players[currentIndex + offset];
    if (targetPlayer) reorderPlayers(playerId, targetPlayer.id);
  }

  function changePlayerSeat(playerId: string, value: string) {
    setSeatDrafts((current) => ({ ...current, [playerId]: value }));
    const nextSeat = Number(value);

    if (
      !/^\d+$/.test(value) ||
      !Number.isInteger(nextSeat) ||
      nextSeat < 1 ||
      nextSeat > players.length
    ) {
      setSeatErrors((current) => ({
        ...current,
        [playerId]: `请输入 1 到 ${players.length} 之间的整数。`,
      }));
      return;
    }

    setSeatErrors((current) => ({ ...current, [playerId]: '' }));
    const targetPlayer = players[nextSeat - 1];
    if (targetPlayer && targetPlayer.id !== playerId) {
      reorderPlayers(playerId, targetPlayer.id);
    }
  }

  function resetInvalidSeat(playerId: string) {
    if (!seatErrors[playerId]) return;
    const player = players.find((candidate) => candidate.id === playerId);
    if (!player) return;

    setSeatDrafts((current) => ({
      ...current,
      [playerId]: String(player.seatNumber),
    }));
    setSeatErrors((current) => ({ ...current, [playerId]: '' }));
  }

  function startPlayerDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    playerId: string,
  ) {
    draggedPlayerIdRef.current = playerId;
    dropTargetPlayerIdRef.current = playerId;
    setDraggedPlayerId(playerId);
    setDropTargetPlayerId(playerId);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function updatePlayerDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!draggedPlayerIdRef.current) return;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-player-id]');
    const targetId = target?.dataset.playerId;
    if (!targetId) return;

    dropTargetPlayerIdRef.current = targetId;
    setDropTargetPlayerId(targetId);
  }

  function finishPlayerDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const sourceId = draggedPlayerIdRef.current;
    const targetId = dropTargetPlayerIdRef.current;
    if (sourceId && targetId) reorderPlayers(sourceId, targetId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggedPlayerIdRef.current = null;
    dropTargetPlayerIdRef.current = null;
    setDraggedPlayerId(null);
    setDropTargetPlayerId(null);
  }

  function createRoom() {
    onCreateRoom({
      playerCount,
      roleCounts,
      ruleSelections,
      orderedPlayerIds: players.map((player) => player.id),
    });
  }

  return (
    <PageCard
      tone="host"
      className="page-card--configuration"
      eyebrow="上帝端 · 演示配置"
      title="配置模拟游戏"
      description="先确定人数和身份牌，再补充地方规则。所有选择只用于 Mock 演示。"
    >
      <div className="configuration-status-row">
        <span className="demo-badge">草稿规则</span>
        <span>单身份 · ruleset-v1</span>
      </div>

      <section
        id="zone-player-count"
        className="config-section"
        aria-labelledby="player-count-heading"
      >
        <div className="config-section-heading config-section-heading--sticky">
          <span aria-hidden="true">01</span>
          <div>
            <h2 id="player-count-heading">选择人数</h2>
            <p>支持 7–13 人，也可以直接输入。</p>
          </div>
        </div>

        <div className="player-count-buttons" aria-label="快速选择玩家人数">
          {PLAYER_COUNTS.map((count) => (
            <button
              type="button"
              key={count}
              aria-pressed={playerCount === count}
              onClick={() => choosePlayerCount(count)}
            >
              {count}
            </button>
          ))}
        </div>

        <div className="compact-field">
          <label htmlFor="host-player-count">玩家人数</label>
          <input
            id="host-player-count"
            type="number"
            inputMode="numeric"
            min={7}
            max={13}
            step={1}
            value={playerCountInput}
            onChange={(event) => handlePlayerCountInput(event.target.value)}
            aria-invalid={Boolean(playerCountError)}
            aria-describedby={
              playerCountError ? 'host-player-count-error' : undefined
            }
          />
          <span>人</span>
        </div>
        {playerCountError ? (
          <p id="host-player-count-error" className="field-error">
            {playerCountError}
          </p>
        ) : null}
      </section>

      <section
        id="zone-role-library"
        className="config-section"
        aria-labelledby="role-library-heading"
      >
        <div className="config-section-heading config-section-heading--sticky">
          <span aria-hidden="true">02</span>
          <div>
            <h2 id="role-library-heading">角色库</h2>
            <p>点击角色图添加一张，或使用数量控制。</p>
          </div>
        </div>

        <div
          className={`role-total${countsMatch ? ' is-valid' : ' is-invalid'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            已选 {totalRoleCount} / {playerCount} 张
          </strong>
          <span>
            {countsMatch
              ? '身份数量与玩家人数一致'
              : totalRoleCount < playerCount
                ? `还需添加 ${playerCount - totalRoleCount} 张`
                : `已超出 ${totalRoleCount - playerCount} 张`}
          </span>
        </div>

        {ROLE_GROUPS.map((group) => {
          const roles = setup.roles.filter((role) => role.group === group.id);
          const selectedCount = roles.reduce(
            (total, role) => total + (roleCounts[role.id] ?? 0),
            0,
          );
          const contentId = `role-group-${group.id}`;
          const isOpen = openRoleGroups[group.id];

          return (
            <section className="role-group" key={group.id}>
              <h3 className="collapsible-heading role-group-heading">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleRoleGroup(group.id)}
                >
                  <span className="collapsible-heading-copy">
                    <strong>{group.title}</strong>
                    <small>
                      {group.description} · 已选 {selectedCount} 张
                    </small>
                  </span>
                  <span className="collapsible-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
              </h3>
              <ul id={contentId} className="role-card-grid" hidden={!isOpen}>
                {roles.map((role) => {
                  const count = roleCounts[role.id] ?? 0;
                  return (
                    <li className={count > 0 ? 'has-cards' : ''} key={role.id}>
                      {count > 0 ? (
                        <button
                          className="remove-role-button"
                          type="button"
                          aria-label={`移除全部${role.name}`}
                          onClick={() => removeRole(role.id)}
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      ) : null}
                      <RoleCardButton
                        role={role}
                        count={count}
                        ariaLabel={`添加一张${role.name}`}
                        onClick={() => changeRoleCount(role.id, 1)}
                      />
                      <div className="role-count-controls">
                        <button
                          type="button"
                          aria-label={`减少一张${role.name}`}
                          disabled={count === 0}
                          onClick={() => changeRoleCount(role.id, -1)}
                        >
                          −
                        </button>
                        <output aria-label={`${role.name}数量`}>{count}</output>
                        <button
                          type="button"
                          aria-label={`增加一张${role.name}`}
                          disabled={count >= 13}
                          onClick={() => changeRoleCount(role.id, 1)}
                        >
                          ＋
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </section>

      <section
        id="zone-rules"
        className="config-section"
        aria-labelledby="details-heading"
      >
        <div className="config-section-heading config-section-heading--sticky">
          <span aria-hidden="true">03</span>
          <div>
            <h2 id="details-heading">Details · 地方规则</h2>
            <p>来自未定稿 ruleset-v1，仅记录本次演示选择。</p>
          </div>
        </div>

        <div className="rule-cluster-list">
          <RuleCluster
            clusterId="general"
            title="General · 通用规则"
            description="整局通用"
            visualName="rules"
            fields={generalRuleFields}
            isOpen={openRuleClusters.general ?? false}
            selections={ruleSelections}
            onToggle={() => toggleRuleCluster('general')}
            onChange={(fieldId, value) =>
              setRuleSelections((current) => ({
                ...current,
                [fieldId]: value,
              }))
            }
          />

          {relatedRuleGroups.map(({ role, fields }) => (
            <RuleCluster
              key={role.id}
              clusterId={role.id}
              title={role.name}
              description={`${role.name}相关规则`}
              visualName={role.name}
              fields={fields}
              isOpen={openRuleClusters[role.id] ?? false}
              selections={ruleSelections}
              onToggle={() => toggleRuleCluster(role.id)}
              onChange={(fieldId, value) =>
                setRuleSelections((current) => ({
                  ...current,
                  [fieldId]: value,
                }))
              }
            />
          ))}
        </div>
        {relatedRuleGroups.length === 0 ? (
          <p className="empty-rule-state">当前角色没有文档标记的额外配置项。</p>
        ) : null}

        <p className="boundary-note">
          这些选项来自草稿文档中的显式 config 标记，不代表规则已经定稿。
        </p>
      </section>

      <section
        id="zone-players"
        className="config-section"
        aria-labelledby="player-order-heading"
      >
        <div className="config-section-heading config-section-heading--sticky">
          <span aria-hidden="true">04</span>
          <div>
            <h2 id="player-order-heading">已进入房间的玩家</h2>
            <p id="player-drag-help">
              拖动把手排序；玩家序号会自动更新，与用户 ID 无关。
            </p>
          </div>
        </div>

        <p className="reorder-feedback" role="status" aria-live="polite">
          {reorderAnnouncement ||
            `当前为 ${players.length} 位玩家，调整后会自动更新玩家序号。`}
        </p>

        <ol
          className="sortable-player-list"
          aria-labelledby="player-order-heading"
          aria-describedby="player-drag-help"
        >
          {players.map((player, index) => (
            <li
              key={player.id}
              ref={(element) => {
                if (element) playerItemRefs.current.set(player.id, element);
                else playerItemRefs.current.delete(player.id);
              }}
              data-player-id={player.id}
              className={
                draggedPlayerId === player.id
                  ? 'is-dragging'
                  : dropTargetPlayerId === player.id
                    ? 'is-drop-target'
                    : ''
              }
            >
              <span className="player-order-field">
                <label
                  className="visually-hidden"
                  htmlFor={`seat-${player.id}`}
                >
                  {player.nickname}的玩家序号
                </label>
                <input
                  id={`seat-${player.id}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={players.length}
                  step={1}
                  value={seatDrafts[player.id] ?? String(index + 1)}
                  aria-invalid={Boolean(seatErrors[player.id])}
                  aria-describedby={
                    seatErrors[player.id]
                      ? `seat-error-${player.id}`
                      : undefined
                  }
                  onChange={(event) =>
                    changePlayerSeat(player.id, event.target.value)
                  }
                  onBlur={() => resetInvalidSeat(player.id)}
                />
              </span>
              <span className="ordered-player-name">
                <strong>{player.nickname}</strong>
                <small>玩家序号 {index + 1} · 已加入</small>
              </span>
              <button
                className="drag-handle"
                type="button"
                aria-label={`拖动${player.nickname}调整顺序`}
                onPointerDown={(event) => startPlayerDrag(event, player.id)}
                onPointerMove={updatePlayerDrag}
                onPointerUp={finishPlayerDrag}
                onPointerCancel={finishPlayerDrag}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="8" cy="7" r="1" />
                  <circle cx="16" cy="7" r="1" />
                  <circle cx="8" cy="12" r="1" />
                  <circle cx="16" cy="12" r="1" />
                  <circle cx="8" cy="17" r="1" />
                  <circle cx="16" cy="17" r="1" />
                </svg>
              </button>
              <span className="keyboard-reorder-controls">
                <button
                  type="button"
                  aria-label={`上移${player.nickname}`}
                  disabled={index === 0}
                  onClick={() => movePlayer(player.id, -1)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m7 14 5-5 5 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={`下移${player.nickname}`}
                  disabled={index === players.length - 1}
                  onClick={() => movePlayer(player.id, 1)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                </button>
              </span>
              {seatErrors[player.id] ? (
                <span
                  id={`seat-error-${player.id}`}
                  className="player-seat-error"
                >
                  {seatErrors[player.id]}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <div className="configuration-footer">
        <div>
          <strong>
            {hasSeatErrors
              ? '玩家序号需要修正'
              : countsMatch
                ? '可以创建模拟房间'
                : '身份数量需要调整'}
          </strong>
          <span>创建操作不会写入真实后端。</span>
        </div>
        <button
          className="primary-button"
          type="button"
          disabled={
            !countsMatch ||
            Boolean(playerCountError) ||
            hasSeatErrors ||
            isCreating
          }
          aria-busy={isCreating}
          onClick={createRoom}
        >
          {isCreating ? '正在创建…' : '确认配置并创建房间'}
        </button>
      </div>
    </PageCard>
  );
}
