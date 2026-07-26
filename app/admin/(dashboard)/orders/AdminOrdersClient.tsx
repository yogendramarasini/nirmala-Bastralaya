'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Eye, ChevronDown, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

export default function AdminOrdersClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const page = Number(searchParams.get('page') || 1)
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    router.push(`/admin/orders?${p.toString()}`)
  }

  const fetchOrders = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20', ...(status && { status }), ...(search && { search }) })
    const res = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [page, status, search])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success('Order status updated')
    } catch { toast.error('Failed to update status') } finally { setUpdatingId(null) }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} total orders</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search by order # or customer..." value={search} onChange={e => update('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm rounded-lg outline-none focus:border-primary" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => update('status', s)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${status === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Payment', 'Total', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                  <Package size={36} className="mx-auto mb-2 opacity-30" /><p>No orders found</p>
                </td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono font-medium text-primary">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-primary">{order.customer?.name}</p>
                    <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600">{order.paymentMethod?.replace(/_/g, ' ')}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600 border-green-200' : order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-500 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} disabled={updatingId === order.id}
                        className={`text-xs px-2 py-1.5 rounded border font-medium appearance-none pr-6 cursor-pointer disabled:opacity-50 ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="p-1.5 text-gray-400 hover:text-primary rounded transition-colors inline-block">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <button key={i+1} onClick={() => update('page', String(i+1))}
                  className={`w-7 h-7 text-xs rounded ${page === i+1 ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
