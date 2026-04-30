import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateVCard } from '@/lib/utils'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [lead] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1)
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const vcard = generateVCard(lead)
  const filename = `${lead.name.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`

  return new NextResponse(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
