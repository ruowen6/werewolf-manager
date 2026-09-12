import { createContext, type PropsWithChildren, useContext } from 'react';

import type { RoomGateway } from '../domain/rooms/gateway';

const RoomGatewayContext = createContext<RoomGateway | null>(null);

interface RoomGatewayProviderProps extends PropsWithChildren {
  gateway: RoomGateway;
}

export function RoomGatewayProvider({
  gateway,
  children,
}: RoomGatewayProviderProps) {
  return (
    <RoomGatewayContext.Provider value={gateway}>
      {children}
    </RoomGatewayContext.Provider>
  );
}

export function useRoomGateway(): RoomGateway {
  const gateway = useContext(RoomGatewayContext);

  if (!gateway) {
    throw new Error('RoomGatewayProvider 尚未配置。');
  }

  return gateway;
}
