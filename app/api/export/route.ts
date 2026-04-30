import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import ExcelJS from 'exceljs'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const eventId = new URL(request.url).searchParams.get('event_id') || ''
  const where = eventId ? and(eq(leads.eventId, eventId)) : undefined

  const rows = await db.select().from(leads).where(where).orderBy(desc(leads.scannedAt))

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Leads')

  sheet.columns = [
    { header: 'Name',            key: 'name',          width: 24 },
    { header: 'Email',           key: 'email',         width: 28 },
    { header: 'Phone',           key: 'phone',         width: 18 },
    { header: 'Company',         key: 'company',       width: 24 },
    { header: 'Designation',     key: 'designation',   width: 22 },
    { header: 'Website',         key: 'website',       width: 26 },
    { header: 'Address',         key: 'address',       width: 32 },
    { header: 'Lead Type',       key: 'leadType',      width: 12 },
    { header: 'Notes',           key: 'notes',         width: 30 },
    { header: 'Sales Comments',  key: 'salesComments', width: 30 },
    { header: 'Saved By',        key: 'savedBy',       width: 22 },
    { header: 'Date Scanned',    key: 'scannedAt',     width: 20 },
  ]

  // Style the header row
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004270' } }

  rows.forEach(l => {
    sheet.addRow({
      name:          l.name,
      email:         l.email,
      phone:         l.phone,
      company:       l.company,
      designation:   l.designation,
      website:       l.website,
      address:       l.address,
      leadType:      l.leadType,
      notes:         l.notes,
      salesComments: l.salesComments,
      savedBy:       l.savedBy,
      scannedAt:     l.scannedAt ? new Date(l.scannedAt).toLocaleString() : '',
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer as Buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="strata-leads-${Date.now()}.xlsx"`,
    },
  })
}
