'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  salePrice: number | null
  image: string
  quantity: number
  slug: string
  stock: number
}

interface CartStore {
  items: CartItem[]
  couponCode: string
  couponDiscount: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  getSubtotal: () => number
  getTotal: () => number
  getTotalItems: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: '',
      couponDiscount: 0,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          if (existing.quantity >= item.stock) return
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, { ...item, quantity: 1 }] }))
        }
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }))
      },

      clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),

      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.salePrice ?? item.price
          return sum + price * item.quantity
        }, 0)
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        return Math.max(0, subtotal - get().couponDiscount)
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'nirmala-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
