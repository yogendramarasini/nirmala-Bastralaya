import Link from 'next/link'
import EditorialImage from './EditorialImage'

const featured = [
  { name: 'Maroon Banarasi Saree', panel: 'saree' as const, price: 'NPR 8,900' },
  { name: 'Premium Formal Coat Pant', panel: 'coatpants' as const, price: 'NPR 12,500' },
  { name: 'Classic Ladies Handbag', panel: 'bags' as const, price: 'NPR 2,200' },
  { name: 'Formal Leather Shoes', panel: 'shoes' as const, price: 'NPR 3,800' },
]

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-[#fffaf1]">
      <div className="container-custom">
        <div className="editorial-heading mb-12">
          <span />
          <div className="text-center px-7">
            <p className="section-label mb-1">Handpicked for you</p>
            <h2 className="font-display text-4xl font-semibold text-[#5d1420]">Our Favourites</h2>
          </div>
          <span />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
          {featured.map((product) => (
            <Link href="/shop" key={product.name} className="group text-center">
              <div className="relative aspect-square bg-[#f4e3cd] overflow-hidden mb-4">
                <EditorialImage panel={product.panel} label={product.name} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-3 left-0 bg-[#64101d] text-[#f3d79d] text-[9px] uppercase tracking-[0.16em] px-3 py-1.5">New</span>
              </div>
              <h3 className="font-display text-lg md:text-xl font-semibold text-[#5d1420]">{product.name}</h3>
              <p className="text-xs text-[#8a6638] mt-1.5">{product.price}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop" className="editorial-outline-button">View the complete shop</Link>
        </div>
      </div>
    </section>
  )
}
