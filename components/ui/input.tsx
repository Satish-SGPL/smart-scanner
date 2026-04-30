import { cn } from '@/lib/utils'
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, icon, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-strata-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-strata-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'min-h-11 w-full rounded-lg border border-strata-line bg-white py-2 text-sm text-strata-ink placeholder:text-gray-400 shadow-sm transition-colors focus:border-strata-blue focus:outline-none focus:ring-2 focus:ring-strata-blue/15 disabled:cursor-not-allowed disabled:bg-gray-50',
            icon ? 'pl-10 pr-3.5' : 'px-3.5',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
export { Input }
