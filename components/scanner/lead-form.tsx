'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { RotateCcw, Save, MessageSquare, User, Building2, Mail, Phone, Globe, MapPin, Briefcase, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/db/schema'

const LEAD_TYPES = [
  {
    value: 'Hot',
    label: 'Hot',
    icon: '🔥',
    description: 'Ready to buy',
    activeClass: 'border-red-500 bg-gradient-to-br from-red-50 to-red-100/50 text-red-700 shadow-md shadow-red-500/20 ring-2 ring-red-500/40',
    inactiveClass: 'border-strata-line bg-white text-strata-muted hover:border-red-300 hover:bg-red-50/40',
  },
  {
    value: 'Warm',
    label: 'Warm',
    icon: '☀️',
    description: 'Interested',
    activeClass: 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-700 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/40',
    inactiveClass: 'border-strata-line bg-white text-strata-muted hover:border-amber-300 hover:bg-amber-50/40',
  },
  {
    value: 'Cold',
    label: 'Cold',
    icon: '❄️',
    description: 'Just info',
    activeClass: 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/40',
    inactiveClass: 'border-strata-line bg-white text-strata-muted hover:border-blue-300 hover:bg-blue-50/40',
  },
]

export interface LeadFormData {
  name: string
  email: string
  phone: string
  company: string
  designation: string
  website: string
  address: string
  salesComments: string
  leadType: string
  eventId: string
}

interface LeadFormProps {
  data: LeadFormData
  events: Event[]
  onSave: (data: LeadFormData) => Promise<void>
  onScanAnother: () => void
  saving: boolean
}

export function LeadForm({ data, events, onSave, onScanAnother, saving }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>(data)

  const set = (key: keyof LeadFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }))

  const setLeadType = (value: string) => setForm(f => ({ ...f, leadType: value }))

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Full name is required.')
      return
    }
    if (!form.salesComments.trim()) {
      toast.error('Sales comments are required.')
      return
    }
    onSave(form)
  }

  return (
    <div className="space-y-6">
      {/* Lead temperature */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-strata-blue">
            Lead Temperature *
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-strata-muted">
            Required
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {LEAD_TYPES.map(type => {
            const active = form.leadType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setLeadType(type.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-4 text-sm font-bold transition-all active:scale-[0.97]',
                  active ? type.activeClass : type.inactiveClass
                )}
              >
                <span className="text-3xl leading-none">{type.icon}</span>
                <span className="text-base">{type.label}</span>
                <span className={cn('text-[10px] font-medium uppercase tracking-wider', active ? '' : 'text-strata-muted/70')}>
                  {type.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contact details section */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-strata-blue">
          Contact Details
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Full name *" icon={<User size={15} />} value={form.name} onChange={set('name')} placeholder="John Smith" />
          <Input label="Company" icon={<Building2 size={15} />} value={form.company} onChange={set('company')} placeholder="Acme Corp" />
          <Input label="Designation" icon={<Briefcase size={15} />} value={form.designation} onChange={set('designation')} placeholder="CEO" />
          <Input label="Email" type="email" icon={<Mail size={15} />} value={form.email} onChange={set('email')} placeholder="john@acme.com" />
          <Input label="Phone" type="tel" icon={<Phone size={15} />} value={form.phone} onChange={set('phone')} placeholder="+61 400 000 000" />
          <Input label="Website" type="url" icon={<Globe size={15} />} value={form.website} onChange={set('website')} placeholder="https://acme.com" />
        </div>
        <div className="mt-4">
          <Input label="Address" icon={<MapPin size={15} />} value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" />
        </div>
      </div>

      {/* Event */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-strata-blue">
          Event
        </p>
        <Select icon={<Calendar size={15} />} value={form.eventId} onChange={set('eventId')}>
          <option value="general">No event</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </Select>
      </div>

      {/* Sales comments — required */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-strata-blue">
            Sales Comments *
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-strata-muted">
            Required
          </span>
        </div>
        <Textarea
          icon={<MessageSquare size={15} />}
          value={form.salesComments}
          onChange={set('salesComments')}
          rows={3}
          placeholder="Conversation context, follow-up plan, products discussed..."
          required
        />
        <p className="mt-1.5 text-[11px] text-strata-muted">
          Add context so your team can pick up the conversation later.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-strata-line pt-5 sm:flex-row">
        <Button onClick={handleSubmit} loading={saving} size="lg" className="flex-1">
          <Save size={17} />
          Save lead
        </Button>
        <Button variant="outline" onClick={onScanAnother} disabled={saving} size="lg" className="sm:w-auto">
          <RotateCcw size={17} />
          Scan another
        </Button>
      </div>
    </div>
  )
}
