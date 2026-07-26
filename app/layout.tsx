import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Nirmala Bastralaya — Premium Clothing & Textile Store, Gulmi Nepal',
    template: '%s | Nirmala Bastralaya',
  },
  description:
    'Nirmala Bastralaya — Premium clothing, sarees, traditional attire, shoes, bags and more. Trusted since 2002, located in Tamghas, Gulmi, Nepal.',
  keywords: ['Nirmala Bastralaya', 'clothing store Nepal', 'saree Gulmi', 'traditional clothing Nepal', 'premium clothes Tamghas', 'marriage dress Nepal'],
  openGraph: {
    type: 'website',
    locale: 'en_NP',
    siteName: 'Nirmala Bastralaya',
    title: 'Nirmala Bastralaya — Premium Clothing & Textile',
    description: 'Trusted clothing & textile store in Gulmi, Nepal since 2002.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#111111', color: '#ffffff', borderRadius: '4px', fontSize: '14px' },
              success: { iconTheme: { primary: '#D4AF37', secondary: '#111111' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
