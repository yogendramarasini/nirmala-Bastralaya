import StoreShell from '@/components/store/StoreShell'
import HeroSection from '@/components/store/HeroSection'
import TrustSection from '@/components/store/TrustSection'
import CategoriesSection from '@/components/store/CategoriesSection'
import FeaturedProducts from '@/components/store/FeaturedProducts'
import SpecialOffers from '@/components/store/SpecialOffers'
import Testimonials from '@/components/store/Testimonials'
import AboutPreview from '@/components/store/AboutPreview'
import NewsletterSection from '@/components/store/NewsletterSection'

export default function HomePage() {
  return (
    <StoreShell>
      <HeroSection />
      <TrustSection />
      <CategoriesSection />
      <FeaturedProducts />
      <SpecialOffers />
      <Testimonials />
      <AboutPreview />
      <NewsletterSection />
    </StoreShell>
  )
}
