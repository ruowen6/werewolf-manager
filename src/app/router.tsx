import { createHashRouter } from 'react-router-dom';

import { HomePage } from '../features/home/HomePage';
import { HostStartPage } from '../features/host/HostStartPage';
import { PlayerJoinPage } from '../features/player/PlayerJoinPage';
import { RootLayout } from './RootLayout';

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'host', element: <HostStartPage /> },
      { path: 'join', element: <PlayerJoinPage /> },
    ],
  },
]);
