'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2, Clock } from 'lucide-react'
import { contactSchema, type ContactData } from '@/lib/validations'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSent(true)
        reset()
        toast.success('Message sent successfully!')
      } else {
        toast.error('Failed to send message. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-surface border-b border-gray-100 py-14">
        <div className="container-custom text-center">
          <p className="section-label mb-3">Get In Touch</p>
          <h1 className="font-display text-4xl font-bold text-primary mb-3">Contact Us</h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            We're always happy to hear from you. Reach out for orders, queries, or just to say hello.
          </p>
        </div>
      </section>

      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-primary mb-8">Contact Information</h2>
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-gold" />
                </div>
                <div>
                  <p className="font-medium text-primary text-sm mb-1">Store Address</p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Tamghas, Resunga Municipality<br />
                    Gulmi District, Lumbini Province<br />
                    Nepal
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-gold" />
                </div>
                <div>
                  <p className="font-medium text-primary text-sm mb-1">Phone</p>
                  <a href="tel:079-520658" className="text-gray-500 text-sm hover:text-gold transition-colors">079-520658</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-gold" />
                </div>
                <div>
                  <p className="font-medium text-primary text-sm mb-1">Email</p>
                  <a href="mailto:nirmalavastralya@gmail.com" className="text-gray-500 text-sm hover:text-gold transition-colors break-all">
                    nirmalavastralya@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <MessageCircle size={20} className="text-gold" />
                </div>
                <div>
                  <p className="font-medium text-primary text-sm mb-1">WhatsApp</p>
                  <a
                    href="https://wa.me/977079520658"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:text-gold transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-gold" />
                </div>
                <div>
                  <p className="font-medium text-primary text-sm mb-1">Business Hours</p>
                  <p className="text-gray-500 text-sm">Sunday – Friday: 9:00 AM – 7:00 PM</p>
                  <p className="text-gray-500 text-sm">Saturday: 10:00 AM – 5:00 PM</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden border border-gray-100">
              <iframe
                title="Nirmala Bastralaya Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.0!2d83.2833!3d28.1169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDA3JzAxLjAiTiA4M8KwMTcnMDAuMCJF!5e0!3m2!1sen!2snp!4v1234567890"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-primary mb-8">Send a Message</h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-green-50 rounded-lg border border-green-100">
                <CheckCircle2 size={48} className="text-green-500 mb-4" />
                <h3 className="font-semibold text-primary text-lg mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm mb-6">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn-outline text-sm">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input
                      {...register('name')}
                      placeholder="Your name"
                      className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                    <input
                      {...register('phone')}
                      placeholder="Optional"
                      className="w-full border border-gray-200 px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="your@email.com"
                    className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Subject *</label>
                  <input
                    {...register('subject')}
                    placeholder="How can we help?"
                    className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors ${errors.subject ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Message *</label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Tell us more..."
                    className={`w-full border px-4 py-3 text-sm rounded outline-none focus:border-primary transition-colors resize-none ${errors.message ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
