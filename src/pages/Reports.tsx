import { useMemo, useState } from 'react'
import ReportCard from '../components/cards/ReportCard'
import StatCard from '../components/cards/StatCard'
import Badge from '../components/ui/Badge'
import { reportCards, reportList, reportSummary } from '../data/mockReports'
import { mockTrades } from '../data/mockTrades'
import Modal from '../components/ui/Modal'

const Reports = () => {
  const [reports, setReports] = useState(reportList)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dayFilter, setDayFilter] = useState<'all' | 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'>('all')
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [summaryOpen, setSummaryOpen] = useState(false)

  const deleteReports = (scope: 'all' | 'complete' | 'processing') => {
    setReports((prev) => {
      if (scope === 'all') return []
      return prev.filter((r) => (scope === 'complete' ? r.status !== 'مكتمل' : r.status !== 'قيد المعالجة'))
    })
  }

  const deleteReportById = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

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
      return afterFrom && beforeTo && byDay
    })
  }, [tradeReportsData, fromDate, toDate, dayFilter])

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
    const net = filteredTradeReports.reduce((acc, t) => acc + (t.currentPrice - t.entryPrice) * t.contracts, 0)
    const winRate = total ? Math.round((wins / total) * 100) : 0
    return { total, wins, net, winRate }
  }, [filteredTradeReports])

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">التقارير</h2>
          <p className="text-slate-400 text-sm mt-1">عرض وتحليل التقارير الدورية لأداء استراتيجيات الخيارات.</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">ملخص الأداء</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportSummary.map((stat) => (
            <StatCard key={stat.id} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 w-full md:w-auto">
            <div className="col-span-2 md:col-span-3 flex items-center gap-2">
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
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
              aria-label="من تاريخ"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
              aria-label="إلى تاريخ"
            />
            <button
              type="button"
              onClick={() => { setFromDate(''); setToDate(''); setDayFilter('all') }}
              className="rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-emerald-400 hover:text-emerald-200 transition"
            >
              إعادة تعيين
            </button>
            <div className="col-span-2 md:col-span-6 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                className="flex-1 rounded-xl bg-purple-500/90 text-white font-semibold px-3 py-2 text-sm hover:bg-purple-400 transition"
              >
                عرض ملخص النطاق
              </button>
              <button
                type="button"
                onClick={() => exportReports('current')}
                className="flex-1 rounded-xl bg-emerald-500 text-slate-950 font-semibold px-3 py-2 text-sm hover:bg-emerald-400 transition"
              >
                تصدير النتائج الحالية (CSV)
              </button>
              <div className="grid grid-cols-3 gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => exportReports('daily')}
                  className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-100 transition"
                >
                  تصدير يومي
                </button>
                <button
                  type="button"
                  onClick={() => exportReports('weekly')}
                  className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-100 transition"
                >
                  تصدير أسبوعي
                </button>
                <button
                  type="button"
                  onClick={() => exportReports('monthly')}
                  className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-100 transition"
                >
                  تصدير شهري
                </button>
              </div>
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

      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} title={`ملخص ${viewMode === 'daily' ? 'يومي' : viewMode === 'weekly' ? 'أسبوعي' : 'شهري'}`}>
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#1a142a] border border-purple-600/40 p-4 text-center space-y-2">
            <h4 className="text-lg font-bold text-purple-200">إحصائيات الملخص</h4>
            <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-purple-100">
              <div className="space-y-1">
                <p className="text-xs text-purple-300">عدد الصفقات</p>
                <p className="text-xl text-white">{summaryStats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-purple-300">الصافي ($)</p>
                <p className="text-xl text-emerald-300">${summaryStats.net.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-purple-300">نسبة الفوز</p>
                <p className="text-xl text-white">{summaryStats.winRate}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-700/30 bg-[#120f1d] overflow-hidden">
            <div className="grid grid-cols-5 text-xs uppercase tracking-wide text-purple-300 px-4 py-2 border-b border-purple-800/50">
              <span className="text-right">الشركة</span>
              <span className="text-right">النوع</span>
              <span className="text-right">دخول</span>
              <span className="text-right">خروج</span>
              <span className="text-right">الربح ($)</span>
            </div>
            <div className="divide-y divide-purple-900/40">
              {filteredTradeReports.map((t) => {
                const profit = (t.currentPrice - t.entryPrice) * t.contracts
                const isProfit = profit >= 0
                return (
                  <div key={t.id} className="grid grid-cols-5 text-sm text-slate-100 px-4 py-3">
                    <span className="text-right">{t.symbol}</span>
                    <span className={`text-right font-semibold ${t.type === 'CALL' ? 'text-emerald-300' : 'text-red-300'}`}>
                      {t.type}
                    </span>
                    <span className="text-right">{t.entryPrice.toFixed(2)}</span>
                    <span className="text-right">{t.currentPrice.toFixed(2)}</span>
                    <span className={`text-right font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit.toFixed(2)}$
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Reports
