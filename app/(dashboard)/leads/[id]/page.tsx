import { db } from '@/lib/db'
import { leads, events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { LeadDetailClient } from './lead-detail-client'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const [lead] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1)
  return { title: lead?.name ?? 'Lead' }
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const [[lead], allEvents] = await Promise.all([
    db.select().from(leads).where(eq(leads.id, params.id)).limit(1),
    db.select().from(events),
  ])
  if (!lead) notFound()
  return <LeadDetailClient lead={lead} events={allEvents} />
}
