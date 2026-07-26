import { getStore } from '@netlify/blobs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession } from '@/lib/security'

const SAFE_PATH = /^(product|qr|payment|general)\/[0-9a-f-]+\.webp$/

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const key = path.join('/')

  if (!SAFE_PATH.test(key)) {
    return NextResponse.json({ error: 'Invalid image path' }, { status: 400 })
  }

  try {
    const isPaymentProof = key.startsWith('payment/')
    if (isPaymentProof) {
      const session = await getServerSession(authOptions)
      if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    let data: ArrayBuffer | Buffer
    let etag = ''
    if (process.env.NETLIFY) {
      const store = getStore({ name: 'nirmala-uploads', consistency: 'strong' })
      const entry = await store.getWithMetadata(key, { type: 'arrayBuffer' })
      if (!entry?.data) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 })
      }
      data = entry.data
      etag = entry.etag
    } else {
      const configuredRoot = process.env.UPLOAD_STORAGE_PATH
      if (process.env.NODE_ENV === 'production' && !configuredRoot) {
        return NextResponse.json({ error: 'Image storage is not configured' }, { status: 503 })
      }
      const root = configuredRoot
        ? (isAbsolute(configuredRoot) ? configuredRoot : resolve(/* turbopackIgnore: true */ process.cwd(), configuredRoot))
        : join(/* turbopackIgnore: true */ process.cwd(), '.local-uploads')
      try {
        data = await readFile(join(root, key))
      } catch {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 })
      }
    }

    const responseBody = data instanceof ArrayBuffer
      ? data
      : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer

    return new Response(responseBody, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': isPaymentProof
          ? 'private, no-store, max-age=0'
          : 'public, max-age=31536000, immutable',
        ...(etag ? { ETag: etag } : {}),
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Asset read error:', error)
    return NextResponse.json({ error: 'Image unavailable' }, { status: 503 })
  }
}
