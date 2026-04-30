import { cn, leadTypeBadge } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'leadType' | 'status'
  value?: string
}

export function Badge({ children, className, variant, value }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        variant === 'leadType' && value ? leadTypeBadge(value) : 'bg-gray-100 text-gray-700',
        className
      )}
    >
      {variant === 'leadType' && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      )}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    completed: 'bg-blue-50 text-blue-700 border border-blue-200',
    archived: 'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize', styles[status] ?? styles.active)}>
      {status}
    </span>
  )
}
