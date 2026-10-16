import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { SquadSync } from './pages/SquadSync';
import { Radar } from './pages/Radar';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'squad', element: <SquadSync /> },
      { path: 'radar', element: <Radar /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);