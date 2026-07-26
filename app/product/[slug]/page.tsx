import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import StoreShell from '@/components/store/StoreShell'
import ProductDetailClient from './ProductDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    })
    if (!product) return { title: 'Product Not Found' }
    return {
      title: product.name,
      description: product.description.slice(0, 160),
      openGraph: { title: product.name, description: product.description.slice(0, 160) },
    }
  } catch {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: { where: { isVisible: true }, orderBy: { createdAt: 'desc' } },
      },
    })

    if (!product) notFound()

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, status: 'ACTIVE', NOT: { id: product.id } },
      include: { category: true, images: { take: 2, orderBy: { sortOrder: 'asc' } } },
      take: 4,
    })

    return (
      <StoreShell>
        <ProductDetailClient
          product={JSON.parse(JSON.stringify(product))}
          related={JSON.parse(JSON.stringify(related))}
        />
      </StoreShell>
    )
  } catch {
    notFound()
  }
}
