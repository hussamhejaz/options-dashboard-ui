import { type FC, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'


const DashboardLayout: FC = () => {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/trades')) return 'الصفقات'
    if (location.pathname.startsWith('/reports')) return 'التقارير'
    if (location.pathname.startsWith('/ads')) return 'الإعلانات'
    if (location.pathname.startsWith('/settings')) return 'الإعدادات'
    if (location.pathname === '/') return 'لوحة التحكم'
    return 'غير موجود'
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <div className="flex flex-row-reverse">
        <Sidebar
          mobileOpen={mobileOpen}
          desktopOpen={desktopOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleDesktop={() => setDesktopOpen((prev) => !prev)}
        />
        <div
          className={`flex-1 transition-[margin-right] duration-300 mr-0 ${
            desktopOpen ? 'md:mr-64' : 'md:mr-0'
          }`}
        >
          <Topbar
            title={pageTitle}
            onMenu={() => setMobileOpen(true)}
            showDesktopOpen={!desktopOpen}
            onOpenDesktop={() => setDesktopOpen(true)}
          />
          <main className="p-4 md:p-8 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 min-h-[calc(100vh-90px)] overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
