export type NightStepTone =
  | 'moon'
  | 'guard'
  | 'wolf'
  | 'seer'
  | 'witch'
  | 'dawn'
  | 'summary'
  | 'complete';

interface NightStepBase {
  id: string;
  actorLabel: string;
  title: string;
  hostPrompt: string;
  guidance: string;
  tone: NightStepTone;
  allowSkip: boolean;
}

export interface InfoNightStep extends NightStepBase {
  kind: 'info';
  acknowledgementLabel: string;
}

export interface TargetNightStep extends NightStepBase {
  kind: 'target';
  action: 'guard' | 'wolf';
  emptyActionLabel: string;
}

export interface RevealNightStep extends NightStepBase {
  kind: 'reveal';
  action: 'seer';
}

export interface ResourceNightStep extends NightStepBase {
  kind: 'resource';
  action: 'witch';
}

export interface ResolutionNightStep extends NightStepBase {
  kind: 'resolution';
}

export interface CompleteNightStep extends NightStepBase {
  kind: 'complete';
}

export type NightDemoStep =
  | InfoNightStep
  | TargetNightStep
  | RevealNightStep
  | ResourceNightStep
  | ResolutionNightStep
  | CompleteNightStep;

export type TargetStatus = 'available' | 'disabled' | 'dead';

export interface NightDemoPlayer {
  id: string;
  seatNumber: number;
  nickname: string;
  status: TargetStatus;
  disabledFor: Partial<Record<'guard' | 'wolf' | 'seer' | 'poison', string>>;
}

export type WitchChoice = 'antidote' | 'poison' | 'pass';

export interface NightDemoAnswers {
  introReady: boolean;
  guardTargetId?: string;
  guardSkipped: boolean;
  wolfTargetId?: string;
  wolfSkipped: boolean;
  seerTargetId?: string;
  seerRevealed: boolean;
  witchChoice?: WitchChoice;
  witchPoisonTargetId?: string;
  nightClosed: boolean;
}
