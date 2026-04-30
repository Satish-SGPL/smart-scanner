'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar, MapPin, Plus, ChevronRight, Loader2, X, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/db/schema'

interface EventPickerProps {
  events: Event[]
}

export function EventPicker({ events }: EventPickerProps) {
  const router = useRouter()
  const [picking, setPicking] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newEvent, setNewEvent] = useState({ name: '', location: '', description: '' })

  const setActiveEvent = async (eventId: string) => {
    setPicking(eventId)
    try {
      const res = await fetch('/api/active-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      if (!res.ok) throw new Error('Failed to set active event')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set event')
      setPicking(null)
    }
  }

  const handleCreate = async () => {
    if (!newEvent.name.trim()) {
      toast.error('Event name is required')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      })
      if (!res.ok) throw new Error('Failed to create event')
      const created = await res.json()
      await setActiveEvent(created.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create event')
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-strata-blue/10">
          <Calendar size={26} className="text-strata-blue" />
        </div>
        <h1 className="font-heading text-2xl text-strata-blue sm:text-3xl">
          Where are you scanning today?
        </h1>
        <p className="mt-2 text-sm text-strata-muted">
          Pick the event you&apos;re working at, so every card you scan is tagged automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-heading text-lg text-strata-blue">Active events</h2>
          <p className="text-sm text-strata-muted">Tap an event to start scanning.</p>
        </CardHeader>
        <CardBody className="space-y-2">
          {events.length === 0 && (
            <div className="rounded-lg border border-dashed border-strata-line bg-strata-bg/50 px-4 py-6 text-center text-sm text-strata-muted">
              No active events yet. Create your first one below.
            </div>
          )}

          {events.map((event, idx) => {
            const isPicking = picking === event.id
            const isLatest = idx === 0
            return (
              <button
                key={event.id}
                onClick={() => setActiveEvent(event.id)}
                disabled={picking !== null}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                  'active:scale-[0.99]',
                  isLatest
                    ? 'border-strata-green bg-strata-green/5 hover:border-strata-green hover:bg-strata-green/10'
                    : 'border-strata-line bg-white hover:border-strata-blue hover:bg-strata-blue/5',
                  isPicking && 'ring-2 ring-strata-blue/30',
                  picking !== null && !isPicking && 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
                    isLatest
                      ? 'bg-strata-green text-white'
                      : 'bg-strata-blue/10 text-strata-blue group-hover:bg-strata-blue group-hover:text-white'
                  )}
                >
                  <Calendar size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-strata-ink">{event.name}</p>
                    {isLatest && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-strata-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        <Sparkles size={9} />
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-strata-muted">
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={11} />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {event.leadCount} {event.leadCount === 1 ? 'lead' : 'leads'}
                    </span>
                  </div>
                </div>
                {isPicking ? (
                  <Loader2 size={18} className="shrink-0 animate-spin text-strata-blue" />
                ) : (
                  <ChevronRight size={18} className="shrink-0 text-strata-muted group-hover:text-strata-blue" />
                )}
              </button>
            )
          })}
        </CardBody>
      </Card>

      {!showCreate ? (
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setShowCreate(true)}
          disabled={picking !== null}
        >
          <Plus size={17} />
          Create new event
        </Button>
      ) : (
        <Card>
          <CardHeader className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg text-strata-blue">New event</h2>
              <p className="text-sm text-strata-muted">Add the event you&apos;re scanning at.</p>
            </div>
            <button
              onClick={() => setShowCreate(false)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-strata-line text-strata-muted transition-colors hover:bg-strata-bg"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Event name *"
              value={newEvent.name}
              onChange={e => setNewEvent(v => ({ ...v, name: e.target.value }))}
              placeholder="Sydney Build Expo 2026"
              autoFocus
            />
            <Input
              label="Location"
              value={newEvent.location}
              onChange={e => setNewEvent(v => ({ ...v, location: e.target.value }))}
              placeholder="ICC Sydney"
            />
            <Textarea
              label="Description"
              value={newEvent.description}
              onChange={e => setNewEvent(v => ({ ...v, description: e.target.value }))}
              rows={2}
              placeholder="Optional notes about this event"
            />
            <Button onClick={handleCreate} loading={creating} size="lg" className="w-full">
              Create & start scanning
              <ChevronRight size={16} />
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="pt-1 text-center">
        <button
          onClick={() => setActiveEvent('general')}
          disabled={picking !== null}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-strata-muted transition-colors hover:text-strata-blue disabled:opacity-50"
        >
          Skip — scan without an event
        </button>
      </div>
    </div>
  )
}
