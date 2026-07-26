import type { Metadata } from 'next'
import { CheckCircle2, Target, Eye, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Nirmala Bastralaya — trusted premium clothing & textile store in Tamghas, Gulmi, Nepal since 2002.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container-custom text-center">
          <p className="section-label text-gold mb-3">Our Story</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            About Nirmala Bastralaya
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Two decades of trusted service, quality clothing, and community values.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <div className="font-display text-7xl font-bold text-gold/20 leading-none mb-2">2002</div>
            <h2 className="font-display text-3xl font-bold text-primary">Where It All Began</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-600 text-base leading-relaxed space-y-5">
            <p>
              Nirmala Bastralaya was founded in 2002 in the heart of Tamghas, the district headquarters of Gulmi, Nepal. 
              What began as a small, humble textile shop has grown over two decades into one of the most trusted and 
              beloved clothing destinations in the region.
            </p>
            <p>
              From the very beginning, our mission was simple: to provide quality clothing at fair prices to the 
              families of Gulmi and surrounding districts. We believe that every person — regardless of occasion 
              — deserves to wear something that makes them feel confident and beautiful.
            </p>
            <p>
              Over the years, we have expanded our collection to include a wide range of products: from 
              traditional sarees and Hindu ceremonial clothing to modern everyday fashion, wedding dresses, 
              shoes, bags, and home textiles like quilts and dasana (mattresses).
            </p>
            <p>
              Today, thousands of families across Gulmi and beyond trust Nirmala Bastralaya as their go-to 
              clothing store. Our customers return not just for our products, but for the personal service, 
              genuine care, and community connection that we have built over two generations.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-surface">
        <div className="container-custom">
          <div className="text-center mb-14">
            <p className="section-label mb-3">What Drives Us</p>
            <h2 className="font-display text-3xl font-bold text-primary">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Heart,
                title: 'Community First',
                desc: 'We are rooted in the Gulmi community and are committed to serving our neighbors with integrity and care.',
              },
              {
                icon: CheckCircle2,
                title: 'Quality Guarantee',
                desc: 'Every product we stock is carefully selected for quality. We stand behind everything we sell.',
              },
              {
                icon: Target,
                title: 'Fair Pricing',
                desc: 'We believe quality clothing should be accessible. Our pricing is transparent, honest, and fair for all.',
              },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-lg p-8 text-center border border-gray-100">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-full mb-4">
                  <v.icon size={24} className="text-gold" />
                </div>
                <h3 className="font-semibold text-primary text-lg mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container-custom max-w-4xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="border-l-4 border-gold pl-8">
              <div className="flex items-center gap-2 mb-3">
                <Target size={20} className="text-gold" />
                <h3 className="font-display text-xl font-bold text-primary">Our Mission</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                To provide every customer with premium quality clothing that celebrates their identity — 
                whether traditional or contemporary — at prices that respect their trust. We aim to be 
                the most reliable clothing partner for families across Nepal.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-8">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={20} className="text-primary" />
                <h3 className="font-display text-xl font-bold text-primary">Our Vision</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                To become Nepal's most trusted regional clothing brand — one that honors cultural heritage 
                while embracing modern fashion sensibilities, and to make quality clothing accessible to 
                every household across Gulmi and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-primary">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2002', label: 'Year Founded' },
              { value: '20+', label: 'Years Serving' },
              { value: '50+', label: 'Product Types' },
              { value: '1000s', label: 'Happy Families' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl md:text-4xl font-bold text-gold mb-1">{s.value}</div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
