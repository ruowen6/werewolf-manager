import type { CardSlot, GamePhase } from './model';

interface EventMetadata {
  id: string;
  roomId: string;
  gameId: string;
  dayNumber: number;
  phase: GamePhase;
  createdAt: string;
  createdBy: string;
  stateVersion: number;
  idempotencyKey: string;
  actorCardSlot?: CardSlot;
  replacesEventId?: string;
}

export type GameEvent = EventMetadata &
  (
    | { type: 'GUARD_PROTECTED'; actorId: string; targetId: string }
    | { type: 'WOLVES_ATTACKED'; targetId: string }
    | { type: 'SEER_INSPECTED'; actorId: string; targetId: string }
    | { type: 'WITCH_SAVED'; actorId: string; targetId: string }
    | { type: 'WITCH_POISONED'; actorId: string; targetId: string }
    | {
        type: 'PLAYER_VOTED';
        voterId: string;
        targetId: string | null;
      }
    | { type: 'PLAYER_EXILED'; playerId: string }
    | { type: 'SKILL_DECLINED'; playerId: string; skillId: string }
  );
