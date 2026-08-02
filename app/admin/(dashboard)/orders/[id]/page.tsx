'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Printer, Package } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']
const PAYMENT_STATUS_OPTIONS = ['PENDING','PAID','FAILED','REFUNDED']

export default function AdminOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setOrder(d)
        setStatus(d.status)
        setPaymentStatus(d.paymentStatus)
        setLoading(false)
      })
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus }),
      })
      toast.success('Order updated successfully')
    } catch {
      toast.error('Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) return <div className="animate-pulse"><div className="h-96 bg-white rounded-xl" /></div>
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary">{order.orderNumber}</h1>
            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString('en-NP')}</p>
          </div>
        </div>
        <button onClick={handlePrint} className="btn-outline text-sm px-4 py-2 flex items-center gap-2">
          <Printer size={15} /> Print Invoice
        </button>
      </div>

      {/* Printable Invoice Header */}
      <div className="hidden print:block text-center mb-6">
        <div className="text-2xl font-bold">Nirmala Vastralaya</div>
        <div className="text-sm text-gray-600">Tamghas, Gulmi, Nepal · 079-520658</div>
        <div className="text-lg font-semibold mt-2">INVOICE — {order.orderNumber}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-primary text-sm mb-4 uppercase tracking-wide">Customer</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Name:</span> <span className="text-primary font-medium">{order.customer?.name}</span></p>
            <p><span className="text-gray-400">Phone:</span> <a href={`tel:${order.customer?.phone}`} className="text-primary hover:text-gold">{order.customer?.phone}</a></p>
            <p><span className="text-gray-400">Email:</span> <span className="text-primary break-all">{order.customer?.email}</span></p>
            <p><span className="text-gray-400">Address:</span> <span className="text-primary">{order.customer?.address}</span></p>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-primary text-sm mb-4 uppercase tracking-wide">Payment</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Method:</span> <span className="text-primary">{order.paymentMethod.replace(/_/g, ' ')}</span></p>
            <p><span className="text-gray-400">Status:</span> <span className="font-medium text-primary">{order.paymentStatus}</span></p>
            {order.paymentProof && (
              <a href={order.paymentProof} target="_blank" rel="noreferrer" className="text-gold text-xs hover:underline block">
                View Payment Proof ↗
              </a>
            )}
            {order.couponCode && (
              <p><span className="text-gray-400">Coupon:</span> <span className="text-green-600 font-mono">{order.couponCode}</span></p>
            )}
            {order.notes && (
              <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">{order.notes}</p>
            )}
          </div>
        </div>

        {/* Update Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 print:hidden">
          <h2 className="font-semibold text-primary text-sm mb-4 uppercase tracking-wide">Update Status</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Order Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-lg outline-none focus:border-primary bg-white">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Payment Status</label>
              <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-lg outline-none focus:border-primary bg-white">
                {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-2.5 text-sm disabled:opacity-70">
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-primary">Order Items</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.items?.map((item: any) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-gray-100 rounded overflow-hidden shrink-0 print:hidden">
                      {item.product?.images?.[0] ? (
                        <Image src={getImageUrl(item.product.images[0].url)} alt={item.product.name} fill className="object-cover" sizes="40px" />
                      ) : <Package size={16} className="absolute inset-0 m-auto text-gray-300" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{item.product?.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.product?.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-right text-gray-600">{formatPrice(item.price)}</td>
                <td className="px-5 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                <td className="px-5 py-3 text-sm text-right font-medium text-primary">{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-100 bg-gray-50">
            <tr>
              <td colSpan={3} className="px-5 py-3 text-sm text-right text-gray-600">Subtotal</td>
              <td className="px-5 py-3 text-sm text-right font-medium">{formatPrice(order.subtotal)}</td>
            </tr>
            {order.discountAmount > 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-2 text-sm text-right text-green-600">Discount</td>
                <td className="px-5 py-2 text-sm text-right text-green-600">-{formatPrice(order.discountAmount)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={3} className="px-5 py-3 text-sm font-bold text-right text-primary">TOTAL</td>
              <td className="px-5 py-3 text-base font-bold text-right text-primary">{formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
