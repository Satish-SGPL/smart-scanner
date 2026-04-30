import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import './globals.css'

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: { default: 'Strata Scanner', template: '%s | Strata Scanner' },
  description: 'Smart business card scanning and lead management by Strata',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <body className="font-body bg-white text-strata-dark antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
