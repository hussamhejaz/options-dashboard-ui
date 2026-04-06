import type { FC } from 'react'
import Button from '../ui/Button'
import type { Ad } from '../../data/mockAds'

type Props = {
  ad: Ad
  onEdit?: (ad: Ad) => void
  onDelete?: (id: string) => void
}

const AdCard: FC<Props> = ({ ad, onEdit, onDelete }) => {
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      <div className="relative h-3 w-full" aria-hidden />
      <div className="p-4 space-y-3 flex-1 flex flex-col" dir="rtl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{ad.title}</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed flex-1">{ad.description}</p>
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit?.(ad)}>تعديل</Button>
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-white" onClick={() => onDelete?.(ad.id)}>
            حذف
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdCard
