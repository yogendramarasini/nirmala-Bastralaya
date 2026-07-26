'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Ticket, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'PERCENTAGE', value: '', minOrderAmount: '',
    maxUses: '', startDate: '', endDate: '',
  })

  const fetchCoupons = async () => {
    setLoading(true)
    const res = await fetch('/api/coupons')
    const data = await res.json()
    setCoupons(data.coupons || [])
    setLoading(false)
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
          minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create coupon')
        return
      }
      toast.success('Coupon created')
      setShowForm(false)
      setForm({ code: '', type: 'PERCENTAGE', value: '', minOrderAmount: '', maxUses: '', startDate: '', endDate: '' })
      fetchCoupons()
    } catch {
      toast.error('Failed to create coupon')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (coupon: any) => {
    await fetch(`/api/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    })
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
  }

  const isExpired = (endDate: string) => new Date(endDate) < new Date()

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Coupons</h1>
          <p className="text-gray-500 text-sm mt-0.5">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Ticket size={36} className="mx-auto mb-2 opacity-30" />
            <p>No coupons yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Uses</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono font-semibold text-sm text-primary bg-gray-100 px-2 py-1 rounded">{coupon.code}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `NPR ${coupon.value}`} off
                    {coupon.minOrderAmount && <span className="text-xs text-gray-400 block">Min: NPR {coupon.minOrderAmount}</span>}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    <span className={isExpired(coupon.endDate) ? 'text-red-400' : ''}>
                      {new Date(coupon.endDate).toLocaleDateString('en-NP')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(coupon)}
                      className={`text-xs px-2 py-1 rounded-full border font-medium transition-colors ${coupon.isActive && !isExpired(coupon.endDate) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {isExpired(coupon.endDate) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-primary">New Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-primary"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Coupon Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} required
                  placeholder="e.g. SALE20"
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary bg-white">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (NPR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Value *</label>
                  <input type="number" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} required min="0"
                    placeholder={form.type === 'PERCENTAGE' ? '20' : '500'}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Min Order (NPR)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({...f, minOrderAmount: e.target.value}))} min="0"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={e => setForm(f => ({...f, maxUses: e.target.value}))} min="1"
                    placeholder="Unlimited"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} required
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} required
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-70">
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
