import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { leads, events } from '@/lib/db/schema'
import { desc, sql, gte } from 'drizzle-orm'
import { formatDate } from '@/lib/utils'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  Calendar,
  TrendingUp,
  ScanLine,
  ArrowRight,
  Clock3,
  ContactRound,
  Sparkles,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    [{ total }],
    [{ monthly }],
    [{ eventCount }],
    recentLeads,
  ] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(leads),
    db.select({ monthly: sql<number>`count(*)::int` }).from(leads).where(gte(leads.scannedAt, startOfMonth)),
    db.select({ eventCount: sql<number>`count(*)::int` }).from(events).where(sql`status = 'active'`),
    db.select().from(leads).orderBy(desc(leads.scannedAt)).limit(5),
  ])

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'
  const latestLead = recentLeads[0]

  const stats = [
    {
      label: 'Total leads',
      value: total,
      detail: 'All saved contacts',
      icon: Users,
      iconClass: 'bg-strata-blue/10 text-strata-blue',
    },
    {
      label: 'This month',
      value: monthly,
      detail: 'Fresh captures',
      icon: TrendingUp,
      iconClass: 'bg-strata-green/10 text-strata-green',
    },
    {
      label: 'Active events',
      value: eventCount,
      detail: 'Open lead sources',
      icon: Calendar,
      iconClass: 'bg-amber-50 text-strata-amber',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-lg bg-strata-blue text-white shadow-card">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75 ring-1 ring-white/15">
              <Sparkles size={13} className="text-strata-green" />
              Strata Scanner dashboard
            </div>
            <h2 className="font-heading text-3xl leading-tight sm:text-4xl">Good to see you, {firstName}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Keep the capture flow moving with quick scanning, clean lead records, and event-level organization.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-80 lg:grid-cols-1">
            <Link href="/scan">
              <Button size="lg" className="w-full bg-white text-strata-blue hover:bg-white/90">
                <ScanLine size={18} />
                Scan new card
                <ArrowRight size={17} />
              </Button>
            </Link>
            <div className="rounded-lg border border-white/10 bg-white/10 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                <Clock3 size={13} />
                Latest
              </div>
              <p className="mt-2 truncate text-sm font-semibold">
                {latestLead ? latestLead.name : 'No leads captured yet'}
              </p>
              <p className="mt-0.5 text-xs text-white/60">
                {latestLead ? formatDate(latestLead.scannedAt) : 'Start with your first scan'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, detail, icon: Icon, iconClass }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${iconClass}`}>
                <Icon size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-3xl font-bold tracking-tight text-strata-ink">{value}</p>
                <p className="text-sm font-semibold text-strata-ink">{label}</p>
                <p className="text-xs text-strata-muted">{detail}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-strata-line px-4 py-4 sm:px-5">
            <div>
              <h3 className="font-heading text-xl text-strata-blue">Recent leads</h3>
              <p className="text-sm text-strata-muted">Most recently scanned contacts.</p>
            </div>
            <Link href="/leads">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </div>
          <div className="divide-y divide-strata-line/70">
            {recentLeads.length === 0 && (
              <div className="px-5 py-12 text-center">
                <ContactRound size={38} className="mx-auto mb-3 text-strata-line" />
                <p className="text-sm font-semibold text-strata-ink">No leads yet</p>
                <p className="mt-1 text-sm text-strata-muted">Your latest scans will appear here.</p>
              </div>
            )}
            {recentLeads.map(lead => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-strata-bg sm:px-5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-strata-blue/10 text-sm font-bold text-strata-blue">
                  {lead.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-strata-ink">{lead.name}</p>
                  <p className="truncate text-xs text-strata-muted">
                    {lead.company || lead.email || 'No company added'}
                  </p>
                </div>
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                  <Badge variant="leadType" value={lead.leadType}>{lead.leadType}</Badge>
                  <span className="text-xs text-strata-muted">{formatDate(lead.scannedAt)}</span>
                </div>
                <ArrowRight size={16} className="shrink-0 text-strata-muted" />
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-strata-green/10 text-strata-green">
                <ScanLine size={24} />
              </div>
              <div>
                <h3 className="font-heading text-xl text-strata-blue">Show-floor capture</h3>
                <p className="mt-1 text-sm leading-6 text-strata-muted">
                  Turn card exchanges into clean lead records while the conversation is still fresh.
                </p>
              </div>
              <Link href="/scan">
                <Button variant="secondary" className="w-full">
                  Open scanner
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-strata-blue/10 text-strata-blue">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-strata-ink">Events</p>
                  <p className="text-xs text-strata-muted">{eventCount} active right now</p>
                </div>
              </div>
              <Link href="/events">
                <Button variant="outline" className="w-full">Manage events</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
