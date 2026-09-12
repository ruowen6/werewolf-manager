import { RouterProvider } from 'react-router-dom';

import type { RoomGateway } from '../domain/rooms/gateway';
import { mockRoomGateway } from '../mocks/mock-room-gateway';
import { RoomGatewayProvider } from './RoomGatewayProvider';
import { router } from './router';

interface AppProps {
  gateway?: RoomGateway;
  appRouter?: typeof router;
}

export function App({
  gateway = mockRoomGateway,
  appRouter = router,
}: AppProps) {
  return (
    <RoomGatewayProvider gateway={gateway}>
      <RouterProvider router={appRouter} />
    </RoomGatewayProvider>
  );
}
