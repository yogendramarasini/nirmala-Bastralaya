import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validations'
import { sendContactNotification } from '@/lib/email'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  enforcePublicRateLimit,
  isAdminSession,
  rejectInvalidOrigin,
} from '@/lib/security'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const rateLimit = await enforcePublicRateLimit('contact', request, 5, 60 * 60 * 1000)
    if (rateLimit) return rateLimit
    const body = await request.json()
    const data = contactSchema.parse(body)

    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      },
    })

    // Non-blocking email
    sendContactNotification(data).catch(console.error)

    return NextResponse.json({ success: true, id: message.id }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid contact details' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
