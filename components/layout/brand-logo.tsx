import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
  showText?: boolean
  tone?: 'light' | 'dark'
  imgClassName?: string
  /** @deprecated use imgClassName */
  markClassName?: string
}

export function BrandLogo({
  className,
  showText = true,
  tone = 'dark',
  imgClassName,
  markClassName,
}: BrandLogoProps) {
  const light = tone === 'light'
  const imgSize = imgClassName ?? markClassName ?? 'h-16 w-auto'

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <div className={cn('shrink-0 rounded-2xl p-2', light ? 'bg-white' : '')}>
        <img
          src="/strata-logo.png"
          alt="Strata logo"
          className={cn('w-auto object-contain', imgSize)}
        />
      </div>
      {showText && (
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-bold leading-tight', light ? 'text-white' : 'text-strata-blue')}>
            Strata
          </p>
          <p className={cn('truncate text-[10px] font-semibold uppercase tracking-[0.22em]', light ? 'text-white/70' : 'text-strata-muted')}>
            Scanner
          </p>
        </div>
      )}
    </div>
  )
}
