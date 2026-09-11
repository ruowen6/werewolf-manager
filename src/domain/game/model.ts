export const GAME_PHASES = [
  'LOBBY',
  'BOARD_CONFIGURATION',
  'BOARD_CONFIRMATION',
  'ROLE_DISTRIBUTION',
  'ROLE_REVEAL',
  'NIGHT_INTRO',
  'NIGHT_STEP',
  'NIGHT_RESOLUTION',
  'DAWN_ANNOUNCEMENT',
  'DAY_DISCUSSION',
  'EXILE_VOTE',
  'EXILE_RESOLUTION',
  'DEATH_SKILL_RESOLUTION',
  'WIN_CHECK',
  'GAME_OVER',
  'PAUSED',
] as const;

export type GamePhase = (typeof GAME_PHASES)[number];
export type GameMode = 'single' | 'dual';
export type CardSlot = 'single' | 'top' | 'bottom';
export type Faction = 'village' | 'werewolf' | 'thirdParty';
export type PlayerLifeState = 'alive' | 'dead';

export interface PlayerState {
  id: string;
  seatNumber: number;
  nickname: string;
  lifeState: PlayerLifeState;
  statuses: readonly string[];
}

export interface GameState {
  gameId: string;
  roomId: string;
  rulesetVersion: string;
  mode: GameMode;
  dayNumber: number;
  phase: GamePhase;
  pausedFromPhase?: Exclude<GamePhase, 'PAUSED'>;
  currentStepId: string | null;
  stateVersion: number;
  players: readonly PlayerState[];
}
