/**
 * Fire-and-forget POST to the Google Sheets sync webhook (N8N).
 * Never throws — failures are logged but don't break the lead-save flow.
 */

interface SheetsLeadPayload {
  scannedAt: string
  name: string
  company: string
  designation: string
  email: string
  phone: string
  website: string
  address: string
  leadType: string
  eventName: string
  salesComments: string
  savedBy: string
  savedByEmail: string
}

export function syncLeadToSheets(payload: SheetsLeadPayload): void {
  const url = process.env.N8N_SHEETS_WEBHOOK_URL
  if (!url) {
    // Sheets sync is optional — silently skip if not configured
    return
  }

  // Fire and forget — do NOT await. Do NOT throw.
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('[sheets-sync] webhook returned', res.status, text)
      }
    })
    .catch(err => {
      console.error('[sheets-sync] failed:', err instanceof Error ? err.message : err)
    })
}
