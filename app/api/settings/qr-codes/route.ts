import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const qrSettings = await prisma.setting.findMany({
      where: {
        key: { in: ['qr_FONEPAY', 'qr_ESEWA', 'qr_KHALTI'] },
      },
    })
    const map: Record<string, string> = {}
    qrSettings.forEach((s) => {
      const method = s.key.replace('qr_', '')
      map[method] = s.value
    })
    if (!map.FONEPAY) {
      map.FONEPAY = '/images/payment/fonepay-qr.png'
    }
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({})
  }
}
