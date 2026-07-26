'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Package, Users, TrendingUp, AlertTriangle,
  Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      sub: `${formatPrice(stats?.monthRevenue || 0)} this month`,
      icon: TrendingUp,
      growth: stats?.revenueGrowth,
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      sub: `${stats?.monthOrders || 0} this month`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Products',
      value: stats?.totalProducts || 0,
      sub: 'In inventory',
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Customers',
      value: stats?.totalCustomers || 0,
      sub: 'Total registered',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
              {card.growth !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${card.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {card.growth >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(card.growth)}%
                </span>
              )}
            </div>
            <div className="text-xl font-bold text-primary">{card.value}</div>
            <div className="text-xs text-gray-400 mt-1">{card.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-primary">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-gold hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">No orders yet</p>
            ) : (
              stats?.recentOrders?.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.customer?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary">{formatPrice(order.total)}</p>
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Low Stock + Pending */}
        <div className="space-y-4">
          {/* Pending Orders Alert */}
          {stats?.pendingOrders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">Pending Orders</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingOrders}</p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting confirmation</p>
              <Link href="/admin/orders?status=PENDING" className="text-xs text-yellow-700 font-medium hover:underline mt-2 block">
                Review now →
              </Link>
            </div>
          )}

          {/* Low Stock */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <AlertTriangle size={15} className="text-orange-500" />
              <h2 className="font-semibold text-primary text-sm">Low Stock</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.lowStockProducts?.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-6">All products well stocked</p>
              ) : (
                stats?.lowStockProducts?.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-xs text-primary line-clamp-1">{product.name}</p>
                    <span className={`text-xs font-bold ml-2 shrink-0 ${product.quantity === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                      {product.quantity === 0 ? 'Out' : `${product.quantity} left`}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
