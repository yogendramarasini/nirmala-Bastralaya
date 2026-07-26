import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      storage: process.env.NETLIFY ? 'netlify-blobs' : 'local-only',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({
      status: 'degraded',
      database: 'unavailable',
      storage: process.env.NETLIFY ? 'netlify-blobs' : 'local-only',
      timestamp: new Date().toISOString(),
    }, { status: 503 })
  }
}
