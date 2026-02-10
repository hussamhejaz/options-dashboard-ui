import { useMemo, useRef, useState, useEffect } from 'react'
import Badge from '../components/ui/Badge'
import { mockTrades } from '../data/mockTrades'
import Modal from '../components/ui/Modal'
import logo from '../assets/images/logo.jpeg'

const Reports = () => {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dayFilter, setDayFilter] = useState<'all' | 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'>('all')
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [monthFilter, setMonthFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const summaryRef = useRef<HTMLDivElement | null>(null)

  const today = new Date()
  const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

  const breakdown = [
    { id: 'daily', title: 'يومي', change: '+1.8%', profit: '$3,240', trades: 12, color: 'emerald' },
    { id: 'weekly', title: 'أسبوعي', change: '+4.2%', profit: '$12,480', trades: 48, color: 'blue' },
    { id: 'monthly', title: 'شهري', change: '+12.6%', profit: '$51,300', trades: 188, color: 'purple' }
  ]

  // بناء بيانات التقارير لكل صفقة مع تواريخ افتراضية
  const tradeReports = useMemo(() => {
    const baseDate = new Date('2026-02-01')
    return mockTrades.map((trade, idx) => {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + idx * 2)
      const iso = date.toISOString().slice(0, 10)
      const dayIdx = date.getDay() // 0 Sunday
      const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
      return {
        ...trade,
        reportDate: iso,
        dayKey: dayMap[dayIdx],
        dayLabel: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][dayIdx]
      }
    })
  }, [])

  const [tradeReportsData, setTradeReportsData] = useState(tradeReports)

  const filteredTradeReports = useMemo(() => {
    return tradeReportsData.filter((t) => {
      const afterFrom = fromDate ? t.reportDate >= fromDate : true
      const beforeTo = toDate ? t.reportDate <= toDate : true
      const byDay = dayFilter === 'all' ? true : t.dayKey === dayFilter
      const monthOk =
        viewMode === 'monthly' && monthFilter !== 'all'
          ? Number(t.reportDate.slice(5, 7)) === Number(monthFilter)
          : true
      return afterFrom && beforeTo && byDay && monthOk
    })
  }, [tradeReportsData, fromDate, toDate, dayFilter, viewMode, monthFilter])

  useEffect(() => {
    setPage(1)
  }, [filteredTradeReports.length, viewMode, fromDate, toDate, dayFilter])

  const pageCount = Math.max(1, Math.ceil(filteredTradeReports.length / pageSize))
  const pagedReports = filteredTradeReports.slice((page - 1) * pageSize, page * pageSize)

  const loadHtml2Canvas = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).html2canvas) return resolve((window as any).html2canvas)
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
      script.async = true
      script.onload = () => resolve((window as any).html2canvas)
      script.onerror = (err) => reject(err)
      document.body.appendChild(script)
    })
  }

  const deleteTradeReportById = (id: string) => {
    setTradeReportsData((prev) => prev.filter((t) => t.id !== id))
  }

  const deleteCurrentFiltered = () => {
    const ids = new Set(filteredTradeReports.map((t) => t.id))
    setTradeReportsData((prev) => prev.filter((t) => !ids.has(t.id)))
  }

  // تغيير نطاق التاريخ حسب الاختيار (يومي/أسبوعي/شهري)
  const setPresetRange = (mode: 'daily' | 'weekly' | 'monthly') => {
    setViewMode(mode)
    if (mode !== 'monthly') setMonthFilter('all')
    const today = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const toDateStr = toStr(today)
    let from = new Date(today)
    if (mode === 'daily') {
      from = today
    } else if (mode === 'weekly') {
      from = new Date(today)
      from.setDate(today.getDate() - 6)
    } else {
      from = new Date(today)
      from.setDate(today.getDate() - 29)
    }
    setFromDate(toStr(from))
    setToDate(toDateStr)
  }

  const toCSV = (rows: any[]) => {
    const header = [
      'symbol',
      'type',
      'reportDate',
      'expiry',
      'strike',
      'entryPrice',
      'currentPrice',
      'pl',
      'status',
      'contracts'
    ]
    const lines = rows.map((r) =>
      [
        r.symbol,
        r.type,
        r.reportDate,
        r.expiry,
        r.strike,
        r.entryPrice,
        r.currentPrice,
        r.pl,
        r.status,
        r.contracts
      ].join(',')
    )
    return [header.join(','), ...lines].join('\n')
  }

  const downloadCSV = (filename: string, rows: any[]) => {
    if (!rows.length) return
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportReports = (scope: 'current' | 'daily' | 'weekly' | 'monthly') => {
    const today = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    let data = filteredTradeReports
    if (scope !== 'current') {
      let from = new Date(today)
      if (scope === 'daily') from = today
      if (scope === 'weekly') {
        from = new Date(today)
        from.setDate(today.getDate() - 6)
      }
      if (scope === 'monthly') {
        from = new Date(today)
        from.setDate(today.getDate() - 29)
      }
      const fromStr = toStr(from)
      const toStrToday = toStr(today)
      data = tradeReportsData.filter((t) => t.reportDate >= fromStr && t.reportDate <= toStrToday)
    }
    downloadCSV(`reports-${scope}.csv`, data)
  }

  const summaryStats = useMemo(() => {
    const total = filteredTradeReports.length
    const wins = filteredTradeReports.filter((t) => t.pl >= 0).length
    const net = filteredTradeReports.reduce(
      (acc, t) => acc + (t.currentPrice - t.entryPrice) * t.contracts * 100,
      0
    )
    const winRate = total ? Math.round((wins / total) * 100) : 0
    return { total, wins, net, winRate }
  }, [filteredTradeReports])

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">ملخص الأداء</h2>
          <p className="text-slate-400 text-sm mt-1">عرض وتحليل الأداء الدوري لاستراتيجيات الخيارات.</p>
        </div>
      </div>

      <section className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">تفاصيل المدد الزمنية</h3>
            <p className="text-sm text-slate-400">أداء يومي، أسبوعي، وشهري مع أبرز الأرقام.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {breakdown.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white">{item.title}</h4>
                <span
                  className={`text-xs font-semibold ${
                    item.color === 'emerald'
                      ? 'text-emerald-300'
                      : item.color === 'blue'
                        ? 'text-sky-300'
                        : 'text-purple-300'
                  }`}
                >
                  {item.change}
                </span>
              </div>
              <div className="space-y-1 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">صافي الربح</span>
                  <span className="font-semibold text-white">{item.profit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">عدد الصفقات</span>
                  <span className="font-semibold text-white">{item.trades}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${
                    item.color === 'emerald'
                      ? 'bg-emerald-400'
                      : item.color === 'blue'
                        ? 'bg-sky-400'
                        : 'bg-purple-400'
                  }`}
                  style={{ width: item.id === 'daily' ? '55%' : item.id === 'weekly' ? '70%' : '88%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* قسم آخر التقارير تم حذفه بناءً على طلب المستخدم */}

      <section className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">تقارير الصفقات حسب التاريخ</h3>
            <p className="text-sm text-slate-400">تصفية حسب يوم الأسبوع أو نطاق التاريخ.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="col-span-1 md:col-span-2 flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPresetRange(mode)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold border transition ${
                    viewMode === mode
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950/80 text-slate-200 border-slate-800 hover:border-emerald-400 hover:text-emerald-100'
                  }`}
                >
                  {mode === 'daily' ? 'يومي' : mode === 'weekly' ? 'أسبوعي' : 'شهري'}
                </button>
              ))}
            </div>
            {viewMode === 'monthly' && (
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value as typeof monthFilter)}
                className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                <option value="all">الشهر (الكل)</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m)}>{`الشهر ${m}`}</option>
                ))}
              </select>
            )}
            <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                className="flex-1 rounded-xl bg-purple-500/90 text-white font-semibold px-3 py-2 text-sm hover:bg-purple-400 transition"
              >
                عرض ملخص النطاق
              </button>
            </div>
          </div>
        </div>

        {filteredTradeReports.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
            لا توجد تقارير مطابقة للمرشحات الحالية.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">التقارير المعروضة: {filteredTradeReports.length}</h4>
              <button
                type="button"
                onClick={deleteCurrentFiltered}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-red-200 text-xs font-semibold hover:border-red-400 hover:bg-red-500/15 transition"
              >
                🗑 حذف التقارير الحالية
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTradeReports.map((t) => {
                const isProfit = t.pl >= 0
                return (
                  <div key={t.id} className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-white">{t.symbol} ({t.type})</h4>
                      <Badge variant={isProfit ? 'emerald' : 'red'}>
                        {isProfit ? 'رابحة' : 'خاسرة'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{t.reportDate}</span>
                      <span>{t.dayLabel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                      <div>
                        <p className="text-xs text-slate-500">سعر الدخول</p>
                        <p className="font-semibold">${t.entryPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">السعر الحالي</p>
                        <p className="font-semibold">${t.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">سترايك</p>
                        <p className="font-semibold">{t.strike}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">الانتهاء</p>
                        <p className="font-semibold">{t.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500">الربح/الخسارة</span>
                      <span className={`text-base font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}
                        {t.pl.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => deleteTradeReportById(t.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-200 text-xs font-semibold hover:border-red-400 hover:text-red-200 hover:bg-red-500/10 transition"
                      >
                        🗑 حذف التقرير
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title={''}
      >
        <div
          className="space-y-4 mx-auto"
          ref={summaryRef}
          style={{ maxWidth: 520, backgroundColor: '#0b1020', padding: '16px', borderRadius: '18px' }}
        >
          <div className="flex justify-center">
            <img src={logo} alt="الشعار" className="h-12 w-auto object-contain" />
          </div>
          <div
            className="rounded-2xl p-4 text-center space-y-2"
            style={{ backgroundColor: '#1a142a', border: '1px solid rgba(124,58,237,0.4)' }}
          >
            <h4 className="text-lg font-bold" style={{ color: '#c4b5fd' }}>
              {viewMode === 'daily' ? 'ملخص يومي' : viewMode === 'weekly' ? 'ملخص أسبوعي' : 'ملخص شهري'}
            </h4>
            <p className="text-xs" style={{ color: '#a78bfa' }}>{todayStr}</p>
            <div className="grid grid-cols-3 gap-3 text-sm font-semibold" style={{ color: '#e9d5ff' }}>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: '#a78bfa' }}>عدد الصفقات</p>
                <p className="text-xl" style={{ color: '#ffffff' }}>{summaryStats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: '#a78bfa' }}>الصافي</p>
                <p className="text-xl" style={{ color: '#34d399' }}>${summaryStats.net.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: '#a78bfa' }}>نسبة الفوز</p>
                <p className="text-xl" style={{ color: '#ffffff' }}>{summaryStats.winRate}%</p>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#120f1d', border: '1px solid rgba(109,40,217,0.7)' }}
          >
            <div
              className="grid grid-cols-5 px-5 py-3"
              style={{
                backgroundColor: '#171428',
                color: '#ffffff',
                borderBottom: '1px solid #7c3aed',
                fontWeight: 800,
                letterSpacing: '0px',
                fontSize: '16px',
                direction: 'rtl',
                textTransform: 'none',
                textShadow: '0 0 4px rgba(124,58,237,0.4)'
              }}
            >
              <span className="text-right">الشركة</span>
              <span className="text-right">النوع</span>
              <span className="text-right">دخول</span>
              <span className="text-right">اعلى</span>
              <span className="text-right">الربح ($)</span>
            </div>
            <div>
              {pagedReports.map((t) => {
                const profit = (t.currentPrice - t.entryPrice) * t.contracts * 100
                const isProfit = profit >= 0
                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-5 text-sm px-5 py-3"
                    style={{
                      color: '#e7e9f5',
                      borderTop: '1px solid rgba(91,33,182,0.18)',
                      backgroundColor: '#0f1324'
                    }}
                  >
                    <span className="text-right">{t.symbol}</span>
                    <span
                      className="text-right font-semibold"
                      style={{ color: t.type === 'CALL' ? '#34d399' : '#f87171' }}
                    >
                      {t.type}
                    </span>
                    <span className="text-right">{t.entryPrice.toFixed(2)}</span>
                    <span className="text-right">{t.currentPrice.toFixed(2)}</span>
                    <span
                      className="text-right font-semibold"
                      style={{ color: isProfit ? '#34d399' : '#f87171' }}
                    >
                      {profit.toFixed(2)}$
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {pageCount > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className="min-w-8 px-3 py-1 rounded-lg text-sm font-semibold transition"
                style={
                  page === p
                    ? { backgroundColor: '#6d28d9', color: '#ffffff', border: '1px solid #7c3aed' }
                    : { backgroundColor: '#0b1220', color: '#e2e8f0', border: '1px solid #1f2937' }
                }
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={async () => {
              if (!summaryRef.current) return
              const html2canvas = await loadHtml2Canvas()
              const canvas = await html2canvas(summaryRef.current, {
                scale: 3,
                backgroundColor: '#0b1020',
                useCORS: true,
                scrollY: -window.scrollY
              })
              const link = document.createElement('a')
              link.download = `summary-${page}.png`
              link.href = canvas.toDataURL('image/png')
              link.click()
            }}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition"
            style={{ backgroundColor: '#059669', color: '#ffffff' }}
          >
            تحميل الصفحة كصورة
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Reports
