import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { accessLogs } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const name = credentials?.name?.trim()
        const email = credentials?.email?.trim().toLowerCase()

        if (!name || !email) return null
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null

        try {
          await db.insert(accessLogs).values({
            id: uuidv4(),
            name,
            email,
            accessedAt: new Date(),
            ipAddress: '',
            userAgent: '',
          })
        } catch {
          // Non-blocking access log.
        }

        return { id: email, name, email }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        name: token.name as string,
        email: token.email as string,
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours; re-login each day.
  },
}
