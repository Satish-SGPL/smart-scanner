'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  ScanLine,
  Users,
  Calendar,
  LayoutDashboard,
  LogOut,
  Plus,
} from 'lucide-react'
import { BrandLogo } from './brand-logo'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan', label: 'Scan', icon: ScanLine },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/events', label: 'Events', icon: Calendar },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-strata-blue text-white shadow-2xl shadow-strata-blue/25">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <BrandLogo tone="light" showText={false} imgClassName="h-12 w-auto" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-white">Strata</p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Scanner
          </p>
        </div>
      </div>

      <div className="px-4 py-4">
        <Link
          href="/scan"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-semibold text-strata-blue shadow-soft transition-transform active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New scan
          </span>
          <ScanLine size={16} className="text-strata-green" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors',
                active
                  ? 'bg-white/15 text-white ring-1 ring-white/10'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-lg',
                  active ? 'bg-strata-green text-white' : 'bg-white/10 text-white/70'
                )}
              >
                <Icon size={17} />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-strata-green text-base font-bold text-white">
              {session?.user?.name?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {session?.user?.name ?? 'Strata user'}
              </p>
              <p className="truncate text-[11px] text-white/60">
                {session?.user?.email ?? 'Signed in'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition-colors hover:border-red-300/40 hover:bg-red-500/15 hover:text-red-100"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  const sideItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads', label: 'Leads', icon: Users },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const scanActive = isActive('/scan')

  const NavItem = ({ href, label, icon: Icon }: typeof sideItems[number]) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        className="group flex flex-col items-center justify-center gap-1 py-2"
      >
        <Icon
          size={22}
          strokeWidth={1.8}
          className={cn(
            'transition-colors',
            active ? 'text-strata-green' : 'text-strata-dark/45 group-hover:text-strata-blue'
          )}
        />
        <span
          className={cn(
            'text-[11px] font-semibold transition-colors',
            active ? 'text-strata-blue' : 'text-strata-dark/70'
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-all duration-200',
            active ? 'bg-strata-green' : 'bg-transparent'
          )}
        />
      </Link>
    )
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="pointer-events-auto relative mx-auto w-[92%] max-w-md pb-3">
        {/* Floating Scan button — overlapping the navbar */}
        <Link
          href="/scan"
          aria-label="Scan card"
          className={cn(
            'absolute -top-7 left-1/2 z-10 grid h-[68px] w-[68px] -translate-x-1/2 place-items-center rounded-full',
            'bg-gradient-to-br from-strata-blue to-strata-blue-dark text-white',
            'shadow-[0_10px_28px_rgba(0,66,112,0.32)] ring-4 ring-white',
            'transition-all duration-200 hover:scale-105 active:scale-95',
            scanActive && 'ring-strata-green/30'
          )}
        >
          <ScanLine size={28} strokeWidth={2.2} />
        </Link>

        {/* Navbar shell */}
        <div
          className="relative rounded-[28px_28px_36px_36px] border border-strata-blue/[0.08] bg-white shadow-[0_12px_35px_rgba(0,66,112,0.14)]"
          style={{ minHeight: 78 }}
        >
          <nav className="grid grid-cols-3 items-end px-2 pt-1">
            <NavItem {...sideItems[0]} />

            {/* Center column — label sits below the floating Scan button */}
            <Link
              href="/scan"
              className="flex flex-col items-center justify-end gap-1 pb-2 pt-9"
            >
              <span
                className={cn(
                  'text-[11px] font-semibold transition-colors',
                  scanActive ? 'text-strata-blue' : 'text-strata-dark/70'
                )}
              >
                Scan
              </span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all duration-200',
                  scanActive ? 'bg-strata-green' : 'bg-transparent'
                )}
              />
            </Link>

            <NavItem {...sideItems[1]} />
          </nav>
        </div>
      </div>
    </div>
  )
}
