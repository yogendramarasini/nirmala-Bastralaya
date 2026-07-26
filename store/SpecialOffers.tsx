import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import EditorialImage from './EditorialImage'

export default function SpecialOffers() {
  return (
    <section className="grid md:grid-cols-2 bg-[#64101d]">
      <article className="relative min-h-[360px] overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-[url('/images/editorial/hero-saree.webp')] bg-cover bg-[75%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#64101d]/95 via-[#64101d]/78 to-transparent" />
        <div className="relative z-10 p-10 md:p-16 max-w-md text-[#fff4df]">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#deb96e] mb-3">The Saree Collection</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-none mb-5">Tradition, woven beautifully.</h2>
          <Link href="/shop?category=sarees" className="editorial-light-button">Discover <ArrowRight size={14} /></Link>
        </div>
      </article>

      <article className="relative min-h-[360px] overflow-hidden flex items-center">
        <EditorialImage panel="coatpants" label="Premium formal coat-pant collection" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3d080f]/92 via-[#3d080f]/66 to-transparent" />
        <div className="relative z-10 p-10 md:p-16 max-w-md text-[#fff4df]">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#deb96e] mb-3">The Formal Collection</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-none mb-5">Tailored confidence for every occasion.</h2>
          <Link href="/shop?category=coat-pants" className="editorial-light-button">Discover <ArrowRight size={14} /></Link>
        </div>
      </article>
    </section>
  )
}
