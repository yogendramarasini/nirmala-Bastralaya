'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Upload, CreditCard, Truck, Banknote, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { checkoutSchema, type CheckoutData } from '@/lib/validations'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when your order arrives' },
  { value: 'FONEPAY', label: 'Fonepay QR', icon: CreditCard, description: 'Scan and pay, then upload your receipt' },
]

export default function CheckoutClient() {
  const router = useRouter()
  const { items, getSubtotal, getTotal, couponCode, couponDiscount, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [qrImages, setQrImages] = useState<Record<string, string>>({})
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'CASH_ON_DELIVERY' },
  })

  const selectedPayment = watch('paymentMethod')
  const isQrPayment = selectedPayment === 'FONEPAY'

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) router.push('/cart')
  }, [items, router, orderSuccess])

  useEffect(() => {
    fetch('/api/settings/qr-codes')
      .then((r) => r.json())
      .then((d) => setQrImages(d || {}))
      .catch(() => {})
  }, [])

  const onSubmit = async (data: CheckoutData) => {
    if (isQrPayment && !paymentProof) {
      toast.error('Please upload your payment screenshot')
      return
    }
    setLoading(true)
    try {
      let paymentProofUrl = ''
      if (paymentProof) {
        const form = new FormData()
        form.append('file', paymentProof)
        form.append('type', 'payment')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
        const uploadData = await uploadRes.json()
        paymentProofUrl = uploadData.url || ''
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: data.fullName, phone: data.phone, email: data.email, address: data.address },
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          paymentMethod: data.paymentMethod,
          paymentProof: paymentProofUrl,
          couponCode: couponCode || undefined,
          notes: data.notes,
        }),
      })

      const result = await res.json()
      if (res.ok) {
        clearCart()
        setOrderSuccess({ orderNumber: result.orderNumber })
      } else {
        toast.error(result.error || 'Order failed. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-3">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Thank you for shopping at Nirmala Bastralaya.</p>
          <div className="bg-surface rounded-lg px-8 py-5 mb-6 inline-block">
            <p className="text-xs text-gray-400 mb-1">Your Order Number</p>
            <p className="text-xl font-bold text-gold tracking-wide">{orderSuccess.orderNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-8">
            A confirmation email has been sent to you. We'll contact you shortly to confirm your order.
          </p>
          <div className="flex gap-3">
            <button onClick={() => router.push('/')} className="btn-outline flex-1 py-3 text-sm">Go Home</button>
            <button onClick={() => router.push('/shop')} className="btn-primary flex-1 py-3 text-sm">Shop More</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-custom">
          <h1 className="font-display text-3xl font-bold text-primary">Checkout</h1>
        </div>
      </div>

      <div className="container-custom py-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: Customer Info + Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-100">
                <h2 className="font-semibold text-primary text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-primary text-white text-xs rounded-full flex items-center justify-center">1</span>
                  Delivery Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input
                      {...register('fullName')}
                      placeholder="Your full name"
                      className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors ${errors.fullName ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Phone *</label>
                    <input
                      {...register('phone')}
                      placeholder="98XXXXXXXX"
                      className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Email Address *</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Delivery Address *</label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      placeholder="Village / Ward / Municipality, District, Province"
                      className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors resize-none ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Order Notes (Optional)</label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      placeholder="Any special instructions for your order..."
                      className="w-full border border-gray-200 px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-100">
                <h2 className="font-semibold text-primary text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-primary text-white text-xs rounded-full flex items-center justify-center">2</span>
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.value} className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPayment === method.value ? 'border-primary bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" value={method.value} {...register('paymentMethod')} className="accent-primary" />
                      <method.icon size={20} className={selectedPayment === method.value ? 'text-primary' : 'text-gray-400'} />
                      <div>
                        <p className="font-medium text-sm text-primary">{method.label}</p>
                        <p className="text-xs text-gray-400">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* QR Payment Section */}
                <AnimatePresence>
                  {isQrPayment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 overflow-hidden rounded-2xl border border-[#dfc79c] bg-[#fffaf0] shadow-[0_18px_50px_rgba(91,13,27,0.08)]"
                    >
                      <div className="border-b border-[#ead9b9] bg-[#5b0d1b] px-5 py-4 text-center text-white">
                        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#e8c98f]">Secure manual payment</p>
                        <p className="mt-1 font-serif text-xl tracking-wide">Scan to Pay with Fonepay</p>
                      </div>
                      <div className="p-5 sm:p-6">
                        {qrImages[selectedPayment] ? (
                          <>
                            <div className="relative mx-auto aspect-square w-full max-w-[264px] overflow-hidden rounded-xl border-[6px] border-white bg-white shadow-[0_10px_30px_rgba(61,38,18,0.14)] ring-1 ring-[#d3ad68]">
                              <Image
                                src={getImageUrl(qrImages[selectedPayment])}
                                alt="Nirmala Bastralaya Fonepay QR code"
                                fill
                                priority
                                sizes="264px"
                                className="object-contain"
                              />
                            </div>
                            <a
                              href={getImageUrl(qrImages[selectedPayment])}
                              target="_blank"
                              rel="noreferrer"
                              className="mx-auto mt-3 block w-fit text-xs font-semibold text-[#7a1525] underline decoration-[#c79b4c] underline-offset-4"
                            >
                              Open full-size QR
                            </a>
                          </>
                        ) : (
                          <div className="mx-auto flex aspect-square w-full max-w-[264px] items-center justify-center rounded-xl border-2 border-dashed border-[#dfc79c] bg-white text-sm text-[#9c8467]">
                            QR not uploaded
                          </div>
                        )}
                        <div className="mt-5 text-center">
                          <p className="font-serif text-lg text-[#5b0d1b]">Nirmala Bastralaya</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#8b6b3f]">Global IME Bank · Tamghas Branch</p>
                        </div>
                        <div className="mt-4 rounded-xl border border-[#ead9b9] bg-white px-4 py-3 text-center">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#9c8467]">Amount to pay</p>
                          <p className="mt-1 text-xl font-bold text-[#5b0d1b]">{formatPrice(getTotal())}</p>
                        </div>
                        <p className="mt-3 text-center text-xs leading-5 text-[#735c43]">
                          Confirm that your banking app shows <strong>Nirmala Bastralaya</strong> before paying. Then upload the successful payment screenshot below.
                        </p>

                        <div className="mt-5">
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#735c43]">Upload Payment Screenshot *</label>
                          <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${paymentProof ? 'border-green-400 bg-green-50' : 'border-[#d9bd8a] bg-white hover:border-[#7a1525]'}`}>
                            <Upload size={24} className={paymentProof ? 'text-green-500' : 'text-[#b88a44]'} />
                            <p className="mt-2 max-w-full truncate text-sm text-gray-500">
                              {paymentProof ? paymentProof.name : 'Click to upload screenshot'}
                            </p>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                            />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-white rounded-lg p-6 border border-gray-100 sticky top-24">
                <h2 className="font-semibold text-primary mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                  {items.map((item) => {
                    const price = item.salePrice ?? item.price
                    return (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="relative w-12 h-14 shrink-0 bg-gray-50 rounded overflow-hidden">
                          <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover" sizes="48px" />
                          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">{formatPrice(price)} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-primary shrink-0">{formatPrice(price * item.quantity)}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon ({couponCode})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="text-gray-400 text-xs">To be confirmed</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-primary pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6 py-4 text-sm disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Truck size={17} />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  By placing order, you agree to our terms of service.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
