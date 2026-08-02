import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import * as OTPAuth from 'otpauth'
import {
  clearAdminLoginFailures,
  getClientAddress,
  isAdminLoginBlocked,
  recordAdminLoginFailure,
} from './security'

const DUMMY_PASSWORD_HASH = '$2b$12$09wm0Cs9vNxwR7m4K0b1O.aRCptUOm45ixai7LS7C3F.AI/hguqH2'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'Authenticator code', type: 'text' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.normalize('NFKC').trim().toLowerCase().slice(0, 254)
        const clientAddress = getClientAddress(request.headers)
        if (await isAdminLoginBlocked(email, clientAddress)) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        const isValid = await bcrypt.compare(
          credentials.password,
          user?.password || DUMMY_PASSWORD_HASH,
        )
        let validOtp = true
        const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim()
        if (user && isValid && totpSecret) {
          try {
            const totp = new OTPAuth.TOTP({
              issuer: 'Nirmala Vastralaya',
              label: user.email,
              algorithm: 'SHA1',
              digits: 6,
              period: 30,
              secret: OTPAuth.Secret.fromBase32(totpSecret),
            })
            validOtp = /^\d{6}$/.test(credentials.otp || '') &&
              totp.validate({ token: credentials.otp || '', window: 1 }) !== null
          } catch {
            validOtp = false
          }
        }

        if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role) || !isValid || !validOtp) {
          await recordAdminLoginFailure(email, clientAddress)
          return null
        }
        await clearAdminLoginFailures(email, clientAddress)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'nirmala-local.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_LOGIN_SUCCESS',
          entity: 'AUTH',
          entityId: user.id,
        },
      })
    },
    async signOut({ token }) {
      await prisma.auditLog.create({
        data: {
          userId: typeof token.id === 'string' ? token.id : null,
          action: 'ADMIN_LOGOUT',
          entity: 'AUTH',
          entityId: typeof token.id === 'string' ? token.id : null,
        },
      })
    },
  },
}
