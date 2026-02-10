import type { FC } from 'react'
import type { Trade } from '../../types/trade'
import Badge from '../ui/Badge'

type Props = {
  trades: Trade[]
}

const TradesTable: FC<Props> = ({ trades }) => {
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white leading-tight">قائمة الصفقات</h3>
          <span className="text-xs text-slate-400 block md:hidden mt-1">بيانات تجريبية محدثة لحظيًا</span>
        </div>
        <span className="hidden md:block text-xs text-slate-400">محدثة لحظيًا (بيانات تجريبية)</span>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-800/80">
        {trades.map((trade) => {
          const isProfit = trade.pl >= 0
          const profitValue = (trade.currentPrice - trade.entryPrice) * trade.contracts * 100
          return (
            <div key={trade.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-white">{trade.symbol}</span>
                  <Badge
                    variant={trade.type === 'CALL' ? 'blue' : 'purple'}
                    className="text-[11px] px-2.5 py-1"
                  >
                    {trade.type === 'CALL' ? 'شراء (CALL)' : 'بيع (PUT)'}
                  </Badge>
                </div>
                <Badge variant={trade.status === 'open' ? 'emerald' : 'gray'}>{trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div>
                  <p className="text-xs text-slate-500">سترايك</p>
                  <p className="font-semibold">${trade.strike.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">تاريخ الانتهاء</p>
                  <p className="font-semibold">{trade.expiry}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">سعر الدخول</p>
                  <p className="font-semibold">${trade.entryPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">أعلى</p>
                  <p className="font-semibold">${(trade.strike / 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">الربح/الخسارة</span>
                <div className="text-right">
                  <span className={`block text-base font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}
                    {trade.pl.toFixed(2)}%
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {isProfit ? '+' : ''}${profitValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-fixed text-sm text-right break-words">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium">الرمز</th>
              <th className="px-4 py-3 font-medium">النوع</th>
              <th className="px-4 py-3 font-medium">سترايك</th>
              <th className="px-4 py-3 font-medium">تاريخ الانتهاء</th>
              <th className="px-4 py-3 font-medium">سعر الدخول</th>
              <th className="px-4 py-3 font-medium">أعلى</th>
              <th className="px-4 py-3 font-medium">الربح/الخسارة</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, idx) => {
              const isProfit = trade.pl >= 0
              const profitValue = (trade.currentPrice - trade.entryPrice) * trade.contracts * 100
              return (
                <tr
                  key={trade.id}
                  className={`${idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/60'} hover:bg-slate-800/80 transition`}
                >
                  <td className="px-4 py-3 text-white font-semibold">{trade.symbol}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={trade.type === 'CALL' ? 'blue' : 'purple'}
                      className="whitespace-nowrap text-[11px] px-2.5 py-1"
                    >
                      {trade.type === 'CALL' ? 'شراء (CALL)' : 'بيع (PUT)'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-200">${trade.strike.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-200">{trade.expiry}</td>
                  <td className="px-4 py-3 text-slate-200">${trade.entryPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-200">${(trade.strike / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className={`font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span className="block">
                        {isProfit ? '+' : ''}
                        {trade.pl.toFixed(2)}%
                      </span>
                      <span className="block text-xs text-slate-400">
                        {isProfit ? '+' : ''}${profitValue.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={trade.status === 'open' ? 'emerald' : 'gray'}>
                      {trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TradesTable
