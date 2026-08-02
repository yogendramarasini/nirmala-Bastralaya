import type { Metadata } from 'next'
import Image from 'next/image'
import StoreShell from '@/components/store/StoreShell'
import { Heart, ShieldCheck, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Story | Nirmala Vastralaya',
  description: 'The story of proprietor Gyanraj Marasini and how Nirmala Vastralaya grew from a Rs. 50,000 investment into a trusted store serving more than 20,000 customers.',
}

const values = [
  { icon: Heart, title: 'Personal Care', text: 'Every customer is welcomed, heard, and helped with the same attention that defined our first small shop.' },
  { icon: ShieldCheck, title: 'Trust & Fair Value', text: 'Honest recommendations, fair prices, and dependable quality keep generations of families coming back.' },
  { icon: Sparkles, title: 'Tradition with Style', text: 'We celebrate Nepali culture while selecting clothing for today’s celebrations, families, and everyday lives.' },
]

export default function AboutPage() {
  return (
    <StoreShell>
      <main className="bg-[#fff8ec]">
        <section className="relative overflow-hidden bg-[#64101d] py-20 md:py-28 text-center text-[#fff8ec]">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #e5c687 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="container-custom relative">
            <div className="mx-auto mb-8 inline-block bg-[#fff8ec] px-5 py-2">
              <Image
                src="/images/editorial/nirmala-logo.webp"
                alt="Nirmala Vastralaya"
                width={310}
                height={155}
                priority
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#e5c687] mb-4">Our Story</p>
            <h1 className="font-display text-5xl md:text-7xl leading-none">A Small Beginning.<br />A Lasting Trust.</h1>
          </div>
        </section>

        <section className="container-custom py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative max-w-xl">
              <div className="absolute -inset-4 border border-[#b88a3b]" />
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image src="/images/editorial/gyanraj-founder.webp" alt="Proprietor Gyanraj Marasini" fill className="object-cover" sizes="(max-width: 1024px) 92vw, 45vw" />
              </div>
            </div>
            <div>
              <p className="section-label mb-4">The Founder</p>
              <h2 className="editorial-heading text-4xl md:text-6xl leading-[1.02] mb-7">Gyanraj Marasini’s Journey</h2>
              <div className="space-y-5 text-[#6f5849] leading-relaxed text-[17px]">
                <p>Gyanraj Marasini did not begin with a large showroom or a famous name. He began with courage. As a young man, he made the difficult decision to leave his studies and build a livelihood through business.</p>
                <p>With an initial investment of Rs. 50,000, he opened a small clothing shop in Tamghas. The shelves were modest, but his promise was strong: offer useful, good-quality clothing at fair prices and treat every customer with respect.</p>
                <p>Gyanraj learned directly from the people who entered his shop. He remembered their preferences, helped families choose for important occasions, and stood behind what he sold. Customers returned, brought relatives, and shared the store’s name with friends.</p>
                <p>That trust became Nirmala Vastralaya’s real foundation. Over time, the small shop grew into a respected destination that has served more than 20,000 customers. Many continue to return—not only for the clothing, but for the honest, personal service they know they will receive.</p>
                <p className="font-display text-2xl text-[#64101d] border-l-2 border-[#b88a3b] pl-5">“Growth came one customer, one promise, and one relationship at a time.”</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f3e5cf] py-16">
          <div className="container-custom grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[['Rs. 50,000', 'Initial investment'], ['20,000+', 'Customers served'], ['2002', 'Year established']].map(([value, label]) => (
              <div key={label} className="border-b sm:border-b-0 sm:border-r last:border-0 border-[#d8bd86] pb-7 sm:pb-0">
                <p className="font-display text-4xl md:text-5xl text-[#64101d]">{value}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#846c57]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-custom py-20 md:py-28">
          <div className="grid lg:grid-cols-2 bg-[#64101d] overflow-hidden">
            <div className="relative min-h-[520px] lg:min-h-[700px]">
              <Image src="/images/editorial/nirmala-model-pink.webp" alt="Model presenting a pink saree from Nirmala Vastralaya" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="p-10 md:p-16 flex items-center text-[#fff8ec]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#e5c687] mb-4">Why Customers Return</p>
                <h2 className="font-display text-4xl md:text-5xl mb-8">A Relationship Beyond the Sale</h2>
                <div className="space-y-7">
                  {values.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-4">
                      <Icon className="text-[#e5c687] shrink-0 mt-1" size={22} />
                      <div><h3 className="font-display text-2xl mb-1">{title}</h3><p className="text-[#ead8c3] text-sm leading-relaxed">{text}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </StoreShell>
  )
}
