import type { Metadata } from 'next'
import StoreShell from '@/components/store/StoreShell'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Nirmala Vastralaya. Visit us in Tamghas, Gulmi, or reach us by phone, email, or WhatsApp.',
}

export default function ContactPage() {
  return (
    <StoreShell>
      <ContactClient />
    </StoreShell>
  )
}
