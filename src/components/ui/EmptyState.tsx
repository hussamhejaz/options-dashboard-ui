import type { FC } from 'react'
import Button from './Button'

type Props = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

const EmptyState: FC<Props> = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="border border-dashed border-slate-800 rounded-2xl bg-slate-900/50 p-8 text-center space-y-3">
      <div className="text-3xl">📭</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
      {actionLabel && (
        <div className="pt-2">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState
