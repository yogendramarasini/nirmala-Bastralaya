'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sita Sharma',
    location: 'Tamghas, Gulmi',
    rating: 5,
    text: 'I have been buying sarees from Nirmala Vastralaya for over 10 years. The quality is always excellent and the prices are fair. Highly recommended!',
  },
  {
    name: 'Ram Prasad Poudel',
    location: 'Musikot, Gulmi',
    rating: 5,
    text: 'Bought my daughter\'s wedding dress here. The collection is stunning and the owner was very helpful in selecting the right outfit. Best store in Gulmi!',
  },
  {
    name: 'Kamala Adhikari',
    location: 'Resunga, Gulmi',
    rating: 5,
    text: 'Amazing selection of traditional clothing. I always find exactly what I need for festivals and ceremonies. Trusted store for our whole family.',
  },
  {
    name: 'Bikash Thapa',
    location: 'Arghakhanchi',
    rating: 5,
    text: 'Great quality products at reasonable prices. The quilts and bedding are especially good. Will definitely keep shopping here.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-surface">
      <div className="container-custom">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Customer Stories</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
            >
              <Quote size={28} className="text-gold/30 mb-4" />
              <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="fill-gold text-gold" />
                ))}
              </div>
              <div>
                <p className="font-semibold text-sm text-primary">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
