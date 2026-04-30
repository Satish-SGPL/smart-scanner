'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { Lead } from '@/lib/db/schema'
import {
  Search,
  Download,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ContactRound,
  FileDown,
  SlidersHorizontal,
  Building2,
  Mail,
  Phone,
  CalendarDays,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LeadsClientProps {
  events: { id: string; name: string }[]
}

const skeletonWidths = ['72%', '54%', '64%', '46%', '58%']

export function LeadsClient({ events }: LeadsClientProps) {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventId, setEventId] = useState('')
  const [leadType, setLeadType] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const limit = 20

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(eventId && { event_id: eventId }),
      ...(leadType && { lead_type: leadType }),
    })
    const res = await fetch(`/api/leads?${params}`)
    if (res.ok) {
      const data = await res.json()
      setLeads(data.leads)
      setTotal(data.total)
    }
    setLoading(false)
  }, [page, search, eventId, leadType])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { setPage(1) }, [search, eventId, leadType])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Lead deleted')
      fetchLeads()
    } else {
      toast.error('Failed to delete')
    }
    setDeleting(null)
  }

  const handleExport = () => {
    const params = eventId ? `?event_id=${eventId}` : ''
    window.location.href = `/api/export${params}`
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-strata-ink">
            <SlidersHorizontal size={17} className="text-strata-green" />
            Filters
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]">
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-strata-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, company"
                className="min-h-11 w-full rounded-lg border border-strata-line bg-white px-10 py-2 text-sm text-strata-ink shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-strata-blue focus:ring-2 focus:ring-strata-blue/15"
              />
            </div>
            <select
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              className="min-h-11 rounded-lg border border-strata-line bg-white px-3 py-2 text-sm text-strata-ink shadow-sm outline-none transition-colors focus:border-strata-blue focus:ring-2 focus:ring-strata-blue/15"
            >
              <option value="">All events</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select
              value={leadType}
              onChange={e => setLeadType(e.target.value)}
              className="min-h-11 rounded-lg border border-strata-line bg-white px-3 py-2 text-sm text-strata-ink shadow-sm outline-none transition-colors focus:border-strata-blue focus:ring-2 focus:ring-strata-blue/15"
            >
              <option value="">All types</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
            <Button variant="outline" size="md" onClick={handleExport} className="w-full lg:w-auto">
              <FileDown size={16} />
              Export
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-strata-muted">
          {loading ? 'Loading leads...' : `${total} lead${total !== 1 ? 's' : ''} found`}
        </p>
        <Link href="/scan">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus size={15} />
            New scan
          </Button>
        </Link>
      </div>

      <div className="space-y-3 sm:hidden">
        {loading && skeletonWidths.map((width, i) => (
          <Card key={width}>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded shimmer" style={{ width }} />
                  <div className="h-3 rounded shimmer" style={{ width: '48%' }} />
                </div>
              </div>
              <div className="h-9 rounded-lg shimmer" />
            </CardBody>
          </Card>
        ))}

        {!loading && leads.length === 0 && (
          <Card>
            <CardBody className="py-12 text-center">
              <ContactRound size={38} className="mx-auto mb-3 text-strata-line" />
              <p className="text-sm font-semibold text-strata-ink">No leads found</p>
              <p className="mt-1 text-sm text-strata-muted">Try changing the search or filters.</p>
            </CardBody>
          </Card>
        )}

        {!loading && leads.map(lead => (
          <Card key={lead.id}>
            <CardBody className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-strata-blue/10 text-sm font-bold text-strata-blue">
                  {lead.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="truncate text-left text-base font-semibold text-strata-ink"
                    >
                      {lead.name}
                    </button>
                    <Badge variant="leadType" value={lead.leadType}>{lead.leadType}</Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-strata-muted">
                    {lead.company && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Building2 size={13} className="shrink-0" />
                        {lead.company}
                      </p>
                    )}
                    {lead.email && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail size={13} className="shrink-0" />
                        {lead.email}
                      </p>
                    )}
                    {lead.phone && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Phone size={13} className="shrink-0" />
                        {lead.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {formatDate(lead.scannedAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/leads/${lead.id}`)}>
                  <Eye size={14} />
                  View
                </Button>
                <a href={`/api/vcard/${lead.id}`} className="inline-flex">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Download size={14} />
                    vCard
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(lead.id, lead.name)}
                  disabled={deleting === lead.id}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-lg border border-strata-line bg-white px-3 py-2 shadow-card">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-strata-muted transition-colors hover:bg-strata-blue/10 hover:text-strata-blue disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-xs font-semibold text-strata-muted">
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-strata-muted transition-colors hover:bg-strata-blue/10 hover:text-strata-blue disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <Card className="hidden overflow-hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-strata-line bg-strata-bg">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-strata-muted">Name</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-strata-muted md:table-cell">Company</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-strata-muted lg:table-cell">Email</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-strata-muted xl:table-cell">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-strata-muted">Type</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-strata-muted md:table-cell">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-strata-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-strata-line/70">
              {loading && skeletonWidths.map((width, i) => (
                <tr key={`${width}-${i}`}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded shimmer" style={{ width: j === 0 ? width : '70%' }} />
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <ContactRound size={38} className="mx-auto mb-3 text-strata-line" />
                    <p className="text-sm font-semibold text-strata-ink">No leads found</p>
                    <p className="mt-1 text-sm text-strata-muted">Try changing the search or filters.</p>
                  </td>
                </tr>
              )}
              {!loading && leads.map(lead => (
                <tr key={lead.id} className="transition-colors hover:bg-strata-bg/70">
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/leads/${lead.id}`)} className="flex min-w-0 items-center gap-2 text-left">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-strata-blue/10 text-xs font-bold text-strata-blue">
                        {lead.name[0]?.toUpperCase()}
                      </div>
                      <span className="max-w-[180px] truncate font-semibold text-strata-ink">{lead.name}</span>
                    </button>
                  </td>
                  <td className="hidden max-w-[150px] truncate px-4 py-3 text-strata-muted md:table-cell">{lead.company || '-'}</td>
                  <td className="hidden max-w-[210px] truncate px-4 py-3 text-strata-muted lg:table-cell">{lead.email || '-'}</td>
                  <td className="hidden px-4 py-3 text-strata-muted xl:table-cell">{lead.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="leadType" value={lead.leadType}>{lead.leadType}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-strata-muted md:table-cell">{formatDate(lead.scannedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/leads/${lead.id}`)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-strata-blue/10 hover:text-strata-blue"
                        aria-label={`View ${lead.name}`}
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <a
                        href={`/api/vcard/${lead.id}`}
                        className="grid h-9 w-9 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-strata-green/10 hover:text-strata-green"
                        aria-label={`Download vCard for ${lead.name}`}
                        title="Download vCard"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => handleDelete(lead.id, lead.name)}
                        disabled={deleting === lead.id}
                        className="grid h-9 w-9 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        aria-label={`Delete ${lead.name}`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-strata-line bg-strata-bg/70 px-4 py-3">
            <p className="text-xs font-medium text-strata-muted">
              Page {page} of {totalPages} - {total} total
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="grid h-8 w-8 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-white hover:text-strata-blue disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      'h-8 w-8 rounded-lg text-xs font-semibold transition-colors',
                      n === page ? 'bg-strata-blue text-white' : 'text-strata-muted hover:bg-white hover:text-strata-blue'
                    )}
                  >
                    {n}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="grid h-8 w-8 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-white hover:text-strata-blue disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
