import type { ButtonHTMLAttributes, FC } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/60'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
  ghost: 'bg-transparent hover:bg-slate-800 text-white'
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm'
}

const Button: FC<Props> = ({ variant = 'primary', size = 'md', block, className = '', children, ...rest }) => {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
