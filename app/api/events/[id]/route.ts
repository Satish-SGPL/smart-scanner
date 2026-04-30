import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { events, leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sanitizeInput } from '@/lib/utils'

type Ctx = { params: { id: string } }

export async function PUT(request: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [existing] = await db.select().from(events).where(eq(events.id, params.id)).limit(1)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  await db.update(events).set({
    name: sanitizeInput(body.name || existing.name || ''),
    description: sanitizeInput(body.description || ''),
    location: sanitizeInput(body.location || ''),
    status: ['active', 'completed', 'archived'].includes(body.status) ? body.status : existing.status,
    updatedAt: new Date(),
  }).where(eq(events.id, params.id))

  const [updated] = await db.select().from(events).where(eq(events.id, params.id)).limit(1)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Reassign leads to 'general' before deleting
  await db.update(leads).set({ eventId: 'general' }).where(eq(leads.eventId, params.id))
  await db.delete(events).where(eq(events.id, params.id))

  return NextResponse.json({ success: true })
}
