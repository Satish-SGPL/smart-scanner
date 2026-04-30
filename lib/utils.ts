import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return uuidv4()
}

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

export function normalizePhone(phone: string) {
  return phone.replace(/[\s\-().+]/g, '')
}

export function sanitizeInput(input: string, maxLength = 500) {
  return input.replace(/<[^>]*>/g, '').trim().slice(0, maxLength)
}

export function formatDate(date: Date | string | null) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function leadTypeBadge(type: string) {
  switch (type) {
    case 'Hot': return 'bg-red-50 text-red-700 border-red-200'
    case 'Warm': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Cold': return 'bg-blue-50 text-blue-700 border-blue-200'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

export function generateVCard(lead: {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  designation?: string | null
  website?: string | null
  address?: string | null
}) {
  const parts = lead.name.trim().split(' ')
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${lead.name}`,
    `N:${lastName};${firstName};;;`,
  ]

  if (lead.company) lines.push(`ORG:${lead.company}`)
  if (lead.designation) lines.push(`TITLE:${lead.designation}`)

  if (lead.phone) {
    lead.phone.split(/[,;\n|]/).map(p => p.trim()).filter(Boolean)
      .forEach(p => lines.push(`TEL;TYPE=WORK,VOICE:${p}`))
  }
  if (lead.email) {
    lead.email.split(/[,;\n|]/).map(e => e.trim()).filter(Boolean)
      .forEach(e => lines.push(`EMAIL;TYPE=WORK:${e}`))
  }
  if (lead.website) lines.push(`URL:${lead.website}`)
  if (lead.address) lines.push(`ADR;TYPE=WORK:;;${lead.address};;;;`)

  lines.push('END:VCARD')
  return lines.join('\r\n')
}
