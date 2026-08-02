'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const milestones = [
  { value: 'Rs. 50,000', label: 'Initial investment' },
  { value: '20,000+', label: 'Customers served' },
  { value: 'Since 2002', label: 'Serving with trust' },
]

export default function AboutPreview() {
  return (
    <section className="bg-[#fff8ec] py-20 md:py-28 overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative w-full max-w-lg mx-auto lg:mx-0"
          >
            <div className="absolute -left-5 -top-5 h-full w-full border border-[#b88a3b]" />
            <div className="relative aspect-[2/3] overflow-hidden bg-[#efe0c7]">
              <Image
                src="/images/editorial/gyanraj-founder.webp"
                alt="Gyanraj Marasini, proprietor of Nirmala Vastralaya"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 38vw"
              />
            </div>
            <div className="absolute -bottom-5 right-[-10px] md:right-[-28px] bg-[#64101d] px-6 py-4 text-[#fff8ec] shadow-xl">
              <p className="font-display text-2xl leading-none">Gyanraj Marasini</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#e5c687]">Proprietor &amp; Founder</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="section-label mb-4">A Story Built on Courage</p>
            <h2 className="editorial-heading text-4xl md:text-5xl lg:text-6xl leading-[0.98] mb-7">
              From One Small Shop<br />to Thousands of Families
            </h2>
            <div className="space-y-4 text-[#6f5849] leading-relaxed">
              <p>
                Gyanraj Marasini began with a simple belief: honest service and good clothing could build a better future. He made the difficult decision to leave his studies, invest Rs. 50,000, and open a small shop in Tamghas.
              </p>
              <p>
                He welcomed every visitor personally, listened to what families needed, and treated each sale as the beginning of a relationship. That care turned first-time shoppers into repeat customers—and their recommendations helped Nirmala Vastralaya grow.
              </p>
              <p>
                Today, the business has served more than 20,000 customers. Its success still rests on the same values Gyanraj started with: trust, fair value, quality, and a warm welcome for everyone.
              </p>
            </div>

            <div className="my-8 grid grid-cols-3 border-y border-[#d8bd86] py-6">
              {milestones.map((item) => (
                <div key={item.label} className="px-3 first:pl-0 border-r last:border-r-0 border-[#d8bd86]">
                  <p className="font-display text-xl md:text-2xl text-[#64101d] font-semibold">{item.value}</p>
                  <p className="mt-1 text-[9px] md:text-[10px] uppercase tracking-[0.12em] text-[#8b735e]">{item.label}</p>
                </div>
              ))}
            </div>

            <Link href="/about" className="editorial-outline-button">
              Read Our Full Story <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

        <div className="mt-24 grid lg:grid-cols-2 bg-[#64101d] overflow-hidden">
          <div className="relative min-h-[480px] lg:min-h-[620px]">
            <Image
              src="/images/editorial/nirmala-model-pink.webp"
              alt="Nirmala Vastralaya saree model in a pink saree"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex items-center p-10 md:p-16 lg:p-20 text-[#fff8ec]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#e5c687] mb-4">Tradition, Made Personal</p>
              <h3 className="font-display text-4xl md:text-5xl leading-tight mb-6">Clothing for Every Beautiful Chapter</h3>
              <p className="text-[#ead8c3] leading-relaxed mb-8 max-w-lg">
                From everyday confidence to weddings and celebrations, our collections bring together graceful fabrics, thoughtful details, and the personal service our customers have trusted for years.
              </p>
              <Link href="/shop" className="editorial-light-button">Explore the Collection <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
