'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, ImageIcon, Copy } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminMedia() {
  const [mediaList, setMediaList] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchMedia = () => {
    fetch('/api/media').then(r => r.json()).then(d => setMediaList(d.media || []))
  }

  useEffect(() => { fetchMedia() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'general')
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) {
          await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: data.url,
              filename: data.filename,
              size: data.size,
              mimeType: data.mimeType,
              type: 'OTHER',
            }),
          })
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    setUploading(false)
    fetchMedia()
    toast.success('Files uploaded successfully')
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url)
    toast.success('URL copied to clipboard')
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Media Library</h1>
          <p className="text-gray-500 text-sm mt-0.5">{mediaList.length} files</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2 disabled:opacity-70">
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* Upload zone */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-12 cursor-pointer hover:border-primary transition-colors bg-white">
        <ImageIcon size={36} className="text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-1">Drag & drop images here</p>
        <p className="text-gray-400 text-xs">or click to browse — max 4MB per file</p>
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
      </label>

      {/* Grid */}
      {mediaList.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {mediaList.map((media) => (
            <div key={media.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
              <Image src={getImageUrl(media.url)} alt={media.filename} fill className="object-cover" sizes="150px" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(media.url)} className="p-1.5 bg-white rounded text-primary hover:bg-gold transition-colors" title="Copy URL">
                  <Copy size={13} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-[9px] truncate">{media.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {mediaList.length === 0 && !uploading && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">No media uploaded yet</p>
        </div>
      )}
    </div>
  )
}
