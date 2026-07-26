import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { couponValidationSchema } from '@/lib/validations'
import { enforcePublicRateLimit, rejectInvalidOrigin } from '@/lib/security'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const rateLimit = await enforcePublicRateLimit('coupon', request, 30, 15 * 60 * 1000)
    if (rateLimit) return rateLimit
    const { code, orderAmount } = couponValidationSchema.parse(await request.json())

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        error: `Minimum order amount of NPR ${Number(coupon.minOrderAmount).toLocaleString()} required`,
      }, { status: 400 })
    }

    let discount = 0
    if (coupon.type === 'PERCENTAGE') {
      discount = (orderAmount * Number(coupon.value)) / 100
    } else {
      discount = Number(coupon.value)
    }

    return NextResponse.json({
      discount: Math.min(discount, orderAmount),
      type: coupon.type,
      value: Number(coupon.value),
      code: coupon.code,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid coupon request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
