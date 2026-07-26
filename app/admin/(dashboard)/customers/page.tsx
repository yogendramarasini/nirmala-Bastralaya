'use client'

import { useEffect, useState } from 'react'
import { Search, Users, Mail, Phone } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(search && { search }) })
    fetch(`/api/customers?${params}`)
      .then(r => r.json())
      .then(d => { setCustomers(d.customers || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page, search])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">Customers</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} total customers</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm rounded-lg outline-none focus:border-primary" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Total Spent</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-gray-400">
                <Users size={36} className="mx-auto mb-2 opacity-30" />
                <p>No customers found</p>
              </td></tr>
            ) : customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {customer.name[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-primary">{customer.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-gray-600 flex items-center gap-1"><Phone size={12} /> {customer.phone}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={11} /> {customer.email}</p>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{customer._count?.orders || 0} orders</td>
                <td className="px-5 py-3 text-sm font-medium text-primary">{formatPrice(customer.totalSpent || 0)}</td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {new Date(customer.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-end px-5 py-3 border-t border-gray-100 gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button key={i+1} onClick={() => setPage(i+1)}
                className={`w-7 h-7 text-xs rounded ${page === i+1 ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
