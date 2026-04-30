import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, icon, children, ...props }, ref) => (
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
        <select
          ref={ref}
          id={id}
          className={cn(
            'min-h-11 w-full cursor-pointer appearance-none rounded-lg border border-strata-line bg-white py-2 text-sm text-strata-ink shadow-sm transition-colors focus:border-strata-blue focus:outline-none focus:ring-2 focus:ring-strata-blue/15 disabled:bg-gray-50',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23363334\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-8',
            icon ? 'pl-10' : 'pl-3.5',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
export { Select }
