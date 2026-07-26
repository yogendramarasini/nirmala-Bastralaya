import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import WhatsAppButton from '@/components/store/WhatsAppButton'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
