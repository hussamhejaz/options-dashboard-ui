import type { FC, ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  delta?: string
  icon?: ReactNode
}

const StatCard: FC<StatCardProps> = ({ label, value, delta, icon }) => {
  const positive = delta ? delta.startsWith('+') : false
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 shadow-lg hover:border-emerald-500/40 transition">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-400">{label}</div>
        <div className="w-10 h-10 rounded-xl bg-slate-800/70 flex items-center justify-center text-xl">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        {delta && (
          <span className={`${positive ? 'text-emerald-400' : 'text-red-400'} text-sm font-semibold`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}

export default StatCard
