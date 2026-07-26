import type { Metadata } from 'next'
import { Suspense } from 'react'
import StoreShell from '@/components/store/StoreShell'
import ShopClient from './ShopClient'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full collection of premium sarees, dresses, shoes, bags and more.',
}

export default function ShopPage() {
  return (
    <StoreShell>
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading shop...</div></div>}>
        <ShopClient />
      </Suspense>
    </StoreShell>
  )
}
