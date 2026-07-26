'use client'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#fbf5eb] text-[#431018] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#a7772e] mb-4">Nirmala Bastralaya</p>
        <h1 className="font-serif text-4xl mb-4">Something went wrong</h1>
        <p className="text-[#6f5a55] mb-8">
          We could not complete that request. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-[#64101d] text-white px-7 py-3 text-sm uppercase tracking-wider"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
