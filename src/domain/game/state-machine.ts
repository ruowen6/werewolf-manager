import type { GamePhase } from './model';

const allowedTransitions = {
  LOBBY: ['BOARD_CONFIGURATION'],
  BOARD_CONFIGURATION: ['BOARD_CONFIRMATION', 'LOBBY'],
  BOARD_CONFIRMATION: ['ROLE_DISTRIBUTION', 'BOARD_CONFIGURATION'],
  ROLE_DISTRIBUTION: ['ROLE_REVEAL'],
  ROLE_REVEAL: ['NIGHT_INTRO'],
  NIGHT_INTRO: ['NIGHT_STEP'],
  NIGHT_STEP: ['NIGHT_STEP', 'NIGHT_RESOLUTION'],
  NIGHT_RESOLUTION: ['DAWN_ANNOUNCEMENT', 'WIN_CHECK'],
  DAWN_ANNOUNCEMENT: ['DEATH_SKILL_RESOLUTION', 'DAY_DISCUSSION', 'WIN_CHECK'],
  DAY_DISCUSSION: ['EXILE_VOTE'],
  EXILE_VOTE: ['EXILE_RESOLUTION'],
  EXILE_RESOLUTION: ['DEATH_SKILL_RESOLUTION', 'WIN_CHECK'],
  DEATH_SKILL_RESOLUTION: ['DEATH_SKILL_RESOLUTION', 'WIN_CHECK'],
  WIN_CHECK: ['GAME_OVER', 'NIGHT_INTRO', 'DAY_DISCUSSION'],
  GAME_OVER: [],
  PAUSED: [],
} satisfies Record<GamePhase, readonly GamePhase[]>;

export function canTransition(from: GamePhase, to: GamePhase): boolean {
  if (to === 'PAUSED') {
    return from !== 'GAME_OVER' && from !== 'PAUSED';
  }

  return allowedTransitions[from].includes(to as never);
}

export function canResumeTo(
  pausedFromPhase: Exclude<GamePhase, 'PAUSED'>,
  to: GamePhase,
): boolean {
  return to === pausedFromPhase;
}
