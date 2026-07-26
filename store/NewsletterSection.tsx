'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setDone(true)
        setEmail('')
        toast.success('Thank you for subscribing!')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-surface border-t border-gray-100">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 mb-6">
            <Mail size={24} className="text-gold" />
          </div>
          <p className="section-label mb-3">Stay Updated</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Get Exclusive Offers
          </h2>
          <p className="text-gray-500 text-base mb-8">
            Subscribe to our newsletter and be the first to know about new arrivals, special discounts, 
            and seasonal collections.
          </p>

          {done ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gold/10 border border-gold/30 rounded-lg px-8 py-6"
            >
              <p className="text-primary font-semibold text-lg">You're subscribed! 🎉</p>
              <p className="text-gray-500 text-sm mt-1">We'll keep you updated with the best deals.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary transition-colors rounded"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-5 py-3 shrink-0 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </span>
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>
          )}
          <p className="text-xs text-gray-400 mt-4">No spam. Unsubscribe at any time.</p>
        </motion.div>
      </div>
    </section>
  )
}
