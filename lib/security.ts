import { createHash } from 'node:crypto'
import type { Session } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from './prisma'

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_FAILURES = 5
let lastRateLimitCleanup = 0

export function isAdminSession(session: Session | null): boolean {
  return Boolean(
    session?.user &&
      ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role),
  )
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function rejectInvalidOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')

  if (!origin) {
    if (process.env.NODE_ENV !== 'production' && fetchSite !== 'cross-site') return null
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const allowedOrigins = new Set<string>()
  for (const value of [
    new URL(request.url).origin,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ]) {
    if (!value) continue
    const normalized = normalizeOrigin(value)
    if (normalized) allowedOrigins.add(normalized)
  }

  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin || !allowedOrigins.has(normalizedOrigin)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  return null
}

function readHeader(
  headers: Headers | Record<string, string | string[] | undefined> | undefined,
  name: string,
): string {
  if (!headers) return ''
  if (headers instanceof Headers) return headers.get(name) || ''

  const value = headers[name] ?? headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export function getClientAddress(
  headers: Headers | Record<string, string | string[] | undefined> | undefined,
): string {
  const forwarded = readHeader(headers, 'x-forwarded-for')
  const candidate = forwarded.split(',')[0]?.trim() || readHeader(headers, 'x-real-ip').trim()
  return candidate.slice(0, 64) || 'unknown'
}

function fingerprint(value: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'local-development-only'
  return createHash('sha256').update(`${secret}:${value}`).digest('hex')
}

export async function isAdminLoginBlocked(email: string, clientAddress: string): Promise<boolean> {
  const since = new Date(Date.now() - LOGIN_WINDOW_MS)
  const emailHash = fingerprint(`email:${email}`)
  const addressHash = fingerprint(`address:${clientAddress}`)
  const failures = await prisma.auditLog.count({
    where: {
      action: 'ADMIN_LOGIN_FAILURE',
      createdAt: { gte: since },
      OR: [{ entityId: emailHash }, { ipAddress: addressHash }],
    },
  })
  return failures >= LOGIN_MAX_FAILURES
}

export async function recordAdminLoginFailure(email: string, clientAddress: string): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: 'ADMIN_LOGIN_FAILURE',
      entity: 'AUTH',
      entityId: fingerprint(`email:${email}`),
      ipAddress: fingerprint(`address:${clientAddress}`),
    },
  })
}

export async function clearAdminLoginFailures(email: string, clientAddress: string): Promise<void> {
  const since = new Date(Date.now() - LOGIN_WINDOW_MS)
  await prisma.auditLog.deleteMany({
    where: {
      action: 'ADMIN_LOGIN_FAILURE',
      createdAt: { gte: since },
      OR: [
        { entityId: fingerprint(`email:${email}`) },
        { ipAddress: fingerprint(`address:${clientAddress}`) },
      ],
    },
  })
}

export async function enforcePublicRateLimit(
  scope: string,
  request: Request,
  maxRequests: number,
  windowMs: number,
): Promise<NextResponse | null> {
  if (Date.now() - lastRateLimitCleanup > 24 * 60 * 60 * 1000) {
    lastRateLimitCleanup = Date.now()
    await prisma.auditLog.deleteMany({
      where: {
        action: { startsWith: 'RATE_LIMIT_' },
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    })
  }

  const since = new Date(Date.now() - windowMs)
  const clientHash = fingerprint(`${scope}:${getClientAddress(request.headers)}`)
  const action = `RATE_LIMIT_${scope.toUpperCase()}`

  const attempts = await prisma.auditLog.count({
    where: {
      action,
      ipAddress: clientHash,
      createdAt: { gte: since },
    },
  })

  if (attempts >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(1, Math.ceil(windowMs / 1000))) },
      },
    )
  }

  await prisma.auditLog.create({
    data: { action, entity: 'RATE_LIMIT', ipAddress: clientHash },
  })
  return null
}
