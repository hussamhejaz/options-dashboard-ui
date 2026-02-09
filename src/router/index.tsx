import { useRoutes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Trades from '../pages/Trades'
import Reports from '../pages/Reports'
import Ads from '../pages/Ads'
import Settings from '../pages/Settings'
import NotFound from '../pages/NotFound'
import Login from '../pages/Login'

const Router = () =>
  useRoutes([
    { path: '/login', element: <Login /> },
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'trades', element: <Trades /> },
        { path: 'reports', element: <Reports /> },
        { path: 'ads', element: <Ads /> },
        { path: 'settings', element: <Settings /> },
        { path: '*', element: <NotFound /> }
      ]
    }
  ])

export default Router
