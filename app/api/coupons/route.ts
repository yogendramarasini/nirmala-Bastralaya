import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { couponSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { isAdminSession, rejectInvalidOrigin } from '@/lib/security'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ coupons: coupons.map((c) => ({ ...c, value: Number(c.value), minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null })) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = couponSchema.parse(await request.json())
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        minOrderAmount: body.minOrderAmount || null,
        maxUses: body.maxUses || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ZodError) return NextResponse.json({ error: 'Invalid coupon details' }, { status: 400 })
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
