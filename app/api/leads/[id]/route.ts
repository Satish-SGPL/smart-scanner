import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { normalizeEmail, normalizePhone, sanitizeInput } from '@/lib/utils'

type Ctx = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [lead] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1)
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [existing] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  await db.update(leads).set({
    name: sanitizeInput(body.name || existing.name || ''),
    email: sanitizeInput(body.email || ''),
    emailNorm: normalizeEmail(body.email || ''),
    phone: sanitizeInput(body.phone || ''),
    phoneNorm: normalizePhone(body.phone || ''),
    company: sanitizeInput(body.company || ''),
    designation: sanitizeInput(body.designation || ''),
    website: sanitizeInput(body.website || ''),
    address: sanitizeInput(body.address || ''),
    notes: sanitizeInput(body.notes || '', 2000),
    salesComments: sanitizeInput(body.salesComments || '', 2000),
    leadType: ['Hot', 'Warm', 'Cold'].includes(body.leadType) ? body.leadType : existing.leadType,
    eventId: body.eventId || existing.eventId || 'general',
  }).where(eq(leads.id, params.id))

  const [updated] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [existing] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.delete(leads).where(eq(leads.id, params.id))

  if (existing.eventId && existing.eventId !== 'general') {
    await db.execute(
      sql`UPDATE events SET lead_count = GREATEST(lead_count - 1, 0), updated_at = NOW() WHERE id = ${existing.eventId}`
    )
  }

  return NextResponse.json({ success: true })
}
