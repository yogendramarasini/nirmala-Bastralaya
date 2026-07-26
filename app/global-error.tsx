'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fbf5eb', color: '#431018', padding: 24 }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 40 }}>We will be right back</h1>
            <p style={{ color: '#6f5a55', marginBottom: 28 }}>A temporary problem interrupted the page.</p>
            <button
              type="button"
              onClick={reset}
              style={{ border: 0, background: '#64101d', color: 'white', padding: '12px 28px', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
