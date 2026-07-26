import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { categorySchema } from '@/lib/validations'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'
import { ZodError } from 'zod'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = categorySchema.parse(await request.json())

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: generateSlug(body.name),
        description: body.description,
        sortOrder: body.sortOrder,
        image: body.image,
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid category details' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json({ error: 'Cannot delete category with products' }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
