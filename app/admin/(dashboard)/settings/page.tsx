'use client'

import { useEffect, useState, useRef } from 'react'
import { Save, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const SETTING_GROUPS = [
  {
    title: 'Store Information',
    fields: [
      { key: 'store_name', label: 'Store Name', type: 'text' },
      { key: 'store_phone', label: 'Phone Number', type: 'text' },
      { key: 'store_whatsapp', label: 'WhatsApp Number', type: 'text' },
      { key: 'store_email', label: 'Email Address', type: 'email' },
      { key: 'store_address', label: 'Address', type: 'textarea' },
    ],
  },
  {
    title: 'Social Media',
    fields: [
      { key: 'social_facebook', label: 'Facebook URL', type: 'url' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
    ],
  },
]

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrImages, setQrImages] = useState<Record<string, string>>({
    FONEPAY: '',
  })
  const fonepayRef = useRef<HTMLInputElement>(null)
  const qrRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    FONEPAY: fonepayRef,
  }

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        setSettings(d)
        setQrImages({
          FONEPAY: d.qr_FONEPAY || '',
        })
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...settings,
        qr_FONEPAY: qrImages.FONEPAY,
      }
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleQrUpload = async (method: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'qr')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok || !data.url) {
      toast.error(data.error || 'QR upload failed')
      return
    }
    const saveRes = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [`qr_${method}`]: data.url }),
    })
    if (!saveRes.ok) {
      toast.error('QR uploaded but could not be saved')
      return
    }
    setQrImages(prev => ({ ...prev, [method]: data.url }))
    toast.success(`${method} QR uploaded and saved`)
  }

  if (loading) return <div className="animate-pulse space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-40 bg-white rounded-xl" />)}</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage store configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-70">
          <Save size={15} />
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Setting Groups */}
      {SETTING_GROUPS.map((group) => (
        <div key={group.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-primary mb-5 pb-3 border-b border-gray-100">{group.title}</h2>
          <div className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={settings[field.key] || ''}
                    onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={settings[field.key] || ''}
                    onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-primary"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* QR Codes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-primary mb-2 pb-3 border-b border-gray-100">Payment QR Codes</h2>
        <p className="text-sm text-gray-500 mb-5">Upload QR codes for each payment method. Customers will scan these during checkout.</p>
        <div className="grid max-w-sm gap-6">
          {(['FONEPAY'] as const).map((method) => (
            <div key={method} className="text-center">
              <p className="text-sm font-semibold text-primary mb-3">{method}</p>
              <div className="w-full aspect-square border-2 border-[#d3ad68] rounded-xl overflow-hidden mb-3 flex items-center justify-center bg-white p-3">
                {qrImages[method] ? (
                  <img src={qrImages[method]} alt={`${method} QR`} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-gray-300 text-center">
                    <ImageIcon size={32} className="mx-auto mb-1" />
                    <p className="text-xs">No QR uploaded</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => qrRefs[method].current?.click()}
                className="w-full border border-gray-200 text-sm py-2 rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2 text-gray-600"
              >
                <Upload size={14} />
                {qrImages[method] ? 'Replace' : 'Upload'} QR
              </button>
              <input ref={qrRefs[method] as React.RefObject<HTMLInputElement>} type="file" accept="image/*" className="hidden"
                onChange={e => handleQrUpload(method, e)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
