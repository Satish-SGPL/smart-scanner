'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Event } from '@/lib/db/schema'
import { Plus, Pencil, Trash2, Users, Calendar, X, Save, MapPin, ClipboardList } from 'lucide-react'

function EventModal({
  event,
  onClose,
  onSave,
}: {
  event?: Event | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(event?.name ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [location, setLocation] = useState(event?.location ?? '')
  const [status, setStatus] = useState(event?.status ?? 'active')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const res = await fetch(event ? `/api/events/${event.id}` : '/api/events', {
      method: event ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, location, status }),
    })
    if (res.ok) {
      toast.success(event ? 'Event updated' : 'Event created')
      onSave()
    } else {
      toast.error('Failed to save event')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-strata-ink/40 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="w-full max-w-lg rounded-lg border border-strata-line bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-strata-line px-5 py-4">
          <div>
            <h3 className="font-heading text-2xl text-strata-blue">{event ? 'Edit event' : 'New event'}</h3>
            <p className="mt-1 text-sm text-strata-muted">Keep event context attached to captured leads.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close event modal"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-strata-bg hover:text-strata-blue"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <Input label="Event name *" value={name} onChange={e => setName(e.target.value)} placeholder="Product Expo 2026" />
          <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Sydney Convention Centre" />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description" />

          {event && (
            <Select label="Status" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </Select>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-strata-line bg-strata-bg/70 px-5 py-4 sm:flex-row">
          <Button onClick={handleSave} loading={saving} className="flex-1">
            <Save size={15} />
            {event ? 'Save changes' : 'Create event'}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

export function EventsClient() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; event?: Event | null }>({ open: false })
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/events')
    if (res.ok) setEvents(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleDelete = async (event: Event) => {
    if (!confirm(`Delete "${event.name}"? All leads will be moved to General.`)) return
    setDeleting(event.id)
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Event deleted')
      fetchEvents()
    } else {
      toast.error('Failed to delete')
    }
    setDeleting(null)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-strata-muted">
            {loading ? 'Loading events...' : `${events.length} event${events.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => setModal({ open: true, event: null })} className="w-full sm:w-auto">
          <Plus size={16} />
          New event
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg shimmer" />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <Card>
          <CardBody className="py-16 text-center">
            <Calendar size={40} className="mx-auto mb-3 text-strata-line" />
            <p className="text-sm font-semibold text-strata-ink">No events yet</p>
            <Button className="mt-4" size="sm" onClick={() => setModal({ open: true })}>
              <Plus size={14} />
              Create first event
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {events.map(event => (
          <Card key={event.id} className="transition-shadow hover:shadow-card-hover">
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-strata-blue/10 text-strata-blue">
                    <Calendar size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-strata-ink">{event.name}</h3>
                    {event.location && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-strata-muted">
                        <MapPin size={13} />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={event.status ?? 'active'} />
              </div>

              {event.description ? (
                <p className="line-clamp-2 text-sm leading-6 text-strata-muted">{event.description}</p>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-strata-bg px-3 py-2 text-sm text-strata-muted">
                  <ClipboardList size={15} />
                  No description added
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-strata-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-strata-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} className="text-strata-blue" />
                    {event.leadCount} lead{event.leadCount !== 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} />
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModal({ open: true, event })}
                    className="grid h-9 w-9 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-strata-blue/10 hover:text-strata-blue"
                    aria-label={`Edit ${event.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    disabled={deleting === event.id}
                    className="grid h-9 w-9 place-items-center rounded-lg text-strata-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    aria-label={`Delete ${event.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {modal.open && (
        <EventModal
          event={modal.event}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); fetchEvents() }}
        />
      )}
    </div>
  )
}
