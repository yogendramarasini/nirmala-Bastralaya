import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fbf5eb] text-[#431018] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#a7772e] mb-4">404</p>
        <h1 className="font-serif text-4xl mb-4">Page not found</h1>
        <p className="text-[#6f5a55] mb-8">The page you requested is not available.</p>
        <Link href="/" className="inline-block bg-[#64101d] text-white px-7 py-3 text-sm uppercase tracking-wider">
          Return home
        </Link>
      </div>
    </main>
  )
}
