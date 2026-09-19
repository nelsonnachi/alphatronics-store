import { CustomerService } from '@/components/storefront/customer-service/customer-service'
import { HeroSection } from '@/components/storefront/hero/hero-section'
import { ProductBanners } from '@/components/storefront/product-banners/product-banners'
import { FeaturedProducts } from '@/components/storefront/products/featured-products'
import { NewArrivals } from '@/components/storefront/products/new-arrivals'
import { ShopByBrand } from '@/components/storefront/shop-by-brand/shop-by-brand'
import { FeaturedShowcase } from '@/components/storefront/testimonials/TestimonialFeaturedShowcase'

const page = () => {
  return (
    <div>
       <main>
      <HeroSection />

      <CustomerService />

      <ProductBanners />

      <FeaturedProducts />

      <NewArrivals />

      <ShopByBrand />

      <FeaturedShowcase />
    </main>
    </div>
  )
}

export default page