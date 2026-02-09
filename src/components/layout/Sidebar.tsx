import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/images/logo.jpeg'

type Props = {
  mobileOpen: boolean
  desktopOpen: boolean
  onCloseMobile: () => void
  onToggleDesktop: () => void
}

const items = [
  { id: 'dashboard', label: 'لوحة التحكم', to: '/' },
  { id: 'trades', label: 'الصفقات', to: '/trades' },
  { id: 'reports', label: 'التقارير', to: '/reports' },
  { id: 'ads', label: 'الإعلانات', to: '/ads' },
  { id: 'settings', label: 'الإعدادات', to: '/settings' }
]

const Sidebar: FC<Props> = ({ mobileOpen, desktopOpen, onCloseMobile, onToggleDesktop }) => {
  return (
    <>
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex min-h-[100vh] w-full max-w-[320px] md:max-w-none md:w-64 flex-col bg-slate-900/70 backdrop-blur-xl border-l border-slate-800 text-gray-100 shadow-xl transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        } ${desktopOpen ? 'md:translate-x-0' : 'md:translate-x-full'}`}
        dir="rtl"
      >
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center justify-center flex-1 min-w-0">
            <img
              src={logo}
              alt="شعار"
              className="w-40 h-18 object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/60 text-purple-300 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.8)] backdrop-blur transition duration-200 hover:border-purple-400/70 hover:bg-slate-800/80 hover:shadow-[0_10px_28px_-12px_rgba(139,92,246,0.55)]"
              aria-label="إغلاق القائمة الجانبية"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onToggleDesktop}
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/60 text-purple-300 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.8)] backdrop-blur transition duration-200 hover:border-purple-400/70 hover:bg-slate-900/80 hover:shadow-[0_10px_28px_-12px_rgba(139,92,246,0.55)]"
              aria-label={desktopOpen ? 'إخفاء القائمة الجانبية' : 'إظهار القائمة الجانبية'}
            >
              {desktopOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0">
                  <line x1="5" y1="7" x2="19" y2="7" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <line x1="5" y1="17" x2="19" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4">
            {items.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3 py-3 rounded-xl text-right transition-colors ${
                      isActive ? 'bg-purple-600/20 text-purple-200 border border-purple-500/50' : 'hover:bg-slate-800/80 text-gray-100'
                    }`
                  }
                  onClick={onCloseMobile}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 opacity-70" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 py-5 border-t border-slate-800 text-sm text-slate-400">
          <p>إصدار تجريبي</p>
          <p className="text-xs mt-1">آخر تحديث: 08 فبراير 2026</p>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onCloseMobile} />}
    </>
  )
}

export default Sidebar
