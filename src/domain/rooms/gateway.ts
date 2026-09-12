export interface RoomPlayer {
  id: string;
  nickname: string;
  seatNumber: number;
}

export interface ConfigurationRoleSummary {
  roleId: string;
  name: string;
  group: RoleLibraryGroup;
  symbol: string;
  summary: string;
  description: string;
  count: number;
}

export type RoleLibraryGroup = 'villager' | 'god' | 'werewolf';

export interface RoleCatalogEntry {
  id: string;
  name: string;
  group: RoleLibraryGroup;
  symbol: string;
  summary: string;
  description: string;
  defaultCount: number;
}

export interface RuleChoiceOption {
  value: string;
  label: string;
  description: string;
}

export interface RuleChoiceField {
  id: string;
  label: string;
  description: string;
  sourceRuleId: string;
  relatedRoleId?: string;
  defaultValue: string;
  options: readonly RuleChoiceOption[];
}

export interface HostConfigurationSetup {
  defaultPlayerCount: number;
  roles: readonly RoleCatalogEntry[];
  ruleFields: readonly RuleChoiceField[];
  players: readonly RoomPlayer[];
}

export interface CreateRoomInput {
  playerCount: number;
  roleCounts: Readonly<Record<string, number>>;
  ruleSelections: Readonly<Record<string, string>>;
  orderedPlayerIds: readonly string[];
}

export interface GameConfigurationPreview {
  id: string;
  name: string;
  mode: 'single';
  playerCount: number;
  roles: readonly ConfigurationRoleSummary[];
  checks: readonly string[];
}

export interface HostRoomSnapshot {
  code: string;
  statusLabel: string;
  players: readonly RoomPlayer[];
  configuration: GameConfigurationPreview;
}

export interface PrivateIdentity {
  name: string;
  factionLabel: string;
  skillSummary: string;
  publicNotes: readonly string[];
}

export interface PlayerRoomSession {
  roomCode: string;
  player: RoomPlayer;
  identity: PrivateIdentity;
}

export interface JoinRoomInput {
  roomCode: string;
  nickname: string;
}

export interface UpdatePlayerSeatInput {
  roomCode: string;
  playerId: string;
  seatNumber: number;
}

/**
 * Pages depend on this boundary. A future Supabase adapter can implement the
 * same operations without changing the UI or leaking backend details into it.
 */
export interface RoomGateway {
  getHostConfiguration(): Promise<HostConfigurationSetup>;
  createRoom(input: CreateRoomInput): Promise<HostRoomSnapshot>;
  joinRoom(input: JoinRoomInput): Promise<PlayerRoomSession>;
  updatePlayerSeat(input: UpdatePlayerSeatInput): Promise<RoomPlayer>;
}
