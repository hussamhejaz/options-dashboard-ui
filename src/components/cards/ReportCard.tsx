import type { FC } from 'react'
import Button from '../ui/Button'

type Props = {
  title: string
  description: string
  stats: string[]
}

const ReportCard: FC<Props> = ({ title, description, stats }) => {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 border border-slate-800/80 p-5 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.7)] flex flex-col gap-4">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-200">
        {stats.map((stat, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 shadow-inner"
          >
            {stat}
          </span>
        ))}
      </div>
      <div className="pt-1">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-center bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
        >
          عرض التفاصيل
        </Button>
      </div>
    </div>
  )
}

export default ReportCard
