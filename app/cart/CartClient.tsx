'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartClient() {
  const { items, removeItem, updateQuantity, getSubtotal, getTotal, couponCode, couponDiscount, setCoupon, removeCoupon } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const subtotal = getSubtotal()
  const total = getTotal()

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), orderAmount: subtotal }),
      })
      const data = await res.json()
      if (res.ok && data.discount) {
        setCoupon(couponInput.trim().toUpperCase(), data.discount)
        toast.success(`Coupon applied! You saved ${formatPrice(data.discount)}`)
        setCouponInput('')
      } else {
        toast.error(data.error || 'Invalid or expired coupon code')
      }
    } catch {
      toast.error('Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-surface rounded-full mb-6">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-8">Add some products to get started</p>
          <Link href="/shop" className="btn-primary px-8 py-4">Explore Collection</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-surface border-b border-gray-100 py-8">
        <div className="container-custom">
          <h1 className="font-display text-3xl font-bold text-primary">Shopping Cart</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const itemPrice = item.salePrice ?? item.price
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.2 }}
                    className="flex gap-5 p-5 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                    <Link href={`/product/${item.slug}`} className="relative w-24 h-28 shrink-0 bg-gray-50 overflow-hidden rounded">
                      <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover" sizes="96px" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/product/${item.slug}`} className="font-medium text-sm text-primary hover:text-gold transition-colors line-clamp-2 pr-4">
                          {item.name}
                        </Link>
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex items-center border border-gray-200 rounded">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40">
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-primary">{formatPrice(itemPrice * item.quantity)}</p>
                          {item.salePrice && <p className="text-xs text-gray-400">{formatPrice(itemPrice)} each</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-gray-100 rounded-lg p-6 sticky top-24">
              <h2 className="font-semibold text-primary mb-6">Order Summary</h2>
              <div className="mb-5">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Tag size={14} />
                      <span className="font-medium">{couponCode}</span>
                      <span>applied</span>
                    </div>
                    <button onClick={removeCoupon} className="text-green-500 hover:text-green-700"><X size={15} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Coupon code" value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      className="flex-1 border border-gray-200 px-3 py-2 text-sm rounded outline-none focus:border-primary transition-colors" />
                    <button onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()}
                      className="btn-outline text-xs px-3 py-2 rounded disabled:opacity-50">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span><span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span><span className="text-green-600 text-xs">Calculated at checkout</span>
                </div>
                <div className="flex justify-between font-bold text-base text-primary pt-3 border-t border-gray-100">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full mt-6 py-4 text-sm flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-primary transition-colors mt-4">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
