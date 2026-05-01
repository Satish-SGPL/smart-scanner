import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { leads, events } from '@/lib/db/schema'
import { eq, desc, ilike, and, or, sql } from 'drizzle-orm'
import { generateId, normalizeEmail, normalizePhone, sanitizeInput } from '@/lib/utils'
import { syncLeadToSheets } from '@/lib/sheets-sync'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search   = searchParams.get('search') || ''
  const eventId  = searchParams.get('event_id') || ''
  const leadType = searchParams.get('lead_type') || ''
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit    = Math.min(100, parseInt(searchParams.get('limit') || '20'))
  const offset   = (page - 1) * limit

  const conditions = []
  if (search) {
    conditions.push(
      or(
        ilike(leads.name, `%${search}%`),
        ilike(leads.email, `%${search}%`),
        ilike(leads.company, `%${search}%`),
        ilike(leads.phone, `%${search}%`),
      )
    )
  }
  if (eventId)  conditions.push(eq(leads.eventId, eventId))
  if (leadType) conditions.push(eq(leads.leadType, leadType))

  const where = conditions.length ? and(...conditions) : undefined

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(leads).where(where).orderBy(desc(leads.scannedAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(leads).where(where),
  ])

  return NextResponse.json({ leads: rows, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const name = sanitizeInput(body.name || '')
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const emailNorm = normalizeEmail(body.email || '')

    // Duplicate check on email
    if (emailNorm) {
      const dup = await db.select({ id: leads.id }).from(leads).where(eq(leads.emailNorm, emailNorm)).limit(1)
      if (dup.length) {
        return NextResponse.json(
          { error: 'A lead with this email already exists', existingId: dup[0].id, isDuplicate: true },
          { status: 409 }
        )
      }
    }

    const newLead = {
      id: generateId(),
      name,
      email: sanitizeInput(body.email || ''),
      emailNorm,
      phone: sanitizeInput(body.phone || ''),
      phoneNorm: normalizePhone(body.phone || ''),
      company: sanitizeInput(body.company || ''),
      designation: sanitizeInput(body.designation || ''),
      website: sanitizeInput(body.website || ''),
      address: sanitizeInput(body.address || ''),
      notes: sanitizeInput(body.notes || '', 2000),
      salesComments: sanitizeInput(body.salesComments || '', 2000),
      eventId: body.eventId || 'general',
      leadType: ['Hot', 'Warm', 'Cold'].includes(body.leadType) ? body.leadType : 'Warm',
      savedBy: session.user?.name || '',
      savedByEmail: session.user?.email || '',
      submittedByName: session.user?.name || '',
      submittedByEmail: session.user?.email || '',
      scannedAt: new Date(),
    }

    await db.insert(leads).values(newLead)

    let eventName = ''
    if (newLead.eventId !== 'general') {
      const [eventRow] = await db
        .select({ name: events.name })
        .from(events)
        .where(eq(events.id, newLead.eventId))
        .limit(1)
      eventName = eventRow?.name || ''

      await db.execute(
        sql`UPDATE events SET lead_count = lead_count + 1, updated_at = NOW() WHERE id = ${newLead.eventId}`
      )
    }

    // Fire-and-forget Google Sheets sync — does not block the response
    syncLeadToSheets({
      scannedAt: newLead.scannedAt.toISOString(),
      name: newLead.name,
      company: newLead.company,
      designation: newLead.designation,
      email: newLead.email,
      phone: newLead.phone,
      website: newLead.website,
      address: newLead.address,
      leadType: newLead.leadType,
      eventName,
      salesComments: newLead.salesComments,
      savedBy: newLead.savedBy,
      savedByEmail: newLead.savedByEmail,
    })

    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
