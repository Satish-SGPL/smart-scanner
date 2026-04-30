'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Menu, Plus, Sparkles } from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { Button } from '@/components/ui/button'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'A quick view of capture activity and recent leads.',
  },
  '/scan': {
    title: 'Scan Card',
    subtitle: 'Capture, review, and save a lead from a business card.',
  },
  '/leads': {
    title: 'Leads',
    subtitle: 'Search, filter, export, and manage captured contacts.',
  },
  '/events': {
    title: 'Events',
    subtitle: 'Organize leads by trade show, expo, or sales visit.',
  },
}

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const page = Object.entries(titles).find(([key]) =>
    pathname === key || pathname.startsWith(`${key}/`)
  )?.[1] ?? {
    title: 'Strata Scanner',
    subtitle: 'Lead capture workspace',
  }

  return (
    <header className="sticky top-0 z-20 border-b border-strata-line/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-5 lg:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-strata-line bg-white text-strata-blue shadow-sm transition-colors hover:bg-strata-blue/5 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <BrandLogo className="min-w-0 lg:hidden" markClassName="h-10 w-10" />

        <div className="hidden min-w-0 lg:block">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl leading-tight text-strata-blue">{page.title}</h1>
            <Sparkles size={16} className="text-strata-green" aria-hidden />
          </div>
          <p className="mt-0.5 text-sm text-strata-muted">{page.subtitle}</p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold text-strata-ink">
              {session?.user?.name ?? 'Strata user'}
            </p>
            <p className="truncate text-xs text-strata-muted">{session?.user?.email ?? 'Signed in'}</p>
          </div>
          <Link href="/scan" className="hidden sm:block">
            <Button size="sm">
              <Plus size={15} />
              Scan
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
