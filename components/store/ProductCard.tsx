'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateDiscount, getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice: number | null
    images: Array<{ url: string; alt: string | null }>
    category: { name: string }
    isNew: boolean
    quantity: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const discount = product.salePrice ? calculateDiscount(product.price, product.salePrice) : 0
  const displayPrice = product.salePrice ?? product.price
  const primaryImage = product.images[0]?.url || '/images/placeholder.jpg'
  const secondImage = product.images[1]?.url

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: primaryImage,
      slug: product.slug,
      stock: product.quantity,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <div>
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3">
          <Link href={`/product/${product.slug}`} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          <Image
            src={getImageUrl(primaryImage)}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              secondImage ? 'group-hover:opacity-0' : ''
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {secondImage && (
            <Image
              src={getImageUrl(secondImage)}
              alt={product.name}
              fill
              className="object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="bg-primary text-white text-[10px] font-semibold px-2 py-1 tracking-wider uppercase">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="bg-gold text-primary text-[10px] font-semibold px-2 py-1 tracking-wider">
                -{discount}%
              </span>
            )}
            {product.quantity === 0 && (
              <span className="bg-gray-500 text-white text-[10px] font-semibold px-2 py-1 tracking-wider uppercase">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="flex-1 bg-primary text-white text-xs py-2.5 font-medium tracking-wide uppercase hover:bg-gold hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={13} />
              Add to Cart
            </button>
            <Link
              href={`/product/${product.slug}`}
              aria-label={`View ${product.name}`}
              className="bg-white text-primary p-2.5 hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
            >
              <Eye size={15} />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">{product.category.name}</p>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-medium text-primary line-clamp-2 leading-snug mb-2 hover:text-gold transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">{formatPrice(displayPrice)}</span>
            {product.salePrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
