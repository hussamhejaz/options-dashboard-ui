import { useCallback, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import { apiClient } from '../lib/apiClient'
import type { Trade } from '../types/trade'
import { resolveTradeSuccess, toFiniteNumber } from '../lib/tradeSuccess'
import { deleteAdsByTradeRequest } from '../lib/adsDeletion'

type ActionStatus = 'idle' | 'success' | 'error'
const HIDDEN_TRADES_STORAGE_KEY = 'ads:hiddenTradeIds:v1'

type WinnerApi = {
  id?: string
  symbol?: string
  right?: 'call' | 'put'
  strike?: number | string
  expiration?: string
  entryPrice?: number | string | null
  closePrice?: number | string | null
  closePriceActual?: number | string | null
  pnl?: number | string | null
  pnlAmount?: number | string | null
  pnlAmountActual?: number | string | null
  pnlPercent?: number | string | null
  pnlPercentActual?: number | string | null
  contracts?: number | string | null
  isSuccessful?: boolean | null
  successRule?: string | null
  usedHighPriceForReport?: boolean | null
}

type CreateAdResponse = {
  id?: string
  _id?: string
  adId?: string
  docId?: string
  ad?: {
    id?: string
    _id?: string
    adId?: string
    docId?: string
  } | null
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
    closePriceActual: toFiniteNumber(item.closePriceActual),
    pnlAmount: item.pnlAmount !== undefined ? toNumber(item.pnlAmount, 0) : item.pnl !== undefined ? toNumber(item.pnl, 0) : undefined,
    pnlAmountActual: toFiniteNumber(item.pnlAmountActual),
    pnlPercentActual: toFiniteNumber(item.pnlPercentActual),
    isSuccessful: typeof item.isSuccessful === 'boolean' ? item.isSuccessful : undefined,
    successRule: item.successRule ?? undefined,
    usedHighPriceForReport: typeof item.usedHighPriceForReport === 'boolean' ? item.usedHighPriceForReport : undefined,
    pl,
    status: 'closed',
    contracts: Math.max(1, Math.trunc(toNumber(item.contracts, 1)))
  }
}

const loadHiddenTradeIds = (): Record<string, true> => {
  try {
    const raw = window.localStorage.getItem(HIDDEN_TRADES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, true>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const saveHiddenTradeIds = (value: Record<string, true>) => {
  try {
    window.localStorage.setItem(HIDDEN_TRADES_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // no-op
  }
}

const Ads = () => {
  const [winningTrades, setWinningTrades] = useState<Trade[]>([])
  const deletedTradeIdsRef = useRef<Record<string, true>>(loadHiddenTradeIds())
  const [loading, setLoading] = useState(false)
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadWinningTrades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await apiClient.get<WinnerApi[]>('/trades/winners', { timeoutMs: 12000 })
      const winners = Array.isArray(payload) ? payload.map((item, index) => normalizeWinner(item, index)) : []
      setWinningTrades(
        winners
          .filter((trade) =>
            resolveTradeSuccess({ isSuccessful: trade.isSuccessful, pnlAmount: trade.pnlAmount }).isSuccessful
          )
          .filter((trade) => !deletedTradeIdsRef.current[trade.id])
      )
    } catch (err) {
      console.error(err)
      setWinningTrades([])
      setError('تعذر تحميل الصفقات الناجحة')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreateFromTrade = async (trade: Trade) => {
    if (!isValidTicker(String(trade.symbol ?? ''))) {
      setStatus('error')
      setError('اكتب رمز سهم صالح (مثال: AAPL، TSLA، BRK.B)')
      return
    }

    setCreatingId(trade.id)
    setStatus('idle')
    setNotice(null)
    setError(null)
    try {
      const createRes = await apiClient.post<CreateAdResponse>(
        '/ads/send-from-trade',
        {
          tradeId: trade.id,
          title: `${trade.symbol} ${trade.type} | ${trade.expiry}`
        },
        { timeoutMs: 120000 }
      )
      setStatus('success')
      const createdAdId = String(
        createRes?.id ??
          createRes?._id ??
          createRes?.adId ??
          createRes?.docId ??
          createRes?.ad?.id ??
          createRes?.ad?._id ??
          createRes?.ad?.adId ??
          createRes?.ad?.docId ??
          ''
      ).trim()
      if (!createdAdId) {
        setNotice('تم الإرسال ولكن لم يتم استلام adId من الخادم.')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'تعذر إنشاء الإعلان من الصفقة')
    } finally {
      setCreatingId(null)
    }
  }

  const handleDeleteAd = async (tradeId: string) => {
    if (deletingId === tradeId) return
    const confirmed = window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')
    if (!confirmed) return

    setDeletingId(tradeId)
    setStatus('idle')
    setNotice(null)
    setError(null)

    const outcome = await deleteAdsByTradeRequest(tradeId)
    if (outcome.kind === 'success' || outcome.kind === 'not_found') {
      setWinningTrades((prev) => prev.filter((trade) => trade.id !== tradeId))
      deletedTradeIdsRef.current = { ...deletedTradeIdsRef.current, [tradeId]: true }
      saveHiddenTradeIds(deletedTradeIdsRef.current)
      setNotice(
        outcome.kind === 'success'
          ? outcome.message
          : 'الإعلان غير موجود (قد يكون تم حذفه مسبقًا). جاري تحديث القائمة...'
      )
    } else {
      setStatus('error')
      setError(outcome.message ?? 'تعذر حذف الإعلان')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">إعلانات تيليجرام</h2>
          <p className="text-slate-400 text-sm mt-1">
            هنا يتم عرض الصفقات الناجحة فقط. اختر أي صفقة لإنشاء إعلان مباشر من الباك-إند.
          </p>
        </div>
        <Button variant="secondary" onClick={loadWinningTrades} disabled={loading}>
          {loading ? '...جاري التحديث' : 'تحديث الصفقات الناجحة'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {status === 'success' && <span className="text-emerald-300">تم إنشاء الإعلان وإرساله إلى تيليجرام</span>}
        {notice && <span className="text-emerald-300">{notice}</span>}
        {error && <span className="text-red-400">خطأ: {error}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full text-sm text-slate-300 border border-slate-700 rounded-xl p-4 text-center">
            جاري تحميل الصفقات الناجحة...
          </div>
        )}

        {winningTrades.map((trade) => {
          const tickerIsValid = isValidTicker(String(trade.symbol ?? ''))
          const successState = resolveTradeSuccess({ isSuccessful: trade.isSuccessful, pnlAmount: trade.pnlAmount })
          const isSuccessful = successState.isSuccessful
          const pnlPercent = Number(trade.pl ?? 0)
          const currentPrice = Number.isFinite(trade.currentPrice) ? trade.currentPrice : trade.entryPrice
          const closePrice = Number.isFinite(trade.closePrice ?? Number.NaN) ? Number(trade.closePrice) : currentPrice
          const pnlAmount = toFiniteNumber(trade.pnlAmount) ?? 0
          const actualPnlAmount = toFiniteNumber(trade.pnlAmountActual)
          const isActuallyProfitable = (actualPnlAmount ?? pnlAmount) > 0
          const statusLabel = trade.isSuccessful === true ? 'صفقة ناجحة' : isActuallyProfitable ? 'صفقة رابحة' : 'صفقة ناجحة'

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
                <div
                  className={`rounded-full px-3 py-1 text-xs border ${
                    isSuccessful
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/40 text-red-300'
                  }`}
                >
                  {statusLabel}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {trade.successRule === 'PROFIT_TARGET_50_REACHED' && (
                  <span className="rounded-full border border-amber-400/50 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300">
                    نجاح بتحقيق هدف 50$
                  </span>
                )}
                {trade.usedHighPriceForReport && (
                  <span className="rounded-full border border-sky-400/50 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-300">
                    تم اعتماد أعلى سعر في التقرير
                  </span>
                )}
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
                <div className={`text-lg font-bold ${pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnlPercent >= 0 ? '+' : ''}
                  {pnlPercent.toFixed(2)}%
                </div>
                <div className="text-sm text-slate-300">
                  {pnlAmount >= 0 ? '+' : ''}
                  ${Number(pnlAmount ?? 0).toFixed(2)}
                </div>
                {toFiniteNumber(trade.pnlAmountActual) !== undefined && (
                  <div className="text-xs text-slate-400">
                    الربح الفعلي: {actualPnlAmount! >= 0 ? '+' : ''}${actualPnlAmount!.toFixed(2)}
                  </div>
                )}
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
                  disabled={creatingId === trade.id || deletingId === trade.id || !tickerIsValid}
                >
                  {creatingId === trade.id ? '...جاري الإرسال' : 'إنشاء + إرسال إلى تيليجرام'}
                </Button>
                <Button
                  variant="ghost"
                  className="border border-red-500/50 text-red-300 hover:text-white hover:border-red-400"
                  onClick={() => handleDeleteAd(trade.id)}
                  disabled={deletingId === trade.id || creatingId === trade.id}
                  title="حذف الإعلان"
                >
                  {deletingId === trade.id ? '...جارٍ الحذف' : 'حذف الإعلان'}
                </Button>
              </div>
            </article>
          )
        })}

        {winningTrades.length === 0 && !loading && (
          <div className="col-span-full text-sm text-slate-400 border border-dashed border-slate-700 rounded-xl p-4 text-center">
            لا توجد صفقات ناجحة حالياً. تأكد أن هناك صفقات مغلقة بحقل isSuccessful=true أو pnl أكبر من 0.
          </div>
        )}
      </div>
    </div>
  )
}


export default Ads
