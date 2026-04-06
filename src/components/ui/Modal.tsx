import type { FC, ReactNode } from 'react'
import Button from './Button'

type Props = {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
}

const Modal: FC<Props> = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden" dir="rtl">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-center relative min-h-[44px]">
          <button onClick={onClose} className="absolute left-5 text-slate-400 hover:text-white">✕</button>
          {title ? <h3 className="text-lg font-semibold text-white text-center w-full">{title}</h3> : null}
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/70 flex justify-end">
          <Button variant="secondary" onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </div>
  )
}

export default Modal
