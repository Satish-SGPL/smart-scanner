import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { LeadsClient } from './leads-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leads' }

export default async function LeadsPage() {
  const allEvents = await db.select({ id: events.id, name: events.name }).from(events)
  return <LeadsClient events={allEvents} />
}
