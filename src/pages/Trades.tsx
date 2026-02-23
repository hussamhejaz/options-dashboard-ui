import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import type { Trade, TradeStatus, TradeType } from '../types/trade'
import { useCreateTrade, type NewTradePayload, type CreateTradeInput } from '../hooks/useCreateTrade'
import { apiClient } from '../lib/apiClient'

const normalizeExpiration = (inputDate: string): string => {
  if (!inputDate) return ''
  // YYYY-MM-DD -> YYYYMMDD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inputDate)
  if (isoMatch) return `${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}`

  // DD/MM/YYYY -> YYYYMMDD
  const slashMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(inputDate)
  if (slashMatch) return `${slashMatch[3]}${slashMatch[2]}${slashMatch[1]}`

  return ''
}


const mapTradeFormToApi = (payload: NewTradePayload): CreateTradeInput => ({
  symbol: payload.symbol.trim().toUpperCase(),
  right: payload.type.toLowerCase() as 'call' | 'put',
  strike: payload.strike,
  expiration: normalizeExpiration(payload.expiry),
  contracts: payload.contracts || 1,
  stopLoss: payload.stopLoss
})

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
  lastQuoteAt?: string
  updatedAt?: string
  contracts?: number
  pnlAmount?: number
  pnl?: number
  pnlPercent?: number
  pnlActual?: number | null
  pnlPercentActual?: number | null
  stopLoss?: number | null
  closePrice?: number
  closePriceActual?: number | null
  peakPriceReached?: number | null
  peakRisePrice?: number | null
  peakRisePercent?: number | null
  peakPnlAmount?: number | null
}

type UiTrade = Trade & {
  highPrice?: number | null
  lastMidPrice?: number
  lastNotifiedPrice?: number
  pnlAmount?: number
  stopLoss?: number | null
  closePrice?: number
}

const mapDashboardToTrade = (t: DashboardTrade): UiTrade => {
  const expiryRaw = t.expiration
  const expiryFormatted =
    /^[0-9]{8}$/.test(expiryRaw ?? '')
      ? `${expiryRaw.slice(0, 4)}-${expiryRaw.slice(4, 6)}-${expiryRaw.slice(6, 8)}`
      : expiryRaw ?? ''

  return {
    id: t.id,
    symbol: t.symbol,
    type: (t.right ?? 'call').toUpperCase() as TradeType,
    strike: Number(t.strike ?? 0),
    expiry: expiryFormatted,
    entryPrice: Number(t.entryPrice ?? 0),
    currentPrice: Number(t.currentPrice ?? t.entryPrice ?? 0),
    closePrice: Number.isFinite(t.closePrice ?? NaN) ? Number(t.closePrice) : undefined,
    closePriceActual: Number.isFinite(t.closePriceActual ?? NaN) ? Number(t.closePriceActual) : null,
    highPrice: Number.isFinite(t.highPrice ?? NaN) ? Number(t.highPrice) : null,
    peakPriceReached: Number.isFinite(t.peakPriceReached ?? NaN) ? Number(t.peakPriceReached) : null,
    peakRisePrice: Number.isFinite(t.peakRisePrice ?? NaN) ? Number(t.peakRisePrice) : null,
    peakRisePercent: Number.isFinite(t.peakRisePercent ?? NaN) ? Number(t.peakRisePercent) : null,
    peakPnlAmount: Number.isFinite(t.peakPnlAmount ?? NaN) ? Number(t.peakPnlAmount) : null,
    pnl: Number.isFinite(t.pnl ?? NaN) ? Number(t.pnl) : Number.isFinite(t.pnlAmount ?? NaN) ? Number(t.pnlAmount) : undefined,
    lastMidPrice: Number(t.lastMidPrice ?? 0),
    pnlAmount: Number.isFinite(t.pnlAmount ?? NaN) ? Number(t.pnlAmount) : undefined,
    pnlActual: Number.isFinite(t.pnlActual ?? NaN) ? Number(t.pnlActual) : null,
    pnlPercentActual: Number.isFinite(t.pnlPercentActual ?? NaN) ? Number(t.pnlPercentActual) : null,
    pl: Number(t.pnlPercent ?? 0),
    status: t.status === 'CLOSED'
      ? 'closed'
      : t.status === 'INVALID'
        ? 'invalid'
        : 'open',
    contracts: Number(t.contracts ?? 1),
    stopLoss: Number.isFinite(t.stopLoss ?? NaN) ? Number(t.stopLoss) : null
  }
}

const Trades = () => {
  const [trades, setTrades] = useState<UiTrade[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter] = useState<'all' | TradeType>('all')
  const [statusFilter] = useState<'all' | TradeStatus>('all')
  const [openModal, setOpenModal] = useState(false)
  const [quickSymbol, setQuickSymbol] = useState('')
  const [quickType, setQuickType] = useState<TradeType>('CALL')
  const [quickStrike, setQuickStrike] = useState('')
  const [quickExpiry, setQuickExpiry] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [stopLossUpdating, setStopLossUpdating] = useState<string | null>(null)
  const [closeUpdating, setCloseUpdating] = useState<string | null>(null)
  const { createTrade, loading, error } = useCreateTrade()

  const buildLocalTrade = (payload: NewTradePayload): Trade => ({
    id: crypto.randomUUID(),
    currentPrice: payload.entryPrice,
    pl: 0,
    status: 'open',
    ...payload
  })

  useEffect(() => {
    let cancelled = false
    let inFlight = false

    const loadTrades = async (showSpinner = false) => {
      if (inFlight) return
      inFlight = true
      const controller = new AbortController()
      if (showSpinner) setListLoading(true)
      try {
        const openTrades = await apiClient.get<DashboardTrade[]>('/trades/dashboard?status=OPEN', {
          signal: controller.signal,
          timeoutMs: 7000
        })
        if (cancelled) return
        const mapped = [...openTrades].map(mapDashboardToTrade)
        const uniqueMapped = Array.from(new Map(mapped.map((t) => [t.id, t])).values())
        setTrades((prev) => {
          if (prev.length === 0) return uniqueMapped

          const prevById = new Map(prev.map((t) => [t.id, t]))
          const incomingById = new Map(uniqueMapped.map((t) => [t.id, t]))
          const updatedExisting: UiTrade[] = []

          prev.forEach((oldTrade) => {
            const incoming = incomingById.get(oldTrade.id)
            if (incoming) {
              // use incoming data with local fields preserved
              updatedExisting.push(incoming)
              incomingById.delete(oldTrade.id)
            }
          })

          const newOpen = uniqueMapped.filter((t) => !prevById.has(t.id))
          return [...updatedExisting, ...newOpen]
        })

      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === 'AbortError')) {
          console.error('Failed to load trades', err)
        }
      } finally {
        inFlight = false
        if (showSpinner && !cancelled) setListLoading(false)
      }
    }

    loadTrades(true)
    const intervalMs = 2000
    const intervalId = window.setInterval(() => loadTrades(false), intervalMs)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  const filtered = useMemo(() => {
    return trades.filter((trade) => {
      const bySearch = trade.symbol.toLowerCase().includes(search.toLowerCase())
      const byType = typeFilter === 'all' ? true : trade.type === typeFilter
      const byStatus = statusFilter === 'all' ? true : trade.status === statusFilter
      return bySearch && byType && byStatus
    })
  }, [trades, search, typeFilter, statusFilter])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const symbol = (data.get('symbol') as string).trim().toUpperCase()
    const type = data.get('type') as TradeType
    const strike = Number(data.get('strike'))
    const expiry = data.get('expiry') as string
    const entryPrice = Number(data.get('entryPrice'))
    const contracts = Number(data.get('contracts'))
    if (!symbol || !expiry || Number.isNaN(strike)) return
    const payload: NewTradePayload = {
      symbol,
      type,
      strike,
      expiry,
      entryPrice: Number.isFinite(entryPrice) ? entryPrice : strike,
      contracts: Number.isFinite(contracts) ? contracts : 1
    }
    const apiPayload = mapTradeFormToApi(payload)
    if (!apiPayload.expiration) {
      setFormError('صيغة تاريخ الانتهاء غير صحيحة (استخدم YYYY-MM-DD أو DD/MM/YYYY)')
      return
    }
    setFormError(null)
    const optimisticTrade = buildLocalTrade(payload)
    try {
      const saved = await createTrade(apiPayload)
      const merged = { ...optimisticTrade, ...saved, id: saved.id ?? optimisticTrade.id }
      setTrades((prev) => {
        const ids = new Set(prev.map((t) => t.id))
        if (ids.has(merged.id)) return prev.map((t) => (t.id === merged.id ? merged : t))
        return [merged, ...prev]
      })
      setOpenModal(false)
      e.currentTarget.reset()
    } catch {
      setTrades((prev) => {
        const ids = new Set(prev.map((t) => t.id))
        if (ids.has(optimisticTrade.id)) return prev
        return [optimisticTrade, ...prev]
      })
    }
  }

  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const symbol = quickSymbol.trim().toUpperCase()
    const strikeNum = Number(quickStrike)
    if (!symbol || !quickExpiry || Number.isNaN(strikeNum)) return
    const payload: NewTradePayload = {
      symbol,
      type: quickType,
      strike: strikeNum,
      expiry: quickExpiry,
      entryPrice: strikeNum,
      contracts: 1
    }
    const apiPayload = mapTradeFormToApi(payload)
    if (!apiPayload.expiration) {
      setFormError('صيغة تاريخ الانتهاء غير صحيحة (استخدم YYYY-MM-DD أو DD/MM/YYYY)')
      return
    }
    setFormError(null)
    const optimisticTrade = buildLocalTrade(payload)
    try {
      const saved = await createTrade(apiPayload)
      const merged = { ...optimisticTrade, ...saved, id: saved.id ?? optimisticTrade.id }
      setTrades((prev) => {
        const ids = new Set(prev.map((t) => t.id))
        if (ids.has(merged.id)) return prev.map((t) => (t.id === merged.id ? merged : t))
        return [merged, ...prev]
      })
      setQuickSymbol('')
      setQuickStrike('')
      setQuickExpiry('')
      setQuickType('CALL')
    } catch {
      setTrades((prev) => {
        const ids = new Set(prev.map((t) => t.id))
        if (ids.has(optimisticTrade.id)) return prev
        return [optimisticTrade, ...prev]
      })
    }
  }

  const handleStopLoss = async (trade: UiTrade) => {
    // بدون تأكيد: نستخدم السعر الحالي كقيمة وقف الخسارة، وإلا سعر الدخول
    const stopLossCandidate = Number.isFinite(trade.currentPrice)
      ? trade.currentPrice
      : Number.isFinite(trade.entryPrice)
        ? trade.entryPrice
        : null
    if (stopLossCandidate === null || !Number.isFinite(stopLossCandidate)) {
      setFormError('لا يمكن تحديد وقف الخسارة لعدم توفر سعر حالي أو سعر دخول صالح')
      return
    }
    const stopLoss = Number(stopLossCandidate.toFixed(4))
    setFormError(null)
    setStopLossUpdating(trade.id)
    try {
      await apiClient.patch<UiTrade>(`/trades/${trade.id}/stoploss`, { stopLoss }, { timeoutMs: 45000 })
      setTrades((prev) => prev.filter((t) => t.id !== trade.id))
    } catch (err) {
      console.error('Failed to update stop loss', err)
      setFormError('تعذّر تحديث وقف الخسارة')
    } finally {
      setStopLossUpdating(null)
    }
  }

  const handleCloseTrade = async (trade: UiTrade) => {
    setFormError(null)
    setCloseUpdating(trade.id)
    try {
      await apiClient.patch<UiTrade>(`/trades/${trade.id}/close`, {}, { timeoutMs: 45000 })
      setTrades((prev) => prev.filter((t) => t.id !== trade.id))
    } catch (err) {
      console.error('Failed to close trade', err)
      setFormError('تعذّر إغلاق الصفقة')
    } finally {
      setCloseUpdating(null)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">الصفقات</h2>
          <p className="text-slate-400 text-sm mt-1">إدارة الصفقات الحالية والمغلقة مع تصفية سريعة.</p>
        </div>
        <div className="w-full md:w-80">
          <Input
            placeholder="ابحث عن الصفقات (مثلاً TSLA أو CALL)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {listLoading && <p className="text-sm text-slate-400">جاري تحميل الصفقات...</p>}
      {!listLoading && (
        <div className="text-xs text-slate-500 flex flex-col gap-1">
          <span>يتم التحديث بالزمن شبه الحقيقي (كل ثانية)</span>
        </div>
      )}

      <form
        className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4"
        onSubmit={handleQuickAdd}
      >
        <Input
          placeholder="ادخل الرمز مثل TSLA"
          value={quickSymbol}
          onChange={(e) => setQuickSymbol(e.target.value)}
          required
        />
        <Select value={quickType} onChange={(e) => setQuickType(e.target.value as TradeType)}>
          <option value="CALL">شراء (CALL)</option>
          <option value="PUT">بيع (PUT)</option>
        </Select>
        <Input
          type="number"
          step="0.1"
          placeholder="السترايك"
          value={quickStrike}
          onChange={(e) => setQuickStrike(e.target.value)}
          required
        />
        <Input
          type="date"
          placeholder="تاريخ الانتهاء"
          value={quickExpiry}
          onChange={(e) => setQuickExpiry(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الإرسال...' : 'إرسال'}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400">فشل الإرسال: {error}</p>}
      {formError && <p className="text-sm text-red-400">{formError}</p>}

      {filtered.length === 0 ? (
        <EmptyState
          title="لا توجد صفقات مطابقة"
          description="جرّب تغيير خيارات البحث أو إضافة صفقة جديدة."
          actionLabel="إضافة صفقة"
          onAction={() => setOpenModal(true)}
        />
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((trade) => {
              const entryPrice = Number.isFinite(trade.entryPrice) ? trade.entryPrice : 0
              const effectivePrice =
                trade.status === 'closed' && Number.isFinite(trade.closePrice)
                  ? (trade.closePrice as number)
                  : Number.isFinite(trade.currentPrice)
                    ? trade.currentPrice
                    : entryPrice
              const currentPrice = effectivePrice
              const rawHigh = trade.highPrice ?? Number.NaN
              const highPrice = Number.isFinite(rawHigh) && rawHigh > 0 ? rawHigh : Math.max(currentPrice, entryPrice)
              const plValue = Number.isFinite(trade.pl) ? trade.pl : 0
              const isProfit = plValue >= 0
              const profitValue =
                Number.isFinite(trade.pnlAmount)
                  ? trade.pnlAmount!
                  : (currentPrice - entryPrice) * trade.contracts * 100
              const isProfitValue = profitValue >= 0
              return (
                <div
                  key={trade.id}
                  className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950/90 via-slate-950 to-slate-900/90 shadow-xl p-4 space-y-4 min-h-[260px]"
                >
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-xs text-slate-400 text-left">{trade.expiry}</span>
                    <span className="text-sm font-semibold text-slate-200 text-center">{trade.strike}</span>
                    <div className="text-lg font-semibold text-white text-right">
                      {trade.symbol} ({trade.type})
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-6 py-4">
                    <div className="grid grid-cols-5 gap-6 md:gap-10 text-xs text-slate-400 font-semibold mb-3">
                      <span className="text-right">دخول</span>
                      <span className="text-right">{trade.status === 'closed' ? 'سعر الإغلاق' : 'حالي'}</span>
                      <span className="text-right">النسبة</span>
                      <span className="text-right">المبلغ</span>
                      <span className="text-right">أعلى</span>
                    </div>
              <div className="grid grid-cols-5 gap-6 md:gap-10 text-sm font-semibold">
                <span className="text-slate-200 text-right font-mono tabular-nums">{entryPrice.toFixed(2)}</span>
                <span className="text-emerald-400 text-right font-mono tabular-nums">{currentPrice.toFixed(2)}</span>
                <span className={`${isProfit ? 'text-emerald-400' : 'text-red-400'} text-right font-mono tabular-nums`}>
                  {isProfit ? '+' : ''}
                  {plValue.toFixed(2)}%
                </span>
                <span className={`${isProfitValue ? 'text-emerald-400' : 'text-red-400'} text-right font-mono tabular-nums`}>
                  {isProfitValue ? '+' : '-'}${Math.abs(profitValue).toFixed(1)}
                </span>
                <span className="text-slate-200 text-right font-mono tabular-nums">
                  {Number.isFinite(highPrice) ? highPrice.toFixed(2) : '--'}
                </span>
                    </div>
                  </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>عقود: {trade.contracts}</span>
            <span>
              الحالة:{' '}
              {trade.status === 'open'
                ? 'مفتوحة'
                : trade.status === 'closed'
                  ? 'مغلقة'
                  : 'غير صالحة'}
            </span>
          </div>

                  <div className="flex w-full items-center text-sm gap-4">
                    <button
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-200 font-semibold hover:border-red-400 hover:bg-red-500/15 transition disabled:opacity-60"
                      type="button"
                      onClick={() => handleStopLoss(trade)}
                      disabled={stopLossUpdating === trade.id}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.2)]" />
                      {stopLossUpdating === trade.id ? '...جار التحديث' : 'وقف خسارة'}
                    </button>
                    <button
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-emerald-200 font-semibold hover:border-emerald-400 hover:bg-emerald-500/15 transition"
                      type="button"
                      onClick={() => handleCloseTrade(trade)}
                      disabled={closeUpdating === trade.id}
                    >
                      <span className="h-2.5 w-2.5 rounded-sm border-2 border-emerald-300 bg-emerald-500/40" />
                      {closeUpdating === trade.id ? '...جار الإغلاق' : 'إغلاق الصفقة'}
                    </button>
                    {/* زر حذف الصفقة تمت إزالته بناءً على طلب المستخدم */}
                  </div>
                </div>
              )
            })}
          </section>

        </>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="إضافة صفقة جديدة">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAdd}>
          <Input name="symbol" label="الرمز" placeholder="TSLA" required />
          <Select name="type" label="النوع" defaultValue="CALL">
            <option value="CALL">CALL</option>
            <option value="PUT">PUT</option>
          </Select>
          <Input
            name="strike"
            label="سترايك"
            type="number"
            step="0.1"
            required
          />
          <Input
            name="expiry"
            label="تاريخ الانتهاء"
            type="date"
            required
          />
          <Input
            name="entryPrice"
            label="سعر الدخول"
            type="number"
            step="0.01"
            required
          />
          <Input
            name="contracts"
            label="عدد العقود"
            type="number"
            min="1"
            required
          />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>إلغاء</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Trades
