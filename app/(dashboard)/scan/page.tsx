import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ScanClient } from './scan-client'
import { EventPicker } from '@/components/scanner/event-picker'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Scan Card' }

export default async function ScanPage() {
  const activeEvents = await db
    .select()
    .from(events)
    .where(eq(events.status, 'active'))
    .orderBy(desc(events.createdAt))
  const activeEventId = cookies().get('active_event_id')?.value

  if (!activeEventId) {
    return <EventPicker events={activeEvents} />
  }

  const activeEvent = activeEvents.find(e => e.id === activeEventId) ?? null

  return (
    <ScanClient
      events={activeEvents}
      activeEventId={activeEventId}
      activeEvent={activeEvent}
    />
  )
}
