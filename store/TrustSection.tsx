import { Gem, Truck, ShieldCheck, Headphones } from 'lucide-react'

const benefits = [
  { icon: Gem, title: 'Premium Quality', text: 'Carefully selected sarees and textiles' },
  { icon: Truck, title: 'Reliable Delivery', text: 'Fast support across Nepal' },
  { icon: ShieldCheck, title: 'Trusted Since 2002', text: 'Fair pricing and genuine service' },
  { icon: Headphones, title: 'Personal Assistance', text: 'Friendly guidance for every occasion' },
]

export default function TrustSection() {
  return (
    <section className="py-10 bg-[#f4e2c8] border-y border-[#d9ba7b]">
      <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="flex flex-col items-center text-center md:border-r md:last:border-r-0 border-[#d6b97f] px-3">
            <benefit.icon size={29} strokeWidth={1.4} className="text-[#ad7a31] mb-3" />
            <h3 className="font-display text-lg font-semibold text-[#5d1420]">{benefit.title}</h3>
            <p className="text-[10px] leading-5 text-[#76574a] mt-1 max-w-[190px]">{benefit.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
