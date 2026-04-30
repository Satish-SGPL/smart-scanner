import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-normal transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-strata-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none',
        {
          'bg-strata-blue text-white shadow-sm hover:bg-strata-blue-dark active:scale-[0.98]': variant === 'primary',
          'bg-strata-green text-white shadow-sm hover:bg-strata-green-dark active:scale-[0.98]': variant === 'secondary',
          'border border-strata-line bg-white text-strata-blue hover:border-strata-blue/40 hover:bg-strata-blue/5': variant === 'outline',
          'text-strata-dark hover:bg-strata-blue/10 hover:text-strata-blue': variant === 'ghost',
          'bg-red-600 text-white shadow-sm hover:bg-red-700': variant === 'danger',
        },
        {
          'min-h-9 px-3 py-1.5 text-xs': size === 'sm',
          'min-h-11 px-4 py-2 text-sm': size === 'md',
          'min-h-12 px-5 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
export { Button }
