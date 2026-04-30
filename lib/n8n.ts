export interface ScannedCardData {
  name?: string
  email?: string
  phone?: string
  company?: string
  designation?: string
  website?: string
  address?: string
}

export async function scanBusinessCard(
  frontImageBuffer: Buffer,
  backImageBuffer?: Buffer
): Promise<ScannedCardData> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) throw new Error('N8N_WEBHOOK_URL is not configured')

  const formData = new FormData()
  formData.append('front_image', new Blob([new Uint8Array(frontImageBuffer)], { type: 'image/jpeg' }), 'front.jpg')
  if (backImageBuffer) {
    formData.append('back_image', new Blob([new Uint8Array(backImageBuffer)], { type: 'image/jpeg' }), 'back.jpg')
  }

  const response = await fetch(webhookUrl, { method: 'POST', body: formData })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`N8N webhook error ${response.status}: ${text}`)
  }

  const raw = await response.json()
  console.log('[n8n] RAW response:', JSON.stringify(raw, null, 2))

  // N8N can wrap the payload in: array, { json: {...} }, { data: {...} }, or flat
  let data: Record<string, unknown> = Array.isArray(raw) ? raw[0] : raw
  if (data && typeof data === 'object' && 'json' in data && data.json && typeof data.json === 'object') {
    data = data.json as Record<string, unknown>
  }
  if (data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object') {
    data = data.data as Record<string, unknown>
  }
  console.log('[n8n] UNWRAPPED data:', JSON.stringify(data, null, 2))

  // Helper: pick first matching key (case-insensitive) and coerce to string
  const pick = (...keys: string[]): string => {
    for (const k of keys) {
      const v = (data as Record<string, unknown>)[k]
      if (typeof v === 'string' && v.trim()) return v.trim()
      // case-insensitive fallback
      const found = Object.keys(data).find(dk => dk.toLowerCase() === k.toLowerCase())
      if (found) {
        const fv = (data as Record<string, unknown>)[found]
        if (typeof fv === 'string' && fv.trim()) return fv.trim()
        if (Array.isArray(fv) && fv.length && typeof fv[0] === 'string') return fv[0]
      }
    }
    return ''
  }

  // Backward-compat for old flows returning arrays
  const emails = Array.isArray((data as Record<string, unknown>).Emails) ? (data.Emails as string[]) : []
  const phones = Array.isArray((data as Record<string, unknown>).PhoneNumbers)
    ? ((data.PhoneNumbers as Array<{ type?: string; number?: string }>) ?? [])
    : []
  const mobile = phones.find(p => p.type?.toLowerCase() === 'mobile')?.number
  const anyPhone = phones[0]?.number

  const result = {
    name: pick('Name', 'name', 'full_name', 'fullName'),
    email: pick('Email', 'email', 'email_address', 'emailAddress') || emails[0] || '',
    phone: pick('Phone', 'phone', 'phone_number', 'phoneNumber', 'mobile') || mobile || anyPhone || '',
    company: pick('Company', 'CompanyName', 'company', 'organization', 'company_name'),
    designation: pick('Designation', 'designation', 'title', 'job_title', 'position'),
    website: pick('Website', 'website', 'url', 'web'),
    address: pick('Address', 'address', 'location'),
  }
  console.log('[n8n] MAPPED result:', JSON.stringify(result, null, 2))
  return result
}
