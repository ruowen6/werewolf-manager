import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useRoomGateway } from '../../app/RoomGatewayProvider';
import { PageCard } from '../../components/PageCard';
import { ZoneNavigation } from '../../components/ZoneNavigation';
import type { PlayerRoomSession } from '../../domain/rooms/gateway';
import { IdentityRevealCard } from './IdentityRevealCard';

const PLAYER_ROOM_ZONES = [
  { id: 'zone-player-overview', label: '房间概况' },
  { id: 'zone-player-seat', label: '调整座位' },
  { id: 'zone-player-identity', label: '我的身份' },
] as const;

interface FormErrors {
  roomCode?: string;
  nickname?: string;
}

function validateJoinForm(roomCode: string, nickname: string): FormErrors {
  const errors: FormErrors = {};

  if (!/^\d{6}$/.test(roomCode)) {
    errors.roomCode = '请输入完整的 6 位数字房间号。';
  }

  const normalizedNickname = nickname.trim();
  if (!normalizedNickname) {
    errors.nickname = '请输入你的昵称。';
  } else if (normalizedNickname.length > 12) {
    errors.nickname = '昵称不能超过 12 个字符。';
  }

  return errors;
}

function PlayerRoom({
  session,
  onUpdateSeat,
}: {
  session: PlayerRoomSession;
  onUpdateSeat: (seatNumber: number) => Promise<void>;
}) {
  const [seatInput, setSeatInput] = useState(String(session.player.seatNumber));
  const [seatError, setSeatError] = useState('');
  const [seatMessage, setSeatMessage] = useState('');
  const [isUpdatingSeat, setIsUpdatingSeat] = useState(false);

  async function submitSeatChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSeat = Number(seatInput);
    setSeatMessage('');

    if (
      !/^\d+$/.test(seatInput) ||
      !Number.isInteger(nextSeat) ||
      nextSeat < 1 ||
      nextSeat > 13
    ) {
      setSeatError('请输入 1 到 13 之间的整数。');
      return;
    }

    setSeatError('');
    setIsUpdatingSeat(true);
    try {
      await onUpdateSeat(nextSeat);
      setSeatMessage(`座位号已调整为 ${nextSeat} 号。`);
    } catch {
      setSeatError('暂时无法调整模拟座位号，请重试。');
    } finally {
      setIsUpdatingSeat(false);
    }
  }

  return (
    <div className="player-room-shell">
      <ZoneNavigation roomCode={session.roomCode} zones={PLAYER_ROOM_ZONES} />
      <PageCard
        tone="player"
        eyebrow="玩家端 · 演示模式"
        title={`${session.player.seatNumber} 号，准备看牌`}
        description="身份已经发放。先避开旁观视线，再主动打开身份卡。"
      >
        <dl id="zone-player-overview" className="player-room-facts">
          <div>
            <dt>玩家</dt>
            <dd>{session.player.nickname}</dd>
          </div>
          <div>
            <dt>座位</dt>
            <dd>{session.player.seatNumber} 号</dd>
          </div>
          <div>
            <dt>房间号</dt>
            <dd>{session.roomCode}</dd>
          </div>
          <div>
            <dt>发牌状态</dt>
            <dd>身份已经发放</dd>
          </div>
        </dl>

        <section
          id="zone-player-seat"
          className="player-seat-section"
          aria-labelledby="player-seat-heading"
        >
          <div>
            <h2 id="player-seat-heading">调整我的座位号</h2>
            <p>只更新本次演示中的本人座位，不会显示其他玩家身份。</p>
          </div>
          <form className="player-seat-form" onSubmit={submitSeatChange}>
            <label htmlFor="player-seat-number">新的座位号</label>
            <input
              id="player-seat-number"
              type="number"
              inputMode="numeric"
              min={1}
              max={13}
              step={1}
              value={seatInput}
              aria-invalid={Boolean(seatError)}
              aria-describedby={
                seatError
                  ? 'player-seat-error'
                  : seatMessage
                    ? 'player-seat-message'
                    : undefined
              }
              onChange={(event) => {
                setSeatInput(event.target.value);
                setSeatError('');
                setSeatMessage('');
              }}
            />
            <button
              className="secondary-button"
              type="submit"
              disabled={isUpdatingSeat}
              aria-busy={isUpdatingSeat}
            >
              {isUpdatingSeat ? '正在调整…' : '保存座位号'}
            </button>
          </form>
          {seatError ? (
            <p id="player-seat-error" className="field-error" role="alert">
              {seatError}
            </p>
          ) : null}
          <p
            id="player-seat-message"
            className="inline-feedback seat-feedback"
            aria-live="polite"
          >
            {seatMessage}
          </p>
        </section>

        <div id="zone-player-identity">
          <IdentityRevealCard identity={session.identity} />
        </div>

        <Link className="text-link" to="/">
          离开演示房间
        </Link>
      </PageCard>
    </div>
  );
}

export function PlayerJoinPage() {
  const gateway = useRoomGateway();
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [session, setSession] = useState<PlayerRoomSession | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateJoinForm(roomCode, nickname);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsJoining(true);
    try {
      const joinedSession = await gateway.joinRoom({
        roomCode,
        nickname: nickname.trim(),
      });
      setSession(joinedSession);
    } catch {
      setSubmitError('暂时无法加入模拟房间，请稍后重试。');
    } finally {
      setIsJoining(false);
    }
  }

  async function updatePlayerSeat(seatNumber: number) {
    if (!session) return;
    const player = await gateway.updatePlayerSeat({
      roomCode: session.roomCode,
      playerId: session.player.id,
      seatNumber,
    });
    setSession((current) => (current ? { ...current, player } : current));
  }

  if (session) {
    return <PlayerRoom session={session} onUpdateSeat={updatePlayerSeat} />;
  }

  return (
    <PageCard
      tone="player"
      eyebrow="玩家端 · 演示模式"
      title="加入模拟房间"
      description="输入任意 6 位数字和昵称即可体验。不会验证或连接真实房间。"
    >
      <form className="join-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="room-code">六位房间号</label>
          <input
            id="room-code"
            name="roomCode"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="例如 728314"
            value={roomCode}
            onChange={(event) => {
              setRoomCode(event.target.value.replace(/\D/g, ''));
              if (errors.roomCode) {
                setErrors((current) => ({ ...current, roomCode: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.roomCode)}
            aria-describedby={errors.roomCode ? 'room-code-error' : undefined}
          />
          {errors.roomCode ? (
            <p id="room-code-error" className="field-error">
              {errors.roomCode}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="nickname">昵称</label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            autoComplete="nickname"
            maxLength={12}
            placeholder="大家怎么称呼你"
            value={nickname}
            onChange={(event) => {
              setNickname(event.target.value);
              if (errors.nickname) {
                setErrors((current) => ({ ...current, nickname: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.nickname)}
            aria-describedby={errors.nickname ? 'nickname-error' : undefined}
          />
          {errors.nickname ? (
            <p id="nickname-error" className="field-error">
              {errors.nickname}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          className="primary-button full-width"
          type="submit"
          disabled={isJoining}
          aria-busy={isJoining}
        >
          {isJoining ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              正在加入模拟房间…
            </>
          ) : (
            '加入模拟房间'
          )}
        </button>
      </form>

      <p className="boundary-note">
        房间号只用于本地 Mock 展示，本流程不会保存凭证或写入浏览器存储。
      </p>
      <Link className="text-link" to="/">
        返回首页
      </Link>
    </PageCard>
  );
}
