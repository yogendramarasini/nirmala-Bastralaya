import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newsletterSchema } from '@/lib/validations'
import { enforcePublicRateLimit, rejectInvalidOrigin } from '@/lib/security'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const rateLimit = await enforcePublicRateLimit('newsletter', request, 5, 60 * 60 * 1000)
    if (rateLimit) return rateLimit
    const { email } = newsletterSchema.parse(await request.json())

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
