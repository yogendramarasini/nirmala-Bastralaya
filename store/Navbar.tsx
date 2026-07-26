'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { ShoppingBag, Menu, X, Search, Phone } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Sarees' },
  { href: '/shop?new=true', label: 'New Arrivals' },
  { href: '/about', label: 'Our Story' },
  { href: '/contact', label: 'Contact' },
]

const subscribeToClientReady = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function Navbar() {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const clientReady = useSyncExternalStore(
    subscribeToClientReady,
    getClientSnapshot,
    getServerSnapshot
  )
  const totalItems = clientReady ? getTotalItems() : 0

  return (
    <>
      <div className="bg-[#64101d] text-[#e6c98b] text-[10px] py-2 hidden md:block tracking-[0.08em]">
        <div className="container-custom flex justify-between items-center">
          <span>Free delivery inside Tamghas on qualifying orders</span>
          <a href="tel:079-520658" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={11} /> 079-520658
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#fff8ec]/95 backdrop-blur-md border-b border-[#d8bd86]">
        <div className="container-custom flex items-center justify-between h-20 md:h-24">
          <Link href="/" className="relative w-48 md:w-64 h-16 md:h-20 shrink-0" aria-label="Nirmala Bastralaya home">
            <Image
              src="/images/editorial/nirmala-logo.webp"
              alt="Nirmala Bastralaya"
              fill
              sizes="(max-width: 767px) 192px, 256px"
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`text-[11px] uppercase tracking-[0.13em] font-medium hover:text-[#a7772e] transition-colors ${
                  pathname === link.href ? 'text-[#a7772e]' : 'text-[#5d1420]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 text-[#5d1420]">
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:text-[#a7772e] transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
            <Link href="/cart" className="relative p-2 hover:text-[#a7772e] transition-colors" aria-label="Shopping cart">
              <ShoppingBag size={20} />
              {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#64101d] text-white text-[9px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center">{totalItems}</span>}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2" aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden bg-[#fff8ec] border-t border-[#dfc89e] px-5 py-4 flex flex-col">
            {navLinks.map((link) => (
              <Link key={`${link.href}-${link.label}`} href={link.href} onClick={() => setMobileOpen(false)} className="py-3 text-xs uppercase tracking-[0.12em] text-[#5d1420] border-b border-[#ead8b9]">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-[#3b0710]/75 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="bg-[#fff8ec] p-7 max-w-2xl mx-auto mt-28 mx-4 md:mx-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-[#64101d] pb-3">
              <Search size={21} className="text-[#a7772e]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && searchQuery.trim()) window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`
                }}
                placeholder="Search sarees, coat pants, bags, shoes..."
                className="flex-1 text-base outline-none bg-transparent text-[#5d1420]"
              />
              <button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
