import { useEffect, useMemo, useState, useCallback } from 'react'
import StatCard from '../components/cards/StatCard'
import TradeCard from '../components/cards/TradeCard'
import TradesTable from '../components/tables/TradesTable'
import { apiClient } from '../lib/apiClient'
import type { Trade } from '../types/trade'

type DashboardTrade = {
  id: string
  symbol: string
  right: 'call' | 'put'
  strike: number
  expiration: string
  status: 'OPEN' | 'CLOSED' | 'INVALID'
  entryPrice?: number
  currentPrice?: number
  highPrice?: number
  lastMidPrice?: number
  contracts?: number
  pnlAmount?: number
  pnlPercent?: number
  closePrice?: number
}

const mapDashToTrade = (t: DashboardTrade): Trade => {
  const expiryRaw = String(t.expiration ?? '')
  const expiryFormatted =
    /^[0-9]{8}$/.test(expiryRaw) ? `${expiryRaw.slice(0, 4)}-${expiryRaw.slice(4, 6)}-${expiryRaw.slice(6, 8)}` : expiryRaw
  const entryPrice = Number(t.entryPrice ?? 0)
  const currentPrice = Number(t.currentPrice ?? entryPrice)
  const rawHigh = t.highPrice ?? Number.NaN
  return {
    id: t.id,
    symbol: t.symbol,
    type: (t.right ?? 'call').toUpperCase() as Trade['type'],
    strike: Number(t.strike ?? 0),
    expiry: expiryFormatted,
    entryPrice,
    currentPrice,
    highPrice: Number.isFinite(rawHigh) && rawHigh > 0 ? Number(rawHigh) : null,
    closePrice: Number.isFinite(t.closePrice ?? NaN) ? Number(t.closePrice) : undefined,
    pnlAmount: Number(t.pnlAmount ?? 0),
    lastMidPrice: Number(t.lastMidPrice ?? 0),
    pl: Number(t.pnlPercent ?? 0),
    status: t.status === 'CLOSED' ? 'closed' : t.status === 'INVALID' ? 'invalid' : 'open',
    contracts: Number(t.contracts ?? 1),
    stopLoss: undefined
  }
}

const Dashboard = () => {
  const [openTrades, setOpenTrades] = useState<Trade[]>([])
  const [closedTrades, setClosedTrades] = useState<DashboardTrade[]>([])
  const [summary, setSummary] = useState<{
    netProfit: number
    winRate: number
    openCount: number
    closedCount: number
    winCount: number
    lossCount: number
    weeklyProfit: { label: string; value: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sparkData = useMemo(() => {
    const fromSummary = summary?.weeklyProfit?.map((w) => Number(w.value) || 0) ?? []
    if (fromSummary.length) return fromSummary
    const closed = closedTrades.slice(0, 10)
    if (closed.length === 0) return [0]
    return closed.map((t) => Number(t.pnlAmount ?? 0) || 0)
  }, [closedTrades, summary])
  const hasSpark = sparkData.length > 0
  const maxValue = Math.max(...sparkData, 1)

  const stats = useMemo(() => {
    const totalPnL = summary?.netProfit ?? closedTrades.reduce((sum, t) => sum + Number(t.pnlAmount ?? 0), 0)
    const closedCount = summary?.closedCount ?? closedTrades.length
    const wins = summary?.winCount ?? closedTrades.filter((t) => Number(t.pnlAmount ?? 0) > 0).length
    const openCount = summary?.openCount ?? openTrades.length
    const winRate = summary?.winRate ?? (closedCount ? Math.round((wins / closedCount) * 100) : 0)
    const losses = summary?.lossCount ?? closedTrades.filter((t) => Number(t.pnlAmount ?? 0) <= 0).length
    return [
      { id: 'wins', label: 'صفقات رابحة', value: `${wins}`, delta: '' },
      { id: 'losses', label: 'صفقات خاسرة', value: `${losses}`, delta: '' },
      { id: 'open', label: 'صفقات مفتوحة', value: `${openCount}`, delta: '' },
      {
        id: 'pnl',
        label: 'صافي الربح',
        value: `$${totalPnL.toFixed(2)}`,
        delta: `${winRate}% معدل الفوز`
      }
    ]
  }, [openTrades, closedTrades, summary])

  const donutStats = useMemo(() => {
    const win = summary?.winCount ?? closedTrades.filter((t) => Number(t.pnlAmount ?? 0) > 0).length
    const lose = summary?.lossCount ?? closedTrades.filter((t) => Number(t.pnlAmount ?? 0) <= 0).length
    const open = summary?.openCount ?? openTrades.length
    return { win, lose, open }
  }, [summary, closedTrades, openTrades])
  const donutTotal = Math.max(donutStats.win + donutStats.lose + donutStats.open, 1)
  const donutRadius = 70
  const donutCirc = 2 * Math.PI * donutRadius

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [openRes, closedRes, summaryRes] = await Promise.all([
        apiClient.get<DashboardTrade[]>('/trades/dashboard?status=OPEN'),
        apiClient.get<DashboardTrade[]>('/trades?status=CLOSED'),
        apiClient.get<{
          netProfit: number
          winRate: number
          openCount: number
          closedCount: number
          winCount: number
          lossCount: number
          weeklyProfit: { label: string; value: number }[]
        }>('/dashboard/summary')
      ])
      setOpenTrades(openRes.map(mapDashToTrade))
      setClosedTrades(closedRes)
      setSummary(summaryRes)
    } catch (err) {
      console.error(err)
      setError('تعذر تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])


  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">لوحة التحكم</h2>
        <div className="flex items-center gap-3 text-xs">
          {loading && <span className="text-slate-400">جاري التحديث...</span>}
          {error && <span className="text-red-400">{error}</span>}
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} />
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-950 border border-slate-800 shadow-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">الأداء الأسبوعي</p>
              <h3 className="text-lg font-semibold text-white">حركة الأرباح</h3>
            </div>
            <span className="text-sm text-emerald-300 font-semibold">
              {hasSpark ? `${(((sparkData.at(-1) ?? 0) / Math.max(...sparkData, 1)) * 100).toFixed(1)}%` : '+0%'}
            </span>
          </div>
          <svg viewBox="0 0 320 140" className="w-full">
            <defs>
              <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.4)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0)" />
              </linearGradient>
            </defs>
            <polyline
              fill="url(#sparkFill)"
              stroke="none"
              points={
                hasSpark
                  ? sparkData
                      .map((v, i) => {
                        const x = (i / Math.max(sparkData.length - 1, 1)) * 320
                        const y = 140 - (v / maxValue) * 120
                        return `${x.toFixed(1)},${y.toFixed(1)}`
                      })
                      .join(' ')
                  : '0,140 320,140'
              }
            />
            <polyline
              fill="none"
              stroke="rgb(16,185,129)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={
                hasSpark
                  ? sparkData
                      .map((v, i) => {
                        const x = (i / Math.max(sparkData.length - 1, 1)) * 320
                        const y = 140 - (v / maxValue) * 120
                        return `${x.toFixed(1)},${y.toFixed(1)}`
                      })
                      .join(' ')
                  : '0,140 320,140'
              }
            />
          </svg>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>السبت</span>
            <span>الأحد</span>
            <span>الاثنين</span>
            <span>الثلاثاء</span>
            <span>الأربعاء</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl p-5 flex flex-col gap-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-white">إحصائيات الأداء</h3>
            <p className="text-xs text-slate-400">موجز سريع للصفقات</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r={donutRadius}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="20"
                  fill="none"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={donutRadius}
                  stroke="#22c55e"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={donutCirc}
                  strokeDashoffset={donutCirc * (1 - donutStats.win / donutTotal)}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{donutStats.win}/{donutTotal}</div>
                  <div className="text-xs text-slate-400 mt-1">صفقات رابحة / إجمالي</div>
                </div>
              </div>
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  صفقات رابحة
                </span>
                <span className="text-emerald-300 font-bold">{donutStats.win}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-2 text-red-400 font-semibold">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  صفقات خاسرة
                </span>
                <span className="text-red-300 font-bold">{donutStats.lose}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-2 text-blue-400 font-semibold">
                  <span className="h-3 w-3 rounded-full bg-blue-400" />
                  صفقات مفتوحة
                </span>
                <span className="text-blue-300 font-bold">{donutStats.open}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <TradesTable trades={openTrades} />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">آخر الصفقات</h3>
            <span className="text-xs text-slate-400">موجز سريع لآخر التحركات</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {openTrades.slice(0, 4).map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
