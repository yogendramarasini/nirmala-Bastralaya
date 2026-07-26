'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, Package, Upload, X } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'

type Category = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  sku: string
  description: string
  categoryId: string
  price: number
  salePrice: number | null
  quantity: number
  status: ProductStatus
  isNew: boolean
  isFeatured: boolean
  images: Array<{ url: string }>
  category?: { name: string }
}

type ProductForm = {
  name: string
  sku: string
  description: string
  categoryId: string
  price: string
  salePrice: string
  quantity: string
  status: ProductStatus
  isNew: boolean
  isFeatured: boolean
}

const defaultForm: ProductForm = {
  name: '', sku: '', description: '', categoryId: '',
  price: '', salePrice: '', quantity: '', status: 'ACTIVE',
  isNew: false, isFeatured: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const limit = 15

  const [form, setForm] = useState<ProductForm>(defaultForm)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search && { search }),
      ...(categoryFilter && { category: categoryFilter }),
    })
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, search, categoryFilter])

  useEffect(() => {
    // Product data is intentionally synchronized with the active filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setForm({
      name: product.name, sku: product.sku, description: product.description,
      categoryId: product.categoryId, price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      quantity: String(product.quantity), status: product.status,
      isNew: product.isNew, isFeatured: product.isFeatured,
    })
    setUploadedImages(product.images?.map((image) => image.url) || [])
    setShowForm(true)
  }

  const openCreate = () => {
    setEditProduct(null)
    setForm(defaultForm)
    setUploadedImages([])
    setShowForm(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'product')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || `Failed to upload ${file.name}`)
        continue
      }
      if (data.url) setUploadedImages(prev => [...prev, data.url])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        quantity: parseInt(form.quantity),
      }

      let productId = editProduct?.id
      if (editProduct) {
        const res = await fetch(`/api/products/${editProduct.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to update product')
        toast.success('Product updated')
      } else {
        const res = await fetch('/api/products', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create product')
        productId = data.id
        toast.success('Product created')
      }

      // Save images
      if (productId) {
        const imageRes = await fetch(`/api/products/${productId}/images`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: uploadedImages }),
        })
        if (!imageRes.ok) throw new Error('Product saved, but its images could not be updated')
      }

      setShowForm(false)
      void fetchProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to delete product')
      }
      toast.success('Product deleted')
      void fetchProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm rounded-lg outline-none focus:border-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Package size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 shrink-0 bg-gray-100 rounded overflow-hidden">
                          {product.images?.[0] ? (
                            <Image src={getImageUrl(product.images[0].url)} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{product.sku}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-primary">
                        {formatPrice(product.salePrice ?? product.price)}
                      </div>
                      {product.salePrice && (
                        <div className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.quantity === 0 ? 'text-red-500' : product.quantity <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                        product.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                        product.status === 'OUT_OF_STOCK' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-primary rounded transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {((page-1)*limit)+1}–{Math.min(page*limit, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i+1} onClick={() => setPage(i+1)}
                  className={`w-7 h-7 text-xs rounded ${page === i+1 ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-primary">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">SKU *</label>
                  <input value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} required
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Category *</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({...f, categoryId: e.target.value}))} required
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary bg-white">
                    <option value="">Select category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Price (NPR) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required min="0"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Sale Price (NPR)</label>
                  <input type="number" value={form.salePrice} onChange={e => setForm(f => ({...f, salePrice: e.target.value}))} min="0"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" placeholder="Leave empty for no sale" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Quantity *</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} required min="0"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as ProductStatus}))}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary bg-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required rows={4}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary resize-none" />
                </div>
                <div className="sm:col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({...f, isNew: e.target.checked}))} className="accent-gold w-4 h-4" />
                    <span className="text-sm text-gray-600">Mark as New</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="accent-gold w-4 h-4" />
                    <span className="text-sm text-gray-600">Featured Product</span>
                  </label>
                </div>

                {/* Images */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Product Images</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {uploadedImages.map((url, i) => (
                      <div key={i} className="relative w-20 h-24 rounded overflow-hidden border border-gray-200 group">
                        <Image src={getImageUrl(url)} alt={`Image ${i+1}`} fill className="object-cover" sizes="80px" />
                        <button type="button" onClick={() => setUploadedImages(imgs => imgs.filter((_, j) => j !== i))}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-20 h-24 border-2 border-dashed border-gray-200 rounded hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary">
                      <Upload size={18} />
                      <span className="text-[10px]">Add</span>
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-70">
                  {formLoading ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
