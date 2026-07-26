'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
]

export default function ShopClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const sale = searchParams.get('sale') === 'true'
  const isNew = searchParams.get('new') === 'true'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const limit = 12

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      if (key !== 'page') params.delete('page')
      router.push(`/shop?${params.toString()}`)
    },
    [searchParams, router]
  )

  const clearFilters = () => router.push('/shop')

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(category && { category }),
      ...(sort && { sort }),
      ...(sale && { sale: 'true' }),
      ...(isNew && { new: 'true' }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
    })

    setLoading(true)
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, search, category, sort, sale, isNew, minPrice, maxPrice])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
  }, [])

  const totalPages = Math.ceil(total / limit)
  const hasActiveFilters = !!(search || category || sale || isNew || minPrice || maxPrice)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-surface border-b border-gray-100 py-10">
        <div className="container-custom">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">Shop</h1>
          <p className="text-gray-500 text-sm">
            {total} {total === 1 ? 'product' : 'products'} found
            {search && ` for "${search}"`}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm outline-none focus:border-primary transition-colors rounded"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 text-sm outline-none focus:border-primary transition-colors rounded bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Toggle (mobile) */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="sm:hidden flex items-center gap-2 border border-gray-200 px-4 py-2.5 text-sm rounded"
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasActiveFilters && <span className="bg-gold text-primary text-xs rounded-full px-1.5 py-0.5 font-semibold">!</span>}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${filterOpen ? 'block' : 'hidden'} sm:block w-full sm:w-56 shrink-0`}>
            <div className="sticky top-24 space-y-7">
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700">
                  <X size={13} /> Clear all filters
                </button>
              )}

              {/* Categories */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Category</h3>
                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => updateParam('category', '')}
                      className={`text-sm w-full text-left py-1 transition-colors ${!category ? 'text-gold font-medium' : 'text-gray-500 hover:text-primary'}`}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map((cat: any) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => updateParam('category', cat.slug)}
                        className={`text-sm w-full text-left py-1 transition-colors flex justify-between ${category === cat.slug ? 'text-gold font-medium' : 'text-gray-500 hover:text-primary'}`}
                      >
                        {cat.name}
                        <span className="text-xs text-gray-300">{cat._count?.products || 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Price (NPR)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParam('minPrice', e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-xs rounded outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParam('maxPrice', e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-xs rounded outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Filter By</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => updateParam('new', e.target.checked ? 'true' : '')}
                      className="accent-gold w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">New Arrivals</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sale}
                      onChange={(e) => updateParam('sale', e.target.checked ? 'true' : '')}
                      className="accent-gold w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">On Sale</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-100 mb-3 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-sm mb-6">Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="btn-outline text-sm">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-14">
                    <button
                      onClick={() => updateParam('page', String(page - 1))}
                      disabled={page <= 1}
                      className="p-2 border border-gray-200 rounded hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1
                      if (p !== 1 && p !== totalPages && Math.abs(p - page) > 2) return null
                      return (
                        <button
                          key={p}
                          onClick={() => updateParam('page', String(p))}
                          className={`w-9 h-9 text-sm border rounded transition-colors ${
                            p === page
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 hover:border-primary text-gray-600'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => updateParam('page', String(page + 1))}
                      disabled={page >= totalPages}
                      className="p-2 border border-gray-200 rounded hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
