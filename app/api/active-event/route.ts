import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const COOKIE_NAME = 'active_event_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 4 // 4 days

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId } = await request.json()
  if (!eventId || typeof eventId !== 'string') {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
  }

  cookies().set(COOKIE_NAME, eventId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })

  return NextResponse.json({ ok: true, eventId })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  cookies().delete(COOKIE_NAME)
  return NextResponse.json({ ok: true })
}
