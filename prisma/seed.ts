// @ts-nocheck
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || ''
  if (!adminEmail || !adminEmail.includes('@')) {
    throw new Error('ADMIN_EMAIL must be set to a valid email address before seeding')
  }
  if (adminPassword.length < 14 || /^(admin|password|change)/i.test(adminPassword)) {
    throw new Error('ADMIN_PASSWORD must be a unique password of at least 14 characters')
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: { email: adminEmail, password: hashedPassword, name: 'Admin', role: 'SUPER_ADMIN' },
  })
  console.log('✅ Admin user:', admin.email)

  const defaultSettings = [
    { key: 'store_name', value: 'Nirmala Bastralaya' },
    { key: 'store_phone', value: '079-520658' },
    { key: 'store_whatsapp', value: '9779857027929' },
    { key: 'store_email', value: 'nirmalavastralya@gmail.com' },
    { key: 'store_address', value: 'Tamghas, Resunga Municipality, Gulmi, Nepal' },
    { key: 'social_facebook', value: '' },
    { key: 'social_instagram', value: '' },
    { key: 'qr_FONEPAY', value: '/images/payment/fonepay-qr.png' },
  ]
  for (const s of defaultSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s })
  }
  console.log('✅ Settings created')

  const categoryData = [
    { name: 'Sarees', slug: 'sarees', description: 'Traditional and modern sarees', sortOrder: 1 },
    { name: 'Marriage Dresses', slug: 'marriage-dresses', description: 'Bridal and wedding outfits', sortOrder: 2 },
    { name: 'Traditional Clothing', slug: 'traditional', description: 'Traditional cultural attire', sortOrder: 3 },
    { name: 'T-Shirts & Pants', slug: 't-shirts-pants', description: 'Casual everyday wear', sortOrder: 4 },
    { name: 'Coat Pants', slug: 'coat-pants', description: 'Formal wear', sortOrder: 5 },
    { name: 'Shoes', slug: 'shoes', description: 'Footwear for all ages', sortOrder: 6 },
    { name: 'Bags', slug: 'bags', description: 'Handbags and backpacks', sortOrder: 7 },
    { name: 'Cremation Clothes', slug: 'cremation-clothes', description: 'Traditional cremation attire', sortOrder: 8 },
    { name: 'Quilts & Bedding', slug: 'quilts-bedding', description: 'Home textiles', sortOrder: 9 },
    { name: 'Seasonal Collection', slug: 'seasonal', description: 'Seasonal picks', sortOrder: 10 },
  ]

  const blockedCategorySlugs = [
    'jewellery', 'jewelry', 'jhumka', 'jhumkas', 'necklace', 'necklaces',
    'bangles', 'earrings', 'bracelets', 'rings', 'bijoux',
  ]
  await prisma.product.updateMany({
    where: { category: { slug: { in: blockedCategorySlugs } } },
    data: { status: 'INACTIVE', isFeatured: false, isNew: false },
  })
  await prisma.category.updateMany({
    where: { slug: { in: blockedCategorySlugs } },
    data: { isActive: false },
  })

  const categories: Record<string, any> = {}
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categories[cat.slug] = c
  }
  console.log('✅ Categories:', Object.keys(categories).length)

  const products = [
    { name: 'Premium Banarasi Silk Saree', slug: 'premium-banarasi-silk-saree', sku: 'SAR-001', description: 'Exquisite Banarasi silk saree with intricate gold zari work. Perfect for weddings and festive occasions. Reflects centuries of craftsmanship.', categorySlug: 'sarees', price: 8500, salePrice: 7200, quantity: 15, isNew: true, isFeatured: true },
    { name: 'Chiffon Party Saree', slug: 'chiffon-party-saree', sku: 'SAR-002', description: 'Lightweight chiffon saree ideal for parties and social gatherings. Available in beautiful pastel shades with delicate embroidery.', categorySlug: 'sarees', price: 3500, salePrice: null, quantity: 20, isNew: false, isFeatured: true },
    { name: 'Bridal Lehenga Set', slug: 'bridal-lehenga-set', sku: 'WED-001', description: 'Stunning bridal lehenga with heavy embroidery and mirror work. Comes with matching blouse and dupatta. Perfect for weddings.', categorySlug: 'marriage-dresses', price: 25000, salePrice: 22000, quantity: 5, isNew: true, isFeatured: true },
    { name: 'Traditional Daura Suruwal', slug: 'traditional-daura-suruwal', sku: 'TRD-001', description: 'Authentic Nepali daura suruwal set made from premium cotton. Perfect for cultural events and formal occasions.', categorySlug: 'traditional', price: 4500, salePrice: null, quantity: 30, isNew: false, isFeatured: true },
    { name: "Men's Premium Polo T-Shirt", slug: 'mens-premium-polo-tshirt', sku: 'TSH-001', description: 'Premium quality polo t-shirt from 100% cotton pique fabric. Comfortable fit with ribbed collar and cuffs.', categorySlug: 't-shirts-pants', price: 850, salePrice: 699, quantity: 50, isNew: true, isFeatured: false },
    { name: "Women's Formal Trouser", slug: 'womens-formal-trouser', sku: 'PNT-001', description: 'Elegant formal trousers for women with comfortable straight fit. Made from premium stretch fabric.', categorySlug: 't-shirts-pants', price: 1200, salePrice: null, quantity: 25, isNew: false, isFeatured: false },
    { name: 'Ladies Block Heel Sandals', slug: 'ladies-block-heel-sandals', sku: 'SHO-001', description: 'Elegant block heel sandals with cushioned insole. Perfect for casual and formal occasions.', categorySlug: 'shoes', price: 1800, salePrice: 1499, quantity: 18, isNew: false, isFeatured: true },
    { name: 'Designer Tote Bag', slug: 'designer-tote-bag', sku: 'BAG-001', description: 'Spacious tote bag for daily use. Made from premium vegan leather with multiple compartments.', categorySlug: 'bags', price: 2200, salePrice: null, quantity: 12, isNew: true, isFeatured: false },
    { name: 'Premium Cotton Quilt', slug: 'premium-cotton-quilt', sku: 'QUI-001', description: 'Warm and cozy premium cotton quilt. Reversible design with beautiful patterns on both sides.', categorySlug: 'quilts-bedding', price: 3200, salePrice: 2699, quantity: 20, isNew: false, isFeatured: false },
    { name: "Men's Formal Suit", slug: 'mens-formal-suit', sku: 'CPT-001', description: 'Sharp formal suit for men. Crafted from premium wool-blend fabric. Complete 2-piece set.', categorySlug: 'coat-pants', price: 12000, salePrice: 10500, quantity: 8, isNew: true, isFeatured: true },
    { name: "Classic Three-Piece Coat Pant", slug: 'classic-three-piece-coat-pant', sku: 'CPT-002', description: 'A refined three-piece coat pant set with waistcoat, tailored for weddings, receptions, and formal celebrations.', categorySlug: 'coat-pants', price: 14500, salePrice: 12900, quantity: 6, isNew: true, isFeatured: true },
    { name: "Boys' Celebration Coat Pant", slug: 'boys-celebration-coat-pant', sku: 'CPT-003', description: 'Comfortable formal coat pant set for boys, designed for weddings, school programs, and family occasions.', categorySlug: 'coat-pants', price: 4800, salePrice: 4200, quantity: 12, isNew: true, isFeatured: false },
  ]

  for (const p of products) {
    const { categorySlug, ...data } = p
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, categoryId: categories[categorySlug].id, status: 'ACTIVE', tags: [] },
    })

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } })
    if (!existingImage) {
      const imageByCategory: Record<string, string> = {
        sarees: '/images/editorial/hero-saree.webp',
        'marriage-dresses': '/images/editorial/nirmala-model-pink.webp',
        traditional: '/images/editorial/hero-saree.webp',
        't-shirts-pants': '/images/editorial/product-collection.webp',
        'coat-pants': '/images/editorial/product-collection.webp',
        shoes: '/images/editorial/product-collection.webp',
        bags: '/images/editorial/product-collection.webp',
        'quilts-bedding': '/images/editorial/hero-saree.webp',
      }
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageByCategory[categorySlug] || '/images/editorial/product-collection.webp',
          alt: p.name,
          sortOrder: 0,
        },
      })
    }
  }
  console.log('✅ Products:', products.length)

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderAmount: 1000, maxUses: 100, startDate: new Date(), endDate: new Date(Date.now() + 365*24*60*60*1000), isActive: true },
  })
  console.log('✅ Coupon: WELCOME10 (10% off)')

  console.log('\n🎉 Seed complete!')
  console.log('Admin account configured from environment variables')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
