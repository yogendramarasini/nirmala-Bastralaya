import { Suspense } from 'react'
import AdminOrdersClient from './AdminOrdersClient'

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4">{Array.from({length:5}).map((_,i)=><div key={i} className="h-12 bg-white rounded-lg"/>)}</div>}>
      <AdminOrdersClient />
    </Suspense>
  )
}
