'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Zap, Star, ChevronRight, ZoomIn, Package, RotateCcw, Phone } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateDiscount, getImageUrl } from '@/lib/utils'
import ProductCard from '@/components/store/ProductCard'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ProductDetailClient({ product, related }: { product: any; related: any[] }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [zoomed, setZoomed] = useState(false)
  const { addItem } = useCart()
  const router = useRouter()

  const discount = product.salePrice ? calculateDiscount(Number(product.price), Number(product.salePrice)) : 0
  const displayPrice = Number(product.salePrice ?? product.price)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        image: product.images[0]?.url || '',
        slug: product.slug,
        stock: product.quantity,
      })
    }
    toast.success(`${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-gray-100">
        <div className="container-custom py-4 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary transition-colors">
            {product.category.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-primary">{product.name}</span>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-[4/5] bg-gray-50 overflow-hidden cursor-zoom-in"
              onClick={() => setZoomed(true)}
            >
              {product.images.length > 0 ? (
                <Image
                  src={getImageUrl(product.images[selectedImage]?.url)}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Package size={64} />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded">
                <ZoomIn size={16} className="text-gray-600" />
              </div>
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-gold text-primary text-xs font-bold px-2 py-1">
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-24 shrink-0 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={getImageUrl(img.url)}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">{product.category.name}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(avgRating) ? 'fill-gold text-gold' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">({product.reviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</span>
              {product.salePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-0.5">{formatPrice(Number(product.price))}</span>
                  <span className="text-sm text-green-600 font-medium mb-0.5">Save {formatPrice(Number(product.price) - displayPrice)}</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.quantity > 10 ? (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> In Stock
                </span>
              ) : product.quantity > 0 ? (
                <span className="text-orange-500 text-sm font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange-400 rounded-full" /> Only {product.quantity} left
                </span>
              ) : (
                <span className="text-red-500 text-sm font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-400 rounded-full" /> Out of Stock
                </span>
              )}
            </div>

            <div className="w-full h-px bg-gray-100 mb-6" />

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-8">{product.description}</p>

            {/* SKU */}
            <p className="text-xs text-gray-400 mb-8">SKU: <span className="text-gray-600">{product.sku}</span></p>

            {/* Quantity */}
            {product.quantity > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-primary">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="btn-outline flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={17} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="btn-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={17} />
                Buy Now
              </button>
            </div>

            {/* Trust signals */}
            <div className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Package size={16} className="text-gold shrink-0" />
                Cash on Delivery available
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw size={16} className="text-gold shrink-0" />
                Easy returns & exchanges
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-gold shrink-0" />
                <a href="tel:079-520658" className="hover:text-gold transition-colors">
                  Questions? Call 079-520658
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="font-display text-2xl font-bold text-primary mb-8">
              Customer Reviews ({product.reviews.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="bg-surface rounded-lg p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'fill-gold text-gold' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">"{review.comment}"</p>
                  <div>
                    <p className="text-sm font-semibold text-primary">{review.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="font-display text-2xl font-bold text-primary mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomed && product.images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full">
            <Image
              src={getImageUrl(product.images[selectedImage]?.url)}
              alt={product.name}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
