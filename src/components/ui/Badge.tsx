import type { FC, ReactNode } from 'react'

type BadgeVariant = 'emerald' | 'blue' | 'purple' | 'gray' | 'red'

const variants: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/60',
  blue: 'bg-sky-500/15 text-sky-300 border border-sky-400/60',
  purple: 'bg-purple-500/15 text-purple-300 border border-purple-400/60',
  gray: 'bg-slate-700/60 text-slate-200 border border-slate-600',
  red: 'bg-red-500/15 text-red-300 border border-red-400/60'
}

type Props = {
  children: ReactNode
  variant?: BadgeVariant
  pill?: boolean
  className?: string
}

const Badge: FC<Props> = ({ children, variant = 'gray', pill = true, className = '' }) => {
  return (
    <span className={`${variants[variant]} ${pill ? 'rounded-full' : 'rounded-xl'} px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}

export default Badge
