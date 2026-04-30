'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/scanner/image-upload'
import { LeadForm, type LeadFormData } from '@/components/scanner/lead-form'
import { Button } from '@/components/ui/button'
import type { Event } from '@/lib/db/schema'
import {
  ScanLine,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Check,
  Calendar,
  MapPin,
  Repeat,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 'capture' | 'scanning' | 'review' | 'saved'

const EMPTY_FORM: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  designation: '',
  website: '',
  address: '',
  salesComments: '',
  leadType: 'Warm',
  eventId: 'general',
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'capture', label: 'Capture' },
  { id: 'scanning', label: 'Scan' },
  { id: 'review', label: 'Review' },
  { id: 'saved', label: 'Saved' },
]

interface ScanClientProps {
  events: Event[]
  activeEventId: string
  activeEvent: Event | null
}

export function ScanClient({ events, activeEventId, activeEvent }: ScanClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('capture')
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [formData, setFormData] = useState<LeadFormData>({ ...EMPTY_FORM, eventId: activeEventId })
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [changingEvent, setChangingEvent] = useState(false)

  const handleScan = async () => {
    if (!frontImage) {
      toast.error('Please upload the front of the card.')
      return
    }
    setStep('scanning')
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontImage, backImage }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setFormData({ ...EMPTY_FORM, ...data, eventId: activeEventId, leadType: 'Warm' })
      setStep('review')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scan failed. Please try again.')
      setStep('capture')
    }
  }

  const handleSave = async (data: LeadFormData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.isDuplicate) {
          toast.error('A lead with this email already exists.')
        } else {
          throw new Error(json.error)
        }
        return
      }
      setSavedId(json.id)
      setStep('saved')
      toast.success('Lead saved successfully.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save lead.')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setStep('capture')
    setFrontImage(null)
    setBackImage(null)
    setFormData({ ...EMPTY_FORM, eventId: activeEventId })
    setSavedId(null)
  }

  const changeEvent = async () => {
    setChangingEvent(true)
    try {
      await fetch('/api/active-event', { method: 'DELETE' })
      router.refresh()
    } catch {
      toast.error('Failed to change event')
      setChangingEvent(false)
    }
  }

  const stepIdx = STEPS.findIndex(s => s.id === step)
  const isGeneral = activeEventId === 'general' || !activeEvent

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Active event chip — sleek, top */}
      <div className="sticky top-0 z-10 -mx-3 sm:mx-0">
        <div
          className={cn(
            'flex items-center gap-3 border-b border-strata-line bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md',
            'sm:rounded-2xl sm:border',
            !isGeneral && 'border-strata-blue/20'
          )}
        >
          <div
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
              isGeneral
                ? 'bg-strata-bg text-strata-muted'
                : 'bg-gradient-to-br from-strata-blue to-strata-blue-dark text-white shadow-md shadow-strata-blue/30'
            )}
          >
            <Calendar size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-strata-muted">
              Active event
            </p>
            <p className="truncate text-sm font-bold text-strata-ink">
              {isGeneral ? 'No specific event' : activeEvent.name}
            </p>
            {!isGeneral && activeEvent.location && (
              <p className="flex items-center gap-1 truncate text-[11px] text-strata-muted">
                <MapPin size={10} />
                {activeEvent.location}
              </p>
            )}
          </div>
          <button
            onClick={changeEvent}
            disabled={changingEvent}
            className="shrink-0 rounded-full border border-strata-line bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-strata-blue transition-all hover:border-strata-blue hover:bg-strata-blue hover:text-white disabled:opacity-50"
          >
            {changingEvent ? <Loader2 size={12} className="animate-spin" /> : 'Switch'}
          </button>
        </div>
      </div>

      {/* Modern progress bar — line aligned with circle centers */}
      <div className="px-2 pt-1">
        <div className="relative">
          {/* Track lives between the centers of the first and last circles
              Circle is h-10 (40px) so half-width = 20px → inset 20px on each side
              Track sits at top: 20px (circle vertical center) */}
          <div className="absolute left-5 right-5 top-5 h-[3px] -translate-y-1/2 rounded-full bg-strata-line" />
          <div
            className="absolute left-5 top-5 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-strata-green to-strata-blue transition-all duration-500"
            style={{
              width:
                stepIdx === 0
                  ? '0px'
                  : `calc((100% - 2.5rem) * ${stepIdx / (STEPS.length - 1)})`,
            }}
          />

          <div className="relative flex items-start justify-between">
            {STEPS.map((s, i) => {
              const complete = i < stepIdx
              const active = i === stepIdx
              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'relative z-10 grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition-all duration-300',
                      complete && 'bg-strata-green text-white shadow-md shadow-strata-green/30',
                      active &&
                        'scale-110 bg-gradient-to-br from-strata-blue to-strata-blue-dark text-white shadow-lg shadow-strata-blue/40 ring-4 ring-strata-blue/15',
                      !complete && !active && 'bg-white text-strata-muted/80 ring-2 ring-strata-line'
                    )}
                  >
                    {complete ? <Check size={16} /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-[0.12em] transition-colors',
                      active ? 'text-strata-blue' : complete ? 'text-strata-green' : 'text-strata-muted'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CAPTURE */}
      {step === 'capture' && (
        <div className="overflow-hidden rounded-3xl border border-strata-line bg-white shadow-card">
          <div className="border-b border-strata-line bg-gradient-to-br from-strata-blue/5 via-white to-strata-green/5 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-strata-blue to-strata-blue-dark text-white shadow-md shadow-strata-blue/25">
                <ScanLine size={20} />
              </div>
              <div>
                <h2 className="font-heading text-xl text-strata-blue">Scan the card</h2>
                <p className="mt-0.5 text-xs text-strata-muted">
                  Capture the front. Back is optional but improves accuracy.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <ImageUpload label="Card front" required value={frontImage} onChange={setFrontImage} />
              <ImageUpload label="Card back" value={backImage} onChange={setBackImage} />
            </div>
            <Button onClick={handleScan} disabled={!frontImage} size="lg" className="w-full">
              <Sparkles size={17} />
              Scan card
              <ChevronRight size={17} />
            </Button>
            <p className="text-center text-[11px] text-strata-muted">
              AI will read the card and pre-fill the lead details.
            </p>
          </div>
        </div>
      )}

      {/* SCANNING */}
      {step === 'scanning' && (
        <div className="overflow-hidden rounded-3xl border border-strata-line bg-gradient-to-br from-white via-strata-blue/5 to-strata-green/5 shadow-card">
          <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 -m-3 animate-ping rounded-3xl bg-strata-blue/20" />
              <div className="relative grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-strata-blue to-strata-blue-dark text-white shadow-xl shadow-strata-blue/40">
                <ScanLine size={42} />
              </div>
              <div className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-strata-green text-white shadow-md">
                <Loader2 size={18} className="animate-spin" />
              </div>
            </div>
            <div>
              <p className="font-heading text-2xl text-strata-blue">Reading card...</p>
              <p className="mt-1 text-sm text-strata-muted">
                Extracting name, email, phone, company, and more.
              </p>
            </div>
            <div className="flex w-full max-w-xs items-center gap-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-strata-line"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-strata-green to-strata-blue"
                    style={{
                      animation: `scanProgress 1.4s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                </div>
              ))}
            </div>
            <style jsx>{`
              @keyframes scanProgress {
                0%, 100% { width: 20%; opacity: 0.5; }
                50% { width: 100%; opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* REVIEW */}
      {step === 'review' && (
        <div className="overflow-hidden rounded-3xl border border-strata-line bg-white shadow-card">
          <div className="border-b border-strata-line bg-gradient-to-br from-strata-green/10 via-white to-strata-blue/5 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-strata-green to-emerald-600 text-white shadow-md shadow-strata-green/25">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="font-heading text-xl text-strata-blue">Review & save</h2>
                <p className="mt-0.5 text-xs text-strata-muted">
                  Pick lead temperature, then confirm the details.
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <LeadForm
              data={formData}
              events={events}
              onSave={handleSave}
              onScanAnother={reset}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* SAVED */}
      {step === 'saved' && (
        <div className="overflow-hidden rounded-3xl border border-strata-line bg-white shadow-card">
          <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 -m-2 rounded-full bg-strata-green/15 blur-xl" />
              <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-strata-green to-emerald-600 text-white shadow-xl shadow-strata-green/30">
                <CheckCircle2 size={42} />
              </div>
            </div>
            <div>
              <p className="font-heading text-3xl text-strata-blue">Lead saved</p>
              <p className="mt-1.5 text-sm text-strata-muted">
                <span className="font-semibold text-strata-ink">{formData.name}</span>
                {!isGeneral ? (
                  <> added to <span className="font-semibold text-strata-ink">{activeEvent.name}</span>.</>
                ) : (
                  <> added to your leads.</>
                )}
              </p>
            </div>
            <Button onClick={reset} size="lg" className="w-full max-w-sm">
              <Repeat size={17} />
              Save & scan another
            </Button>
            <div className="grid w-full max-w-sm grid-cols-2 gap-2">
              {savedId && (
                <Button onClick={() => router.push(`/leads/${savedId}`)} variant="outline" size="sm">
                  View lead
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => router.push('/leads')}>
                All leads
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
