import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { productSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('limit') || '12', 10) || 12))
    const search = (searchParams.get('search') || '').slice(0, 100)
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured') === 'true'
    const isNew = searchParams.get('new') === 'true'
    const sale = searchParams.get('sale') === 'true'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      category: { isActive: true },
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = { slug: category, isActive: true }
    }

    if (featured) where.isFeatured = true
    if (isNew) where.isNew = true
    if (sale) where.salePrice = { not: null }

    if (minPrice || maxPrice) {
      const priceFilter: Prisma.DecimalFilter = {}
      const parsedMin = Number(minPrice)
      const parsedMax = Number(maxPrice)
      if (minPrice && Number.isFinite(parsedMin) && parsedMin >= 0) priceFilter.gte = parsedMin
      if (maxPrice && Number.isFinite(parsedMax) && parsedMax >= 0) priceFilter.lte = parsedMax
      if (Object.keys(priceFilter).length > 0) where.price = priceFilter
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    else if (sort === 'price-desc') orderBy = { price: 'desc' }
    else if (sort === 'name-asc') orderBy = { name: 'asc' }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: { take: 2, orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const data = productSchema.parse(body)

    const slug = generateSlug(data.name)
    const existingSlug = await prisma.product.findUnique({ where: { slug } })
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        sku: data.sku,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        salePrice: data.salePrice,
        quantity: data.quantity,
        status: data.status,
        isNew: data.isNew,
        isFeatured: data.isFeatured,
        tags: [],
      },
      include: { category: true, images: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid product details' }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
