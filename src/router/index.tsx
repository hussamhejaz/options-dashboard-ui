import { useRoutes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Trades from '../pages/Trades'
import Reports from '../pages/Reports'
import Ads from '../pages/Ads'
// Settings removed
import NotFound from '../pages/NotFound'
import Login from '../pages/Login'
import RequireAuth from '../components/auth/RequireAuth'

const Router = () =>
  useRoutes([
    { path: '/login', element: <Login /> },
    {
      path: '/',
      element: (
        <RequireAuth>
          <DashboardLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'trades', element: <Trades /> },
        { path: 'reports', element: <Reports /> },
        { path: 'ads', element: <Ads /> },
        // settings route removed
        { path: '*', element: <NotFound /> }
      ]
    }
  ])

export default Router
