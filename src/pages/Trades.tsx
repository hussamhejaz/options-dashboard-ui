import { useMemo, useState } from 'react'
import TradesTable from '../components/tables/TradesTable'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { mockTrades } from '../data/mockTrades'
import type { Trade, TradeStatus, TradeType } from '../types/trade'

const Trades = () => {
  const [trades, setTrades] = useState<Trade[]>(mockTrades)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | TradeType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | TradeStatus>('all')
  const [openModal, setOpenModal] = useState(false)

  const deleteTrades = (scope: 'all' | 'win' | 'loss') => {
    setTrades((prev) => {
      if (scope === 'all') return []
      return prev.filter((t) => {
        const isWin = t.pl >= 0
        return scope === 'win' ? !isWin : isWin
      })
    })
  }

  const deleteTradeById = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }

  const filtered = useMemo(() => {
    return trades.filter((trade) => {
      const bySearch = trade.symbol.toLowerCase().includes(search.toLowerCase())
      const byType = typeFilter === 'all' ? true : trade.type === typeFilter
      const byStatus = statusFilter === 'all' ? true : trade.status === statusFilter
      return bySearch && byType && byStatus
    })
  }, [trades, search, typeFilter, statusFilter])

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const symbol = (data.get('symbol') as string).trim().toUpperCase()
    const type = data.get('type') as TradeType
    const strike = Number(data.get('strike'))
    const expiry = data.get('expiry') as string
    const entryPrice = Number(data.get('entryPrice'))
    const contracts = Number(data.get('contracts'))
    if (!symbol || !expiry || Number.isNaN(strike) || Number.isNaN(entryPrice)) return
    const newTrade: Trade = {
      id: crypto.randomUUID(),
      symbol,
      type,
      strike,
      expiry,
      entryPrice,
      currentPrice: entryPrice,
      pl: 0,
      status: 'open',
      contracts
    }
    setTrades((prev) => [newTrade, ...prev])
    setOpenModal(false)
    e.currentTarget.reset()
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">الصفقات</h2>
          <p className="text-slate-400 text-sm mt-1">إدارة الصفقات الحالية والمغلقة مع تصفية سريعة.</p>
        </div>
        <Button onClick={() => setOpenModal(true)}>إضافة صفقة</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <Input
          placeholder="ابحث بالرمز مثل TSLA..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | TradeType)}>
          <option value="all">النوع (الكل)</option>
          <option value="CALL">CALL</option>
          <option value="PUT">PUT</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | TradeStatus)}>
          <option value="all">الحالة (الكل)</option>
          <option value="open">مفتوحة</option>
          <option value="closed">مغلقة</option>
        </Select>
        <Button variant="secondary" onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all') }}>إعادة تعيين</Button>
      </div>

      {trades.length > 0 && (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">إدارة سريعة</h3>
            <span className="text-xs text-slate-400">حذف حسب الربحية</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => deleteTrades('win')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-3 text-emerald-200 font-semibold hover:border-emerald-400 hover:bg-emerald-500/15 transition"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              حذف الصفقات الرابحة
            </button>
            <button
              type="button"
              onClick={() => deleteTrades('loss')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/60 bg-red-500/10 px-3 py-3 text-red-200 font-semibold hover:border-red-400 hover:bg-red-500/15 transition"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              حذف الصفقات الخاسرة
            </button>
            <button
              type="button"
              onClick={() => deleteTrades('all')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-slate-200 font-semibold hover:border-slate-500 hover:bg-slate-800 transition"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              حذف كل الصفقات
            </button>
          </div>
        </div>
      )}

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
              const isProfit = trade.pl >= 0
              return (
                <div
                  key={trade.id}
                  className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950/90 via-slate-950 to-slate-900/90 shadow-xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-lg font-semibold text-white">{trade.symbol} ({trade.type})</div>
                    <span className="text-xs text-slate-400">{trade.expiry}</span>
                  </div>

                  <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-2">
                    <div className="grid grid-cols-5 text-xs text-slate-400 font-semibold mb-2">
                      <span className="text-right">دخول</span>
                      <span className="text-right">حالي</span>
                      <span className="text-right">النسبة</span>
                      <span className="text-right">المبلغ</span>
                      <span className="text-right">أعلى</span>
                    </div>
                    <div className="grid grid-cols-5 text-sm font-semibold">
                      <span className="text-slate-200 text-right">{trade.entryPrice.toFixed(2)}</span>
                      <span className="text-emerald-400 text-right">{trade.currentPrice.toFixed(2)}</span>
                      <span className={`${isProfit ? 'text-emerald-400' : 'text-red-400'} text-right`}>
                        {isProfit ? '+' : ''}
                        {trade.pl.toFixed(2)}%
                      </span>
                      <span className="text-emerald-400 text-right">$0.00</span>
                      <span className="text-slate-200 text-right">{trade.strike.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>عقود: {trade.contracts}</span>
                    <span>الحالة: {trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-200 font-semibold hover:border-red-400 hover:bg-red-500/15 transition"
                      type="button"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.2)]" />
                      وقف خسارة
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-emerald-200 font-semibold hover:border-emerald-400 hover:bg-emerald-500/15 transition"
                      type="button"
                    >
                      <span className="h-2.5 w-2.5 rounded-sm border-2 border-emerald-300 bg-emerald-500/40" />
                      إغلاق الصفقة
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-200 font-semibold hover:border-slate-500 hover:bg-slate-800 transition"
                      type="button"
                      onClick={() => deleteTradeById(trade.id)}
                    >
                      🗑 حذف الصفقة
                    </button>
                  </div>
                </div>
              )
            })}
          </section>

          <TradesTable trades={filtered} />
        </>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="إضافة صفقة جديدة">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAdd}>
          <Input name="symbol" label="الرمز" placeholder="TSLA" required />
          <Select name="type" label="النوع">
            <option value="CALL">CALL</option>
            <option value="PUT">PUT</option>
          </Select>
          <Input name="strike" label="سترايك" type="number" step="0.1" required />
          <Input name="expiry" label="تاريخ الانتهاء" type="date" required />
          <Input name="entryPrice" label="سعر الدخول" type="number" step="0.01" required />
          <Input name="contracts" label="عدد العقود" type="number" min="1" defaultValue={1} required />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>إلغاء</Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Trades
