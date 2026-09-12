import {
  createHashRouter,
  createMemoryRouter,
  type RouteObject,
} from 'react-router-dom';

import { HomePage } from '../features/home/HomePage';
import { NightDemoPage } from '../features/host/night-demo/NightDemoPage';
import { HostStartPage } from '../features/host/HostStartPage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';
import { PlayerJoinPage } from '../features/player/PlayerJoinPage';
import { RootLayout } from './RootLayout';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'host', element: <HostStartPage /> },
      { path: 'host/night-demo', element: <NightDemoPage /> },
      { path: 'join', element: <PlayerJoinPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createMemoryAppRouter(initialEntries: string[]) {
  return createMemoryRouter(appRoutes, { initialEntries });
}

export const router = createHashRouter(appRoutes);
