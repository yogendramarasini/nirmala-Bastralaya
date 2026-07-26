export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  categoryId: string
  category: Category
  price: number
  salePrice: number | null
  quantity: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  isNew: boolean
  isFeatured: boolean
  images: ProductImage[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt: string | null
  sortOrder: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
  isActive: boolean
  _count?: { products: number }
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customer: Customer
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentProof: string | null
  subtotal: number
  discountAmount: number
  shippingAmount: number
  total: number
  couponCode: string | null
  notes: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
  total: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  orders?: Order[]
  createdAt: string
}

export interface Setting {
  id: string
  key: string
  value: string
}

export interface Media {
  id: string
  type: string
  url: string
  filename: string
  size: number
  mimeType: string
  createdAt: string
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'FONEPAY' | 'ESEWA' | 'KHALTI'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}
