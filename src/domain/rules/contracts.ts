import type { CardSlot, Faction, GameState } from '../game/model';

export type RoleCategory = 'villager' | 'god' | 'wolf' | 'other';
export type ActionType =
  'none' | 'chooseTarget' | 'chooseTargets' | 'confirm' | 'chooseOption';

export interface RoleDefinition {
  id: string;
  name: string;
  faction: Faction;
  category: RoleCategory;
  description: string;
  hasNightAction: boolean;
  wakeOrder?: number;
  firstNightOnly?: boolean;
  requiresAliveToAct: boolean;
  actionType?: ActionType;
  publicRules: readonly string[];
  hostRules: readonly string[];
  rulesetVersion: string;
}

export interface StepContext {
  state: GameState;
  roleIdsInPlay: ReadonlySet<string>;
}

export interface GameStepDefinition {
  id: string;
  phase: 'firstNight' | 'night' | 'day' | 'resolution';
  order: number;
  roleId?: string;
  cardSlot?: CardSlot;
  shouldRun: (context: StepContext) => boolean;
  prompt: string;
  actionType: ActionType;
}

export interface RulesetDefinition {
  id: string;
  version: string;
  displayName: string;
  roles: readonly RoleDefinition[];
  steps: readonly GameStepDefinition[];
}
