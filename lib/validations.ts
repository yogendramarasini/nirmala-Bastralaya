import { z } from 'zod'

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(20),
  email: z.string().email('Enter a valid email address'),
  address: z.string().trim().min(10, 'Please enter your full delivery address').max(500),
  notes: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'FONEPAY']),
  couponCode: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(3, 'Subject is required').max(150),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
}).strict()

export const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    phone: z.string().trim().min(7).max(20),
    address: z.string().trim().min(10).max(500),
  }),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1).max(20),
  })).min(1).max(50).refine(
    (items) => new Set(items.map((item) => item.productId)).size === items.length,
    'Duplicate products are not allowed',
  ),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'FONEPAY']),
  paymentProof: z.string().max(2048).refine((value) => {
    if (!value) return true
    return /^\/api\/assets\/payment\/[0-9a-f-]+\.webp$/.test(value)
  }, 'Invalid payment proof URL').optional().or(z.literal('')),
  couponCode: z.string().trim().min(3).max(50).regex(/^[A-Z0-9_-]+$/i).transform((value) => value.toUpperCase()).optional(),
  notes: z.string().trim().max(1000).optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod !== 'CASH_ON_DELIVERY' && !data.paymentProof) {
    ctx.addIssue({ code: 'custom', path: ['paymentProof'], message: 'Payment proof is required' })
  }
})

export const orderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  shippingAmount: z.number().min(0).max(1_000_000).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, 'No changes supplied')

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').max(160),
  sku: z.string().trim().min(2, 'SKU is required').max(64).regex(/^[A-Za-z0-9._-]+$/),
  description: z.string().trim().min(10, 'Description is required').max(10_000),
  categoryId: z.string().cuid('Category is required'),
  price: z.number().positive('Price must be positive').max(10_000_000),
  salePrice: z.number().positive().max(10_000_000).optional().nullable(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(1_000_000),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
}).strict().refine((data) => data.salePrice == null || data.salePrice < data.price, {
  path: ['salePrice'],
  message: 'Sale price must be lower than the regular price',
})

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(100),
  description: z.string().trim().max(1000).optional(),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  image: z.string().trim().max(2048).regex(/^\/(?:api\/assets|images)\/[A-Za-z0-9_./-]+$/).optional().nullable(),
  isActive: z.boolean().optional(),
}).strict()

export const couponSchema = z.object({
  code: z.string().trim().min(3, 'Coupon code is required').max(50).regex(/^[A-Z0-9_-]+$/i).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive('Discount value must be positive'),
  minOrderAmount: z.number().positive().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  startDate: z.string().date(),
  endDate: z.string().date(),
}).strict().refine((data) => data.type !== 'PERCENTAGE' || data.value <= 100, {
  path: ['value'],
  message: 'Percentage discount cannot exceed 100',
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  path: ['endDate'],
  message: 'End date must be after start date',
})

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email required').max(254),
  password: z.string().min(12, 'Password must be at least 12 characters').max(200),
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit authenticator code').optional().or(z.literal('')),
}).strict()

export const productImagesSchema = z.object({
  images: z.array(
    z.string().max(2048).regex(/^\/(?:api\/assets\/product|images)\/[A-Za-z0-9_./-]+$/),
  ).max(12),
}).strict()

export const mediaSchema = z.object({
  url: z.string().max(2048).regex(/^\/api\/assets\/(?:product|qr|general)\/[0-9a-f-]+\.webp$/),
  filename: z.string().max(255).regex(/^[0-9a-f-]+\.webp$/),
  size: z.number().int().min(0).max(4 * 1024 * 1024),
  mimeType: z.literal('image/webp'),
  type: z.enum(['LOGO', 'BANNER', 'PRODUCT', 'QR_CODE', 'OTHER']),
}).strict()

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
}).strict()

export const couponValidationSchema = z.object({
  code: z.string().trim().min(3).max(50).regex(/^[A-Z0-9_-]+$/i).transform((value) => value.toUpperCase()),
  orderAmount: z.number().finite().min(0).max(100_000_000),
}).strict()

export type CheckoutData = z.infer<typeof checkoutSchema>
export type ContactData = z.infer<typeof contactSchema>
export type ProductData = z.infer<typeof productSchema>
export type CategoryData = z.infer<typeof categorySchema>
export type CouponData = z.infer<typeof couponSchema>
export type LoginData = z.infer<typeof loginSchema>
