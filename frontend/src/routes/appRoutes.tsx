import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
// import ConciliationPage from '../features/conciliation/pages/ConciliationPage';
// import HistoryPage from '../features/history/pages/HistoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        // element: <ConciliationPage />,
      },
      {
        path: 'historial',
        // element: <HistoryPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);