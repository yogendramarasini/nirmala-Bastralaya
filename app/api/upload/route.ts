import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { isAbsolute, join, resolve } from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { getStore } from '@netlify/blobs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  enforcePublicRateLimit,
  isAdminSession,
  rejectInvalidOrigin,
} from '@/lib/security'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_DIRECTORIES = new Set(['product', 'qr', 'payment', 'general'])
const MAX_SIZE = 4 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const originError = rejectInvalidOrigin(request)
    if (originError) return originError

    const declaredLength = Number(request.headers.get('content-length') || 0)
    if (declaredLength > MAX_SIZE + 256 * 1024) {
      return NextResponse.json({ error: 'Request is too large' }, { status: 413 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = String(formData.get('type') || 'product')

    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_DIRECTORIES.has(type)) {
      return NextResponse.json({ error: 'Invalid upload category' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (type !== 'payment') {
      if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      const rateLimit = await enforcePublicRateLimit('payment_upload', request, 12, 60 * 60 * 1000)
      if (rateLimit) return rateLimit
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 4MB allowed.' }, { status: 400 })
    }

    const input = Buffer.from(await file.arrayBuffer())
    let buffer: Buffer
    try {
      const image = sharp(input, { failOn: 'warning', limitInputPixels: 40_000_000 })
      const metadata = await image.metadata()
      if (!metadata.width || !metadata.height || !['jpeg', 'png', 'webp'].includes(metadata.format || '')) {
        return NextResponse.json({ error: 'Invalid image content' }, { status: 400 })
      }

      const normalized = image
        .rotate()
        .resize({
          width: type === 'qr' ? 2000 : 3000,
          height: type === 'qr' ? 2000 : 3000,
          fit: 'inside',
          withoutEnlargement: true,
        })

      buffer = type === 'qr'
        ? await normalized.webp({ lossless: true }).toBuffer()
        : await normalized.webp({ quality: 88 }).toBuffer()
    } catch {
      return NextResponse.json({ error: 'Invalid image content' }, { status: 400 })
    }

    const filename = `${randomUUID()}.webp`
    let url: string

    if ((process.env.NODE_ENV === 'production' && !process.env.UPLOAD_STORAGE_PATH)) {
      const key = `${type}/${filename}`
      const store = getStore({ name: 'nirmala-uploads', consistency: 'strong' })
      const blobData = Uint8Array.from(buffer).buffer
      await store.set(key, blobData, {
        metadata: {
          contentType: 'image/webp',
          uploadedAt: new Date().toISOString(),
        },
        onlyIfNew: true,
      })
      url = `/api/assets/${key}`
    } else {
      const configuredRoot = process.env.UPLOAD_STORAGE_PATH
      if (process.env.NODE_ENV === 'production' && !configuredRoot) {
        console.error('UPLOAD_STORAGE_PATH is required outside the Netlify runtime')
        return NextResponse.json({ error: 'Image storage is not configured' }, { status: 503 })
      }
      const root = configuredRoot
        ? (isAbsolute(configuredRoot) ? configuredRoot : resolve(/* turbopackIgnore: true */ process.cwd(), configuredRoot))
        : join(/* turbopackIgnore: true */ process.cwd(), '.local-uploads')
      const uploadDir = join(root, type)
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, filename), buffer)
      url = `/api/assets/${type}/${filename}`
    }

    return NextResponse.json({
      url,
      filename,
      size: buffer.length,
      mimeType: 'image/webp',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
