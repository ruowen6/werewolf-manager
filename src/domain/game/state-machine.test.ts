import { describe, expect, it } from 'vitest';

import { canResumeTo, canTransition } from './state-machine';

describe('game state machine', () => {
  it('allows the lobby to enter board configuration', () => {
    expect(canTransition('LOBBY', 'BOARD_CONFIGURATION')).toBe(true);
  });

  it('does not allow the lobby to skip directly to the night', () => {
    expect(canTransition('LOBBY', 'NIGHT_INTRO')).toBe(false);
  });

  it('allows an active game to pause', () => {
    expect(canTransition('NIGHT_STEP', 'PAUSED')).toBe(true);
  });

  it('only resumes to the phase recorded before pausing', () => {
    expect(canResumeTo('NIGHT_STEP', 'NIGHT_STEP')).toBe(true);
    expect(canResumeTo('NIGHT_STEP', 'DAY_DISCUSSION')).toBe(false);
  });
});
