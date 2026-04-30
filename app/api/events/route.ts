import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { generateId, sanitizeInput } from '@/lib/utils'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await db.select().from(events).orderBy(desc(events.createdAt))
  return NextResponse.json(all)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const newEvent = {
    id: generateId(),
    name: sanitizeInput(body.name),
    description: sanitizeInput(body.description || ''),
    location: sanitizeInput(body.location || ''),
    status: 'active',
    leadCount: 0,
    createdAt: new Date(),
  }

  await db.insert(events).values(newEvent)
  return NextResponse.json(newEvent, { status: 201 })
}
