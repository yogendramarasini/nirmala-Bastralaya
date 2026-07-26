'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="store-hero relative min-h-[620px] md:min-h-[690px] overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-[url('/images/editorial/hero-saree.webp')] bg-cover bg-[68%_center] md:bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f8ecd9] via-[#f8ecd9]/95 to-[#f8ecd9]/5 md:via-[#f8ecd9]/78 md:to-transparent" />
      <div className="absolute left-0 top-0 bottom-0 w-3 md:w-5 bg-[#64101d]" />

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-xl ml-3 md:ml-10">
          <p className="section-label mb-5">Since 2002 · Tamghas, Gulmi</p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-[#5d1420] leading-[0.98] tracking-[0.02em] mb-7">
            Timeless Nepali
            <br />
            <span className="text-[#ad7a31]">Elegance &amp; Grace</span>
          </h1>
          <p className="text-[#633c36] text-sm md:text-base leading-7 tracking-[0.04em] mb-9 max-w-md">
            Premium sarees, bridal wear and traditional collections—selected with care for life&apos;s most meaningful occasions.
          </p>
          <Link href="/shop" className="editorial-button">
            Discover the Collection <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#64101d]" />
        <span className="w-2 h-2 rounded-full border border-[#ad7a31]" />
        <span className="w-2 h-2 rounded-full border border-[#ad7a31]" />
      </div>
    </section>
  )
}
