import type { FC, SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

const Select: FC<Props> = ({ label, className = '', children, ...rest }) => {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-300">
      {label && <span className="text-slate-200 font-medium">{label}</span>}
      <select
        className={`w-full rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none ${className}`}
        dir="rtl"
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

export default Select
