import { useEffect, useState, type FC } from 'react'

type TopbarProps = {
  title: string
  onMenu?: () => void
  showDesktopOpen?: boolean
  onOpenDesktop?: () => void
}

const Topbar: FC<TopbarProps> = ({ title, onMenu, showDesktopOpen, onOpenDesktop }) => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])

  const dateString = now.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const timeString = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/60 backdrop-blur-lg" dir="rtl">
      <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-3">
          {showDesktopOpen && (
            <button
              type="button"
              onClick={onOpenDesktop}
              className="hidden md:inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/60 bg-gradient-to-br from-purple-900/80 via-[#1b1230] to-[#0d0a1a] shadow-[0_10px_24px_-12px_rgba(139,92,246,0.7)] backdrop-blur hover:border-purple-200 hover:shadow-[0_14px_30px_-12px_rgba(168,85,247,0.8)] transition duration-200"
              aria-label="فتح القائمة الجانبية"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-100">
                <rect x="5" y="7" width="14" height="2" rx="1" fill="currentColor" />
                <rect x="5" y="11" width="14" height="2" rx="1" fill="currentColor" />
                <rect x="5" y="15" width="10" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          )}
          <h1 className="text-2xl font-bold text-purple-200 mt-1 text-right">{title}</h1>
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-2xl border border-purple-300/60 bg-gradient-to-br from-purple-900/70 via-[#1b1230] to-[#0d0a1a] text-purple-100 shadow-[0_8px_20px_-12px_rgba(139,92,246,0.7)]"
            onClick={onMenu}
            aria-label="فتح القائمة الجانبية"
          >
            ☰
          </button>
        </div>
        <div className="flex-1 hidden md:flex flex-col items-center text-base text-slate-200">
          <span className="font-semibold text-lg text-white leading-tight">{timeString}</span>
          <span className="text-slate-400 text-sm leading-tight">{dateString}</span>
        </div>
        <div className="md:hidden flex flex-col items-start text-sm text-slate-200">
          <span className="font-semibold text-white leading-tight">{timeString}</span>
          <span className="text-slate-400 text-xs leading-tight">{dateString}</span>
        </div>
        <div className="hidden md:block w-11" /> {/* spacer to balance the left button width */}
      </div>
    </header>
  )
}

export default Topbar
