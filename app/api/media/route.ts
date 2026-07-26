import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mediaSchema } from '@/lib/validations'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ media })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = mediaSchema.parse(await request.json())
    const media = await prisma.media.create({
      data: {
        url: body.url,
        filename: body.filename,
        size: body.size,
        mimeType: body.mimeType,
        type: body.type,
      },
    })
    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid media details' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save media' }, { status: 500 })
  }
}
