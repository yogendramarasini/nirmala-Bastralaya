'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, FolderOpen, ShoppingCart,
  Users, Tag, Image, Settings, ChevronLeft, Menu, BarChart3,
  MessageSquare, Ticket
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-[#111111] text-white flex flex-col transition-all duration-300 shrink-0`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-5'} py-5 border-b border-white/10`}>
        {!collapsed && (
          <div>
            <div className="font-display text-lg font-bold">Nirmala</div>
            <div className="text-[9px] tracking-[0.15em] text-gold uppercase">Bastralaya</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all text-sm ${
              isActive(item.href, item.exact)
                ? 'bg-gold text-primary font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className={`flex items-center gap-3 text-gray-500 hover:text-gray-300 text-xs transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <BarChart3 size={16} />
          {!collapsed && 'View Store'}
        </Link>
      </div>
    </aside>
  )
}
