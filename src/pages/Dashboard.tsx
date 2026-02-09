import StatCard from '../components/cards/StatCard'
import TradeCard from '../components/cards/TradeCard'
import TradesTable from '../components/tables/TradesTable'
import { mockStats } from '../data/mockStats'
import { mockTrades } from '../data/mockTrades'

const Dashboard = () => {
  const sparkData = [120, 160, 140, 190, 210, 240, 230, 280, 260, 310]
  const maxValue = Math.max(...sparkData)

  const donutStats = {
    win: 2,
    lose: 0,
    open: 2
  }
  const donutTotal = donutStats.win + donutStats.lose + donutStats.open
  const donutRadius = 70
  const donutCirc = 2 * Math.PI * donutRadius

  return (
    <div className="space-y-8" dir="rtl">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
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
            <span className="text-sm text-emerald-300 font-semibold">+18%</span>
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
              points={sparkData
                .map((v, i) => `${(i / (sparkData.length - 1)) * 320},${140 - (v / maxValue) * 120}`)
                .join(' ')}
            />
            <polyline
              fill="none"
              stroke="rgb(16,185,129)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={sparkData
                .map((v, i) => `${(i / (sparkData.length - 1)) * 320},${140 - (v / maxValue) * 120}`)
                .join(' ')}
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
        <TradesTable trades={mockTrades} />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">آخر الصفقات</h3>
            <span className="text-xs text-slate-400">موجز سريع لآخر التحركات</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockTrades.slice(0, 4).map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
