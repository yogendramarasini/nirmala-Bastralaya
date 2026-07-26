import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'

export default function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-theme">
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
