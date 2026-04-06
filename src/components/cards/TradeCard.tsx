import type { FC } from 'react'
import type { Trade } from '../../types/trade'
import Badge from '../ui/Badge'

const TradeCard: FC<{ trade: Trade }> = ({ trade }) => {
  const entryPrice = Number.isFinite(trade.entryPrice) ? trade.entryPrice : 0
  const effectivePrice =
    trade.status === 'closed' && Number.isFinite(trade.closePrice)
      ? (trade.closePrice as number)
      : Number.isFinite(trade.currentPrice)
        ? trade.currentPrice
        : entryPrice
  const currentPrice = effectivePrice
  const rawHigh = trade.highPrice ?? Number.NaN
  const high = Number.isFinite(rawHigh) && rawHigh > 0 ? rawHigh : null
  const plValue = Number.isFinite(trade.pl) ? trade.pl : 0
  const isProfit = plValue >= 0
  const profitValue =
    Number.isFinite(trade.pnlAmount)
      ? Number(trade.pnlAmount)
      : (currentPrice - entryPrice) * trade.contracts * 100
  const isProfitValue = profitValue >= 0
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 hover:border-emerald-500/40 transition shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">{trade.symbol}</div>
        <Badge variant={trade.type === 'CALL' ? 'blue' : 'purple'} className="whitespace-nowrap text-[11px] px-2.5 py-1">
          {trade.type === 'CALL' ? 'شراء (CALL)' : 'بيع (PUT)'}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>سترايك</span>
        <span className="text-white">${trade.strike.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>الانتهاء</span>
        <span className="text-white">{trade.expiry}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>سعر الدخول</span>
        <span className="text-white">${trade.entryPrice.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>أعلى</span>
        <span className="text-white">{high !== null ? `$${high.toFixed(2)}` : '--'}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">الربح / الخسارة</span>
        <div className="text-right leading-tight">
          <span className={`${isProfit ? 'text-emerald-400' : 'text-red-400'} font-semibold block`}>
            {isProfit ? '+' : ''}{plValue.toFixed(2)}%
          </span>
          <span className={`text-[11px] block ${isProfitValue ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfitValue ? '+' : ''}${Math.abs(profitValue).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        <Badge variant={trade.status === 'open' ? 'emerald' : trade.status === 'closed' ? 'gray' : 'purple'}>
          {trade.status === 'open' ? 'مفتوحة' : trade.status === 'closed' ? 'مغلقة' : 'غير صالحة'}
        </Badge>
      </div>
    </div>
  )
}

export default TradeCard
