import type { FC, InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const Input: FC<Props> = ({ label, className = '', ...rest }) => {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-300">
      {label && <span className="text-slate-200 font-medium">{label}</span>}
      <input
        className={`w-full rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 text-right placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none ${className}`}
        dir="rtl"
        {...rest}
      />
    </label>
  )
}

export default Input
