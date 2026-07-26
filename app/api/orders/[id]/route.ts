import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { orderUpdateSchema } from '@/lib/validations'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'
import { ZodError } from 'zod'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
          },
        },
      },
    })

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      ...order,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingAmount: Number(order.shippingAmount),
      total: Number(order.total),
      items: order.items.map((i) => ({
        ...i,
        price: Number(i.price),
        total: Number(i.total),
        product: { ...i.product, price: Number(i.product.price), salePrice: i.product.salePrice ? Number(i.product.salePrice) : null },
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = orderUpdateSchema.parse(await request.json())

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const shippingAmount = body.shippingAmount ?? Number(existing.shippingAmount)
    const total = Math.max(0, Number(existing.subtotal) - Number(existing.discountAmount) + shippingAmount)

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
        ...(body.shippingAmount !== undefined && { shippingAmount, total }),
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid order update' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
