import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession } from '@/lib/security'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalOrders,
      monthOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.customer.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.product.findMany({
        where: { quantity: { lte: 5 }, status: 'ACTIVE' },
        take: 10,
        orderBy: { quantity: 'asc' },
        include: { images: { take: 1 } },
      }),
    ])

    const monthRevenueNum = Number(monthRevenue._sum.total || 0)
    const lastMonthRevenueNum = Number(lastMonthRevenue._sum.total || 0)
    const revenueGrowth = lastMonthRevenueNum > 0
      ? ((monthRevenueNum - lastMonthRevenueNum) / lastMonthRevenueNum) * 100
      : 0

    return NextResponse.json({
      totalRevenue: Number(totalRevenue._sum.total || 0),
      monthRevenue: monthRevenueNum,
      revenueGrowth: Math.round(revenueGrowth),
      totalOrders,
      monthOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
      lowStockProducts: lowStockProducts.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
      })),
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
