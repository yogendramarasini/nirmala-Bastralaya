import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { productImagesSchema } from '@/lib/validations'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'
import { ZodError } from 'zod'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { images } = productImagesSchema.parse(await request.json())

    // Delete existing images
    await prisma.productImage.deleteMany({ where: { productId: id } })

    // Create new images
    if (images && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url: string, i: number) => ({
          productId: id,
          url,
          sortOrder: i,
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid product images' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update images' }, { status: 500 })
  }
}
