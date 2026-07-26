import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'

const ALLOWED_SETTINGS = new Set([
  'store_name', 'store_phone', 'store_whatsapp', 'store_email', 'store_address',
  'social_facebook', 'social_instagram', 'qr_FONEPAY', 'qr_ESEWA', 'qr_KHALTI',
])

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.setting.findMany()
    const map: Record<string, string> = {}
    settings.forEach((s) => { map[s.key] = s.value })
    if (!map.qr_FONEPAY) {
      map.qr_FONEPAY = '/images/payment/fonepay-qr.png'
    }
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 })
    }

    const entries = Object.entries(body)
    if (entries.some(([key, value]) => !ALLOWED_SETTINGS.has(key) || typeof value !== 'string' || value.length > 1000)) {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 })
    }

    // Upsert all settings
    await Promise.all(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
