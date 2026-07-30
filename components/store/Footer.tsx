import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5 bg-[#fff8ec] inline-block px-3 py-1.5">
              <Image
                src="/images/editorial/nirmala-logo.webp"
                alt="Nirmala Bastralaya"
                width={210}
                height={105}
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              From a small shop to a trusted clothing destination serving more than 20,000 customers.
            </p>
            <a
              href="https://wa.me/9779857027929"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2.5 rounded transition-colors"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/shop?new=true', label: 'New Arrivals' },
                { href: '/shop?sale=true', label: 'Sale & Offers' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-5">Categories</h4>
            <ul className="space-y-3">
              {[
                'Sarees',
                'Marriage Dresses',
                'Traditional Clothing',
                'T-Shirts & Pants',
                'Shoes & Bags',
                'Quilts & Bedding',
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/shop?category=${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                    className="text-gray-400 text-sm hover:text-gold transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm leading-relaxed">
                  Tamghas, Resunga Municipality<br />
                  Gulmi District, Nepal
                </span>
              </li>
              <li>
                <a href="tel:079-520658" className="flex items-center gap-3 text-gray-400 text-sm hover:text-gold transition-colors">
                  <Phone size={16} className="text-gold shrink-0" />
                  079-520658
                </a>
              </li>
              <li>
                <a href="mailto:nirmalavastralya@gmail.com" className="flex items-center gap-3 text-gray-400 text-sm hover:text-gold transition-colors break-all">
                  <Mail size={16} className="text-gold shrink-0" />
                  nirmalavastralya@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-6 p-4 border border-white/10 rounded">
              <p className="text-xs text-gray-500 mb-1">Business Hours</p>
              <p className="text-sm text-gray-300">Sun – Fri: 9:00 AM – 7:00 PM</p>
              <p className="text-sm text-gray-300">Saturday: 10:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Nirmala Bastralaya. All rights reserved. Established 2002.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
