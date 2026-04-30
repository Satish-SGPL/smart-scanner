import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, ReactNode, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, icon, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-strata-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-3 text-strata-muted">
            {icon}
          </span>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full resize-none rounded-lg border border-strata-line bg-white py-2.5 text-sm text-strata-ink placeholder:text-gray-400 shadow-sm transition-colors focus:border-strata-blue focus:outline-none focus:ring-2 focus:ring-strata-blue/15 disabled:bg-gray-50',
            icon ? 'pl-10 pr-3.5' : 'px-3.5',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
export { Textarea }
