import { useCallback, useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import { apiClient } from '../lib/apiClient'
import type { Trade } from '../types/trade'

type ActionStatus = 'idle' | 'success' | 'error'

type WinnerApi = {
  id?: string
  symbol?: string
  right?: 'call' | 'put'
  strike?: number | string
  expiration?: string
  entryPrice?: number | string | null
  closePrice?: number | string | null
  pnl?: number | string | null
  pnlPercent?: number | string | null
  contracts?: number | string | null
}

const toNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const isValidTicker = (symbol: string): boolean => /^[A-Z0-9]{1,10}(?:[.-][A-Z0-9]{1,4})?$/.test(symbol.trim().toUpperCase())

const normalizeWinner = (item: WinnerApi, index: number): Trade => {
  const typeRaw = String(item.right ?? 'call').toUpperCase()
  const type = typeRaw === 'PUT' ? 'PUT' : 'CALL'
  const entryPrice = toNumber(item.entryPrice, 0)
  const currentPrice = toNumber(item.closePrice, entryPrice)
  const closePrice = item.closePrice !== undefined ? toNumber(item.closePrice, currentPrice) : undefined
  const pl = toNumber(item.pnlPercent, 0)

  return {
    id: String(item.id ?? `${item.symbol ?? 'winner'}-${index + 1}`),
    symbol: String(item.symbol ?? '--'),
    type,
    strike: toNumber(item.strike, 0),
    expiry: String(item.expiration ?? '--'),
    entryPrice,
    currentPrice,
    closePrice,
    pnlAmount: item.pnl !== undefined ? toNumber(item.pnl, 0) : undefined,
    pl,
    status: 'closed',
    contracts: Math.max(1, Math.trunc(toNumber(item.contracts, 1)))
  }
}

const Ads = () => {
  const [winningTrades, setWinningTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(false)
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const loadWinningTrades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await apiClient.get<WinnerApi[]>('/trades/winners', { timeoutMs: 12000 })
      const winners = Array.isArray(payload) ? payload.map((item, index) => normalizeWinner(item, index)) : []
      setWinningTrades(winners)
    } catch (err) {
      console.error(err)
      setWinningTrades([])
      setError('تعذر تحميل الصفقات الرابحة')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWinningTrades()
    const intervalId = window.setInterval(() => {
      loadWinningTrades()
    }, 5000)
    return () => window.clearInterval(intervalId)
  }, [loadWinningTrades])

  const handleCreateFromTrade = async (trade: Trade) => {
    if (!isValidTicker(String(trade.symbol ?? ''))) {
      setStatus('error')
      setError('اكتب رمز سهم صالح (مثال: AAPL، TSLA، BRK.B)')
      return
    }

    setCreatingId(trade.id)
    setStatus('idle')
    setError(null)
    try {
      await apiClient.post(
        '/ads/send-from-trade',
        {
          tradeId: trade.id,
          title: `${trade.symbol} ${trade.type} | ${trade.expiry}`
        },
        { timeoutMs: 120000 }
      )
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'تعذر إنشاء الإعلان من الصفقة')
    } finally {
      setCreatingId(null)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">إعلانات تيليجرام</h2>
          <p className="text-slate-400 text-sm mt-1">
            هنا يتم عرض الصفقات الرابحة فقط. اختر أي صفقة لإنشاء إعلان مباشر من الباك-إند.
          </p>
        </div>
        <Button variant="secondary" onClick={loadWinningTrades} disabled={loading}>
          {loading ? '...جاري التحديث' : 'تحديث الصفقات الرابحة'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {status === 'success' && <span className="text-emerald-300">تم إنشاء الإعلان وإرساله إلى تيليجرام</span>}
        {status === 'error' && <span className="text-red-300">فشل إنشاء/إرسال الإعلان</span>}
        {error && <span className="text-red-400">{error}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full text-sm text-slate-300 border border-slate-700 rounded-xl p-4 text-center">
            جاري تحميل الصفقات الرابحة...
          </div>
        )}

        {winningTrades.map((trade) => {
          const tickerIsValid = isValidTicker(String(trade.symbol ?? ''))
          const isProfit = Number(trade.pl ?? 0) >= 0
          const currentPrice = Number.isFinite(trade.currentPrice) ? trade.currentPrice : trade.entryPrice
          const closePrice = Number.isFinite(trade.closePrice ?? Number.NaN) ? Number(trade.closePrice) : currentPrice
          const pnlAmount =
            Number.isFinite(trade.pnlAmount)
              ? Number(trade.pnlAmount)
              : (closePrice - trade.entryPrice) * (trade.contracts ?? 1) * 100

          return (
            <article
              key={trade.id}
              
              className="rounded-2xl border border-slate-800 bg-[#0f1421] p-5 space-y-4 shadow-[0_15px_40px_-25px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {trade.symbol} ({trade.type})
                  </div>
                  <div className="text-sm text-slate-300">{trade.expiry}</div>
                </div>
                <div className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300">
                  رابحة
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                <div className="text-right space-y-1">
                  <div className="text-xs text-slate-400">سعر الدخول</div>
                  <div className="font-semibold">${Number(trade.entryPrice ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-slate-400 pt-1">سعر الإغلاق</div>
                  <div className="font-semibold">${Number(closePrice ?? 0).toFixed(2)}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-slate-400">سترايك</div>
                  <div className="font-semibold">{trade.strike}</div>
                  <div className="text-xs text-slate-400 pt-1">عدد العقود</div>
                  <div className="font-semibold">{trade.contracts}</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className={`text-lg font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isProfit ? '+' : ''}
                  {Number(trade.pl ?? 0).toFixed(2)}%
                </div>
                <div className="text-sm text-slate-300">
                  {pnlAmount >= 0 ? '+' : ''}
                  ${Number(pnlAmount ?? 0).toFixed(2)}
                </div>
                {!tickerIsValid && (
                  <div className="text-xs text-amber-300">
                    رمز السهم غير صالح للإرسال إلى تيليجرام.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-emerald-600/90 hover:bg-emerald-500 text-white"
                  onClick={() => handleCreateFromTrade(trade)}
                  disabled={creatingId === trade.id || !tickerIsValid}
                >
                  {creatingId === trade.id ? '...جاري الإرسال' : 'إنشاء + إرسال إلى تيليجرام'}
                </Button>
              </div>
            </article>
          )
        })}

        {winningTrades.length === 0 && !loading && (
          <div className="col-span-full text-sm text-slate-400 border border-dashed border-slate-700 rounded-xl p-4 text-center">
            لا توجد صفقات رابحة حالياً. تأكد أن هناك صفقات بحالة CLOSED وقيمة pnl أكبر من 0.
          </div>
        )}
      </div>
    </div>
  )
}


export default Ads
