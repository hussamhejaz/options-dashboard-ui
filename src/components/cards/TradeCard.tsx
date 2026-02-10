import type { FC } from 'react'
import type { Trade } from '../../types/trade'
import Badge from '../ui/Badge'

const TradeCard: FC<{ trade: Trade }> = ({ trade }) => {
  const isProfit = trade.pl >= 0
  const profitValue = (trade.currentPrice - trade.entryPrice) * trade.contracts
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
        <span>السعر الحالي</span>
        <span className="text-white">${trade.currentPrice.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">الربح / الخسارة</span>
        <div className="text-right leading-tight">
          <span className={`${isProfit ? 'text-emerald-400' : 'text-red-400'} font-semibold block`}>
            {isProfit ? '+' : ''}{trade.pl.toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 block">
            {isProfit ? '+' : ''}${profitValue.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        <Badge variant={trade.status === 'open' ? 'emerald' : 'gray'}>
          {trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}
        </Badge>
      </div>
    </div>
  )
}

export default TradeCard
