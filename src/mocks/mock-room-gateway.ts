import type {
  CreateRoomInput,
  HostRoomSnapshot,
  JoinRoomInput,
  PlayerRoomSession,
  RoomGateway,
  UpdatePlayerSeatInput,
} from '../domain/rooms/gateway';
import {
  MOCK_HOST_CONFIGURATION,
  MOCK_HOST_ROOM,
  MOCK_PRIVATE_IDENTITY,
} from './demo-data';

interface MockRoomGatewayOptions {
  delayMs?: number;
}

const DEFAULT_MOCK_DELAY_MS = 450;

function cloneHostRoom(): HostRoomSnapshot {
  return structuredClone(MOCK_HOST_ROOM);
}

function waitForDemoResponse(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

export function createMockRoomGateway(
  options: MockRoomGatewayOptions = {},
): RoomGateway {
  const delayMs = options.delayMs ?? DEFAULT_MOCK_DELAY_MS;
  const joinedPlayers = new Map<string, PlayerRoomSession>();

  return {
    async getHostConfiguration() {
      await waitForDemoResponse(delayMs);
      return structuredClone(MOCK_HOST_CONFIGURATION);
    },

    async createRoom(input: CreateRoomInput) {
      await waitForDemoResponse(delayMs);
      const room = cloneHostRoom();
      const roleCatalog = new Map(
        MOCK_HOST_CONFIGURATION.roles.map((role) => [role.id, role]),
      );
      const playerCatalog = new Map(
        MOCK_HOST_CONFIGURATION.players.map((player) => [player.id, player]),
      );
      const players = input.orderedPlayerIds.flatMap((playerId, index) => {
        const player = playerCatalog.get(playerId);
        return player
          ? [{ ...structuredClone(player), seatNumber: index + 1 }]
          : [];
      });
      const roles = Object.entries(input.roleCounts).flatMap(
        ([roleId, count]) => {
          const role = roleCatalog.get(roleId);
          return role && count > 0
            ? [
                {
                  roleId: role.id,
                  name: role.name,
                  group: role.group,
                  symbol: role.symbol,
                  summary: role.summary,
                  description: role.description,
                  count,
                },
              ]
            : [];
        },
      );
      const totalRoles = roles.reduce((total, role) => total + role.count, 0);

      return {
        ...room,
        statusLabel: '配置已保存',
        players,
        configuration: {
          ...room.configuration,
          playerCount: input.playerCount,
          roles,
          checks: [
            `目标玩家 ${input.playerCount} 人，已选择 ${totalRoles} 张演示身份`,
            `已记录 ${Object.keys(input.ruleSelections).length} 项草稿规则选择`,
            '未执行正式规则、强度或角色兼容性校验',
          ],
        },
      };
    },

    async joinRoom(input: JoinRoomInput): Promise<PlayerRoomSession> {
      await waitForDemoResponse(delayMs);

      const session = {
        roomCode: input.roomCode,
        player: {
          id: 'current-demo-player',
          nickname: input.nickname,
          seatNumber: 6,
        },
        identity: structuredClone(MOCK_PRIVATE_IDENTITY),
      };
      joinedPlayers.set(session.player.id, structuredClone(session));
      return session;
    },

    async updatePlayerSeat(input: UpdatePlayerSeatInput) {
      await waitForDemoResponse(delayMs);
      const session = joinedPlayers.get(input.playerId);
      if (
        !session ||
        session.roomCode !== input.roomCode ||
        !Number.isInteger(input.seatNumber) ||
        input.seatNumber < 1 ||
        input.seatNumber > 13
      ) {
        throw new Error('Invalid demo seat update');
      }

      const player = { ...session.player, seatNumber: input.seatNumber };
      joinedPlayers.set(input.playerId, { ...session, player });
      return structuredClone(player);
    },
  };
}

export const mockRoomGateway = createMockRoomGateway();
