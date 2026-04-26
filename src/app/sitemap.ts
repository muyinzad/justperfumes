import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  })
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://justperfumes.ug'
  
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: baseUrl + '/products', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...products.map(p => ({
      url: baseUrl + '/products/' + p.slug,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
