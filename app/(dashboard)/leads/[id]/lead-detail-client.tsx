'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Lead, Event } from '@/lib/db/schema'
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Briefcase,
  Download,
  Trash2,
  ArrowLeft,
  Pencil,
  X,
  Save,
  UserRound,
  CalendarDays,
} from 'lucide-react'

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 rounded-lg bg-strata-bg/80 p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-strata-blue ring-1 ring-strata-line">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-strata-muted">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-strata-ink">{value}</p>
      </div>
    </div>
  )
}

export function LeadDetailClient({ lead, events }: { lead: Lead; events: Event[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: lead.name ?? '',
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    company: lead.company ?? '',
    designation: lead.designation ?? '',
    website: lead.website ?? '',
    address: lead.address ?? '',
    notes: lead.notes ?? '',
    salesComments: lead.salesComments ?? '',
    leadType: lead.leadType ?? 'Warm',
    eventId: lead.eventId ?? 'general',
  })

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Lead updated')
      setEditing(false)
    } else {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete lead "${lead.name}"?`)) return
    setDeleting(true)
    const res = await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Lead deleted')
      router.push('/leads')
    } else {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  const displayName = form.name || lead.name

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        onClick={() => router.push('/leads')}
        className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-strata-muted transition-colors hover:text-strata-blue"
      >
        <ArrowLeft size={16} />
        All leads
      </button>

      <Card className="overflow-hidden">
        <CardHeader className="bg-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-strata-blue text-xl font-bold text-white">
                {displayName[0]?.toUpperCase() ?? <UserRound size={24} />}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-2xl leading-tight text-strata-blue">{displayName}</h2>
                <p className="mt-1 truncate text-sm text-strata-muted">
                  {form.designation || 'Lead'}{form.company ? ` at ${form.company}` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge variant="leadType" value={form.leadType}>{form.leadType}</Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-strata-line bg-strata-bg px-2.5 py-1 text-xs font-semibold text-strata-muted">
                <CalendarDays size={13} />
                {formatDate(lead.scannedAt)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Full name *" value={form.name} onChange={set('name')} />
                <Input label="Company" value={form.company} onChange={set('company')} />
                <Input label="Designation" value={form.designation} onChange={set('designation')} />
                <Input label="Email" type="email" value={form.email} onChange={set('email')} />
                <Input label="Phone" value={form.phone} onChange={set('phone')} />
                <Input label="Website" value={form.website} onChange={set('website')} />
              </div>
              <Input label="Address" value={form.address} onChange={set('address')} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Lead type" value={form.leadType} onChange={set('leadType')}>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </Select>
                <Select label="Event" value={form.eventId} onChange={set('eventId')}>
                  <option value="general">No event</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </Select>
              </div>
              <Textarea label="Notes" value={form.notes} onChange={set('notes')} rows={3} />
              <Textarea label="Sales comments" value={form.salesComments} onChange={set('salesComments')} rows={2} />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={Building2} label="Company" value={form.company} />
                <Field icon={Briefcase} label="Designation" value={form.designation} />
                <Field icon={Mail} label="Email" value={form.email} />
                <Field icon={Phone} label="Phone" value={form.phone} />
                <Field icon={Globe} label="Website" value={form.website} />
                <Field icon={MapPin} label="Address" value={form.address} />
              </div>

              {(form.notes || form.salesComments) && (
                <div className="grid gap-3">
                  {form.notes && (
                    <div className="rounded-lg border border-strata-line bg-white p-4">
                      <p className="text-xs font-semibold text-strata-muted">Notes</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-strata-ink">{form.notes}</p>
                    </div>
                  )}
                  {form.salesComments && (
                    <div className="rounded-lg border border-strata-line bg-white p-4">
                      <p className="text-xs font-semibold text-strata-muted">Sales comments</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-strata-ink">{form.salesComments}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg bg-strata-bg px-4 py-3 text-xs font-medium text-strata-muted">
                <p>Saved by: {lead.savedBy || '-'}</p>
                <p className="mt-1">Scanned: {formatDate(lead.scannedAt)}</p>
              </div>
            </div>
          )}
        </CardBody>

        <CardFooter>
          <div className="grid w-full gap-2 sm:flex sm:flex-wrap">
            {editing ? (
              <>
                <Button onClick={handleSave} loading={saving}>
                  <Save size={15} />
                  Save changes
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                  <X size={15} />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil size={15} />
                  Edit
                </Button>
                <a href={`/api/vcard/${lead.id}`} className="inline-flex">
                  <Button variant="secondary" className="w-full">
                    <Download size={15} />
                    vCard
                  </Button>
                </a>
                <Button variant="danger" onClick={handleDelete} loading={deleting}>
                  <Trash2 size={15} />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
