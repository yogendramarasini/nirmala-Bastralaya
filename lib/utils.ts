import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { randomBytes } from 'node:crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return `NPR ${num.toLocaleString('en-NP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(5).toString('hex').toUpperCase()
  return `NB-${timestamp}-${random}`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function calculateDiscount(price: number, salePrice: number): number {
  if (salePrice >= price) return 0
  return Math.round(((price - salePrice) / price) * 100)
}

export function getImageUrl(path: string): string {
  if (!path) return '/images/placeholder.jpg'
  if (path.startsWith('http')) return path
  return path
}
