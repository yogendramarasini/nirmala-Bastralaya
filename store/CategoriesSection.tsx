import Link from 'next/link'
import EditorialImage from './EditorialImage'

const categories = [
  { name: 'Sarees', panel: 'saree' as const, href: '/shop?category=sarees' },
  { name: 'Coat Pants', panel: 'coatpants' as const, href: '/shop?category=coat-pants' },
  { name: 'Bags', panel: 'bags' as const, href: '/shop?category=bags' },
  { name: 'Shoes', panel: 'shoes' as const, href: '/shop?category=shoes' },
]

export default function CategoriesSection() {
  return (
    <section className="py-14 md:py-16 bg-[#fbf1e3]">
      <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {categories.map((category) => (
          <Link key={category.name} href={category.href} className="group text-center">
            <div className="mx-auto w-32 h-32 md:w-44 md:h-44 rounded-full border border-[#b99455] p-1.5 mb-5 transition-transform duration-300 group-hover:-translate-y-1">
              <EditorialImage panel={category.panel} label={category.name} className="w-full h-full rounded-full" />
            </div>
            <h3 className="font-display text-xl font-semibold uppercase tracking-[0.12em] text-[#5d1420]">{category.name}</h3>
            <p className="text-[11px] text-[#785b4d] mt-2">View the collection →</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
