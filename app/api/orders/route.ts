import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { sendOrderConfirmation, sendAdminOrderAlert } from '@/lib/email'
import { orderSchema } from '@/lib/validations'
import { OrderStatus, Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import {
  enforcePublicRateLimit,
  isAdminSession,
  rejectInvalidOrigin,
} from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || '20', 10) || 20))
    const status = searchParams.get('status') || ''
    const search = (searchParams.get('search') || '').slice(0, 100)

    const where: Prisma.OrderWhereInput = {}
    if (Object.values(OrderStatus).includes(status as OrderStatus)) where.status = status as OrderStatus
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: true,
          items: { include: { product: { include: { images: { take: 1 } } } } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        discountAmount: Number(o.discountAmount),
        shippingAmount: Number(o.shippingAmount),
        total: Number(o.total),
        items: o.items.map((i) => ({
          ...i,
          price: Number(i.price),
          total: Number(i.total),
          product: { ...i.product, price: Number(i.product.price), salePrice: i.product.salePrice ? Number(i.product.salePrice) : null },
        })),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const rateLimit = await enforcePublicRateLimit('orders', request, 10, 60 * 60 * 1000)
    if (rateLimit) return rateLimit
    const data = orderSchema.parse(await request.json())
    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: data.items.map((item) => item.productId) }, status: 'ACTIVE' },
      })
      if (products.length !== data.items.length) throw new Error('PRODUCT_UNAVAILABLE')

      const productsById = new Map<string, (typeof products)[number]>(
        products.map((product) => [product.id, product]),
      )
      const orderItems = data.items.map((item) => {
        const product = productsById.get(item.productId)
        if (!product) throw new Error('PRODUCT_UNAVAILABLE')
        if (product.quantity < item.quantity) throw new Error('INSUFFICIENT_STOCK')
        const price = Number(product.salePrice ?? product.price)
        return { productId: product.id, quantity: item.quantity, price, total: price * item.quantity }
      })

      const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.total, 0) * 100) / 100
      let discountAmount = 0
      let appliedCoupon: string | null = null

      if (data.couponCode) {
        const coupon = await tx.coupon.findFirst({
          where: {
            code: data.couponCode,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        })
        if (!coupon || (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)) {
          throw new Error('INVALID_COUPON')
        }
        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
          throw new Error('COUPON_MINIMUM_NOT_MET')
        }

        discountAmount = coupon.type === 'PERCENTAGE'
          ? subtotal * Math.min(Number(coupon.value), 100) / 100
          : Number(coupon.value)
        discountAmount = Math.round(Math.min(discountAmount, subtotal) * 100) / 100

        const couponUpdate = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            ...(coupon.maxUses !== null ? { usedCount: { lt: coupon.maxUses } } : {}),
          },
          data: { usedCount: { increment: 1 } },
        })
        if (couponUpdate.count !== 1) throw new Error('INVALID_COUPON')
        appliedCoupon = coupon.code
      }

      let dbCustomer = await tx.customer.findFirst({ where: { email: data.customer.email } })
      if (dbCustomer) {
        dbCustomer = await tx.customer.update({
          where: { id: dbCustomer.id },
          data: { name: data.customer.name, phone: data.customer.phone, address: data.customer.address },
        })
      } else {
        dbCustomer = await tx.customer.create({
          data: {
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone,
            address: data.customer.address,
          },
        })
      }

      for (const item of orderItems) {
        const stockUpdate = await tx.product.updateMany({
          where: { id: item.productId, status: 'ACTIVE', quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        })
        if (stockUpdate.count !== 1) throw new Error('INSUFFICIENT_STOCK')
      }

      const orderNumber = generateOrderNumber()
      const total = Math.round(Math.max(0, subtotal - discountAmount) * 100) / 100
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: dbCustomer.id,
          paymentMethod: data.paymentMethod,
          paymentProof: data.paymentProof || null,
          subtotal,
          discountAmount,
          shippingAmount: 0,
          total,
          couponCode: appliedCoupon,
          notes: data.notes || null,
          items: { create: orderItems },
        },
        include: { customer: true, items: { include: { product: true } } },
      })

      return { order, orderNumber, total }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5_000,
      timeout: 10_000,
    })

    // Send emails (non-blocking)
    try {
      await sendOrderConfirmation({
        orderNumber: result.orderNumber,
        customerName: data.customer.name,
        customerEmail: data.customer.email,
        items: result.order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        total: result.total,
        paymentMethod: data.paymentMethod.replace(/_/g, ' '),
        address: data.customer.address,
      })
      await sendAdminOrderAlert({
        orderNumber: result.orderNumber,
        customerName: data.customer.name,
        customerPhone: data.customer.phone,
        total: result.total,
        paymentMethod: data.paymentMethod.replace(/_/g, ' '),
      })
    } catch (emailError) {
      console.error('Email send failed:', emailError)
    }

    return NextResponse.json({ orderNumber: result.orderNumber, orderId: result.order.id }, { status: 201 })
  } catch (error) {
    console.error('Order POST error:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid order details' }, { status: 400 })
    }
    if (error instanceof Error) {
      if (error.message === 'PRODUCT_UNAVAILABLE') {
        return NextResponse.json({ error: 'A product is no longer available' }, { status: 409 })
      }
      if (error.message === 'INSUFFICIENT_STOCK') {
        return NextResponse.json({ error: 'A product does not have enough stock' }, { status: 409 })
      }
      if (error.message === 'INVALID_COUPON' || error.message === 'COUPON_MINIMUM_NOT_MET') {
        return NextResponse.json({ error: 'Coupon is invalid for this order' }, { status: 400 })
      }
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
