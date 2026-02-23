import { useMemo, useRef, useState, useEffect } from 'react'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import logo from '../assets/images/logo.jpeg'
import { apiClient } from '../lib/apiClient'
import {
  getActualPnlAmount,
  getReportedClosePrice,
  getReportedElevationPrice,
  getReportedPnlAmount,
  getReportedPnlPercent,
  getTradeSuccessLabel,
  hasActualOutcome,
  resolveTradeSuccess,
  toFiniteNumber
} from '../lib/tradeSuccess'

export type ReportItem = {
  id: string
  tradeId: string
  symbol: string
  right: string
  strike: number
  expiration: string
  contracts: number
  entryPrice: number
  highPrice?: number | null
  closePrice?: number
  closePriceActual?: number | null
  pnl?: number | null
  pnlAmount?: number
  pnlPercent?: number
  pnlActual?: number | null
  pnlAmountActual?: number | null
  pnlPercentActual?: number | null
  peakPriceReached?: number | null
  peakRisePrice?: number | null
  peakRisePercent?: number | null
  peakPnlAmount?: number | null
  isSuccessful?: boolean | null
  successRule?: string | null
  usedHighPriceForReport?: boolean | null
  status: string
  reason?: string
  closedAt?: string
  periodDaily?: string
  periodWeekly?: string
  periodMonthly?: string
}

const EMPTY_VALUE = '—'

export const formatPrice = (value: number | null | undefined) => {
  if (!Number.isFinite(value ?? Number.NaN)) return EMPTY_VALUE
  return Number(value).toFixed(2)
}

export const formatPercent = (value: number | null | undefined) => {
  if (!Number.isFinite(value ?? Number.NaN)) return EMPTY_VALUE
  return `${Number(value).toFixed(2)}%`
}

export const formatUsd = (value: number | null | undefined) => {
  if (!Number.isFinite(value ?? Number.NaN)) return EMPTY_VALUE
  return `${Number(value).toFixed(2)}$`
}

export const formatWinRate = (value: number | null | undefined) => {
  if (!Number.isFinite(value ?? Number.NaN)) return '0.00%'
  return `${Number(value).toFixed(2)}%`
}

export const PeakMetricsSection = ({ report }: { report: ReportItem }) => (
  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2 space-y-2">
    <p className="text-[11px] text-slate-400">بيانات القمة</p>
    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
      <div className="space-y-1">
        <p className="text-slate-500">أعلى سعر وصل</p>
        <p>{formatPrice(report.peakPriceReached)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-slate-500">الارتفاع من الدخول</p>
        <p>{formatPrice(report.peakRisePrice)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-slate-500">نسبة الارتفاع</p>
        <p>{formatPercent(report.peakRisePercent)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-slate-500">ربح القمة</p>
        <p>{formatUsd(report.peakPnlAmount)}</p>
      </div>
    </div>
  </div>
)

export const UsedHighPriceBadge = ({ enabled }: { enabled?: boolean | null }) =>
  enabled ? (
    <div className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-200">
      تم اعتماد أعلى سعر في التقرير
    </div>
  ) : null

const Reports = () => {
  const todayIso = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPnL, setTotalPnL] = useState(0)
  const [selectedWinRate, setSelectedWinRate] = useState(0)
  const pageSize = 10
  const summaryRef = useRef<HTMLDivElement | null>(null)

  const today = new Date()
  const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

  const [reports, setReports] = useState<ReportItem[]>([])
  const [periodSummaries, setPeriodSummaries] = useState<
    Array<{ id: 'daily' | 'weekly' | 'monthly'; title: string; totalPnL: number; count: number; winRate: number }>
  >([
    { id: 'daily', title: 'يومي', totalPnL: 0, count: 0, winRate: 0 },
    { id: 'weekly', title: 'أسبوعي', totalPnL: 0, count: 0, winRate: 0 },
    { id: 'monthly', title: 'شهري', totalPnL: 0, count: 0, winRate: 0 }
  ])
  const deleteReport = async (id: string) => {
    try {
      await apiClient.delete(`/reports/${id}`)
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error('Failed to delete report', err)
      setError('تعذّر حذف التقرير')
    }
  }

  const formatExpiryForDisplay = (value?: string | number) => {
    const raw = value != null ? String(value) : ''
    const digits = raw.replace(/-/g, '')
    if (/^[0-9]{8}$/.test(digits)) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
    }
    return raw || '--'
  }

  const filteredTradeReports = useMemo(() => {
    return reports
  }, [reports])

  const toMoney = (value?: number) => {
    if (!Number.isFinite(value ?? Number.NaN)) return '--'
    return `$${Number(value).toFixed(2)}`
  }

  useEffect(() => {
    setPage(1)
  }, [filteredTradeReports.length, viewMode, selectedDate])

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

  // تغيير نطاق التاريخ حسب الاختيار (يومي/أسبوعي/شهري)
  const setPresetRange = (mode: 'daily' | 'weekly' | 'monthly') => {
    setViewMode(mode)
  }

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const path =
          viewMode === 'daily'
            ? '/reports/daily'
            : viewMode === 'weekly'
              ? '/reports/weekly'
              : '/reports/monthly'
        const query = selectedDate ? `?date=${selectedDate}` : ''
        const res = await apiClient.get<{ period: string; totalPnL: number; winRate?: number | null; reports: ReportItem[] }>(
          `${path}${query}`
        )
        setReports(
          (res.reports ?? []).map((item) => ({
            ...item,
            isSuccessful: typeof item.isSuccessful === 'boolean' ? item.isSuccessful : undefined,
            highPrice: toFiniteNumber(item.highPrice),
            closePrice: toFiniteNumber(item.closePrice),
            closePriceActual: toFiniteNumber(item.closePriceActual),
            pnl: toFiniteNumber(item.pnl) ?? toFiniteNumber(item.pnlAmount),
            pnlAmount: toFiniteNumber(item.pnlAmount),
            pnlPercent: toFiniteNumber(item.pnlPercent),
            pnlActual: toFiniteNumber(item.pnlActual) ?? toFiniteNumber(item.pnlAmountActual),
            pnlAmountActual: toFiniteNumber(item.pnlAmountActual),
            pnlPercentActual: toFiniteNumber(item.pnlPercentActual),
            peakPriceReached: toFiniteNumber(item.peakPriceReached),
            peakRisePrice: toFiniteNumber(item.peakRisePrice),
            peakRisePercent: toFiniteNumber(item.peakRisePercent),
            peakPnlAmount: toFiniteNumber(item.peakPnlAmount),
            usedHighPriceForReport:
              typeof item.usedHighPriceForReport === 'boolean' ? item.usedHighPriceForReport : undefined
          }))
        )
        setTotalPnL(res.totalPnL ?? 0)
        setSelectedWinRate(toFiniteNumber(res.winRate) ?? 0)
      } catch (err) {
        console.error(err)
        setError('تعذّر تحميل التقارير')
        setReports([])
        setTotalPnL(0)
        setSelectedWinRate(0)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [viewMode, selectedDate])

  useEffect(() => {
    const fetchAllPeriods = async () => {
      try {
        const query = selectedDate ? `?date=${selectedDate}` : ''
        const [d, w, m] = await Promise.all([
          apiClient.get<{ totalPnL: number; winRate?: number | null; reports: ReportItem[] }>(`/reports/daily${query}`),
          apiClient.get<{ totalPnL: number; winRate?: number | null; reports: ReportItem[] }>(`/reports/weekly${query}`),
          apiClient.get<{ totalPnL: number; winRate?: number | null; reports: ReportItem[] }>(`/reports/monthly${query}`)
        ])
        setPeriodSummaries([
          {
            id: 'daily',
            title: 'يومي',
            totalPnL: d.totalPnL ?? 0,
            count: d.reports?.length ?? 0,
            winRate: toFiniteNumber(d.winRate) ?? 0
          },
          {
            id: 'weekly',
            title: 'أسبوعي',
            totalPnL: w.totalPnL ?? 0,
            count: w.reports?.length ?? 0,
            winRate: toFiniteNumber(w.winRate) ?? 0
          },
          {
            id: 'monthly',
            title: 'شهري',
            totalPnL: m.totalPnL ?? 0,
            count: m.reports?.length ?? 0,
            winRate: toFiniteNumber(m.winRate) ?? 0
          }
        ])
      } catch (err) {
        console.error('Failed to load summaries', err)
      }
    }
    fetchAllPeriods()
  }, [selectedDate])

  const summaryStats = useMemo(() => {
    const total = filteredTradeReports.length
    const net = filteredTradeReports.reduce((acc, t) => acc + (getReportedPnlAmount(t) ?? 0), 0)
    return { total, net, winRate: selectedWinRate }
  }, [filteredTradeReports, selectedWinRate])

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
          {periodSummaries.map((item) => {
            const color =
              item.id === 'daily' ? 'emerald' : item.id === 'weekly' ? 'sky' : 'purple'
            const barColor =
              color === 'emerald' ? 'bg-emerald-400' : color === 'sky' ? 'bg-sky-400' : 'bg-purple-400'
            const textColor =
              color === 'emerald' ? 'text-emerald-300' : color === 'sky' ? 'text-sky-300' : 'text-purple-300'
            const maxCount = Math.max(...periodSummaries.map((s) => s.count || 0), 1)
            const barWidth = `${Math.min(100, Math.round((item.count / maxCount) * 100))}%`
            const isProfit = item.totalPnL >= 0
            return (
              <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white">{item.title}</h4>
                  <span className={`text-xs font-semibold ${textColor}`}>
                    {isProfit ? '+' : '-'}
                    ${Math.abs(item.totalPnL).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">صافي الربح</span>
                    <span className={`font-semibold ${isProfit ? 'text-emerald-300' : 'text-red-400'}`}>
                      {isProfit ? '+' : '-'}${Math.abs(item.totalPnL).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">عدد الصفقات</span>
                    <span className="font-semibold text-white">{item.count}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${barColor}`} style={{ width: barWidth }} />
                </div>
              </div>
            )
          })}
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
            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                className="w-full md:w-auto rounded-xl bg-purple-500/90 text-white font-semibold px-3 py-2 text-sm hover:bg-purple-400 transition"
              >
                عرض ملخص التقرير
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
            جاري تحميل التقارير...
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-200">
            {error}
          </div>
        )}
        {!loading && !error && filteredTradeReports.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
            لا توجد تقارير مطابقة للمرشحات الحالية.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">التقارير المعروضة: {filteredTradeReports.length}</h4>
              <div className="text-sm text-slate-400">صافي الربح: ${totalPnL.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTradeReports.map((t) => {
                const optionType = (t.right ?? (t as any).type ?? '').toUpperCase()
                const typeLabel = optionType || '--'
                const successState = resolveTradeSuccess({ isSuccessful: t.isSuccessful, pnl: t.pnl, pnlAmount: t.pnlAmount })
                const isSuccessful = successState.isSuccessful
                const reportedClosePrice = getReportedClosePrice(t)
                const reportedPnlPercent = getReportedPnlPercent(t) ?? 0
                const actualClose = toFiniteNumber(t.closePriceActual)
                const actualPnlAmount = getActualPnlAmount(t)
                const actualPnlPercent = toFiniteNumber(t.pnlPercentActual)
                const showActualOutcome = hasActualOutcome(t)
                return (
                  <div key={t.id} className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-white">{t.symbol} ({typeLabel})</h4>
                      <Badge variant={isSuccessful ? 'emerald' : 'red'}>
                        {getTradeSuccessLabel({ isSuccessful: t.isSuccessful, pnl: t.pnl, pnlAmount: t.pnlAmount })}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{t.periodDaily ?? t.closedAt?.slice(0, 10) ?? ''}</span>
                      <span>{t.reason === 'STOP_LOSS' ? 'إيقاف خسارة' : 'إغلاق يدوي'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                      <div>
                        <p className="text-xs text-slate-500">سعر الدخول</p>
                        <p className="font-semibold">{toMoney(toFiniteNumber(t.entryPrice))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">سعر الإغلاق</p>
                        <p className="font-semibold">{toMoney(reportedClosePrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">سترايك</p>
                        <p className="font-semibold">{t.strike}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">الانتهاء</p>
                        <p className="font-semibold">{formatExpiryForDisplay(t.expiration)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500">الربح/الخسارة</span>
                      <span className={`text-base font-bold ${reportedPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {reportedPnlPercent >= 0 ? '+' : ''}
                        {reportedPnlPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">نتيجة التقرير ($)</span>
                      <span className={`font-semibold ${(getReportedPnlAmount(t) ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {(getReportedPnlAmount(t) ?? 0) >= 0 ? '+' : ''}
                        {(getReportedPnlAmount(t) ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <PeakMetricsSection report={t} />
                    {showActualOutcome && (
                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2 space-y-1">
                        <p className="text-[11px] text-slate-400">الإغلاق الفعلي</p>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>السعر</span>
                          <span>{toMoney(actualClose)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>النتيجة ($)</span>
                          <span>
                            {actualPnlAmount !== undefined ? `${actualPnlAmount >= 0 ? '+' : ''}${actualPnlAmount.toFixed(2)}` : '--'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>النتيجة (%)</span>
                          <span>
                            {actualPnlPercent !== undefined ? `${actualPnlPercent >= 0 ? '+' : ''}${actualPnlPercent.toFixed(2)}%` : '--'}
                          </span>
                        </div>
                      </div>
                    )}
                    <UsedHighPriceBadge enabled={t.usedHighPriceForReport} />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => deleteReport(t.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-red-200 text-xs font-semibold hover:border-red-400 hover:bg-red-500/15 transition"
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
                {summaryStats.net >= 0 ? (
                  <p className="text-xl" style={{ color: '#34d399' }}>
                    ${summaryStats.net.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xl" style={{ color: '#f87171' }}>
                    -${Math.abs(summaryStats.net).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: '#a78bfa' }}>إجمالي نسب الربح</p>
                <p className="text-xl" style={{ color: '#ffffff' }}>{formatWinRate(summaryStats.winRate)}</p>
                <p className="text-[10px] leading-4" style={{ color: '#a78bfa' }}>
                  مجموع نسب الصفقات المؤهلة (قد تتجاوز 100%)
                </p>
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
          <span className="text-right">الارتفاع</span>
              <span className="text-right">الربح ($)</span>
            </div>
            <div>
              {pagedReports.map((t) => {
                const optionType = (t.right ?? (t as any).type ?? '').toUpperCase()
                const typeLabel = optionType || '--'
                const isCall = optionType === 'CALL'
                const entry = Number.isFinite(t.entryPrice) ? Number(t.entryPrice) : 0
                const current = getReportedElevationPrice(t) ?? entry
                const profit = getReportedPnlAmount(t) ?? 0
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
                      style={{ color: isCall ? '#34d399' : '#f87171' }}
                    >
                      {typeLabel}
                    </span>
                    <span className="text-right">{entry.toFixed(2)}</span>
                    <span className="text-right">{current.toFixed(2)}</span>
                    <span
                      className="text-right font-semibold"
                      style={{ color: isProfit ? '#34d399' : '#f87171' }}
                    >
                      {Math.abs(profit).toFixed(2)}$
                      {isProfit ? '' : '-'}
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
