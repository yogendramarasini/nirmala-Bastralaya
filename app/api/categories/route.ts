import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'
import { generateSlug } from '@/lib/utils'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ categories })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const data = categorySchema.parse(body)
    const slug = generateSlug(data.name)

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        sortOrder: data.sortOrder,
        image: data.image,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid category details' }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
