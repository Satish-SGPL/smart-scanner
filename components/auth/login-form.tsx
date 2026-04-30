'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/layout/brand-logo'

export function LoginForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)

    const result = await signIn('credentials', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      redirect: false,
    })

    if (result?.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-strata-bg px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <BrandLogo showText={false} imgClassName="h-24 w-auto" />
        </div>

        <div className="overflow-hidden rounded-lg border border-strata-line bg-white shadow-card">
          <div className="bg-strata-blue px-6 py-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Lead workspace</p>
            <h1 className="mt-2 font-heading text-3xl leading-tight">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Sign in to scan cards, manage leads, and keep event follow-ups moving.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-strata-ink">Full name</label>
              <div className="relative">
                <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-strata-muted" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  autoFocus
                  className="min-h-11 w-full rounded-lg border border-strata-line bg-white px-10 py-2 text-sm text-strata-ink shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-strata-blue focus:ring-2 focus:ring-strata-blue/15"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-strata-ink">Email address</label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-strata-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="min-h-11 w-full rounded-lg border border-strata-line bg-white px-10 py-2 text-sm text-strata-ink shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-strata-blue focus:ring-2 focus:ring-strata-blue/15"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Sign in
              <ArrowRight size={17} />
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-strata-muted">
          Copyright {new Date().getFullYear()} Strata. All rights reserved.
        </p>
      </div>
    </div>
  )
}
