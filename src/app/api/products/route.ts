import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { getCached, setCached, delCached } from '@/lib/cache'

const LIST_TTL = 60 // 1 minute
const PRODUCT_TTL = 300 // 5 minutes

function listCacheKey(params: URLSearchParams): string {
  const parts: string[] = []
  for (const [k, v] of params) {
    if (v) parts.push(`${k}=${v}`)
  }
  return 'products:list:' + parts.join('&')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cacheKey = listCacheKey(searchParams)

  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { 'X-Cache': 'HIT' }
    })
  }

  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '24')
  const q = searchParams.get('q')
  const category = searchParams.get('category')
  const brand = searchParams.get('brand')
  const sort = searchParams.get('sort') || 'name'
  const active = searchParams.get('active')

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (category) where.category = { slug: category }
  if (brand) where.brand = brand
  if (active !== null) where.active = active === 'true'

  const orderBy: Record<string, string> = {}
  switch (sort) {
    case 'price-asc': orderBy.price = 'asc'; break
    case 'price-desc': orderBy.price = 'desc'; break
    case 'newest': orderBy.createdAt = 'desc'; break
    default: orderBy.name = 'asc'
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ])

  const result = { products, total, page, perPage, totalPages: Math.ceil(total / perPage) }

  // Cache the result
  await setCached(cacheKey, JSON.stringify(result), LIST_TTL)

  return NextResponse.json(result, {
    headers: { 'X-Cache': 'MISS' }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, brand, size, price, description, imageUrl, sourceUrl, categoryId, stock } = body

    if (!name || !brand || !size || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const slug = slugify(`${name}-${size}`)
    const existing = await prisma.product.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const product = await prisma.product.create({
      data: {
        name, brand, size, price,
        description: description || null,
        imageUrl: imageUrl || null,
        sourceUrl: sourceUrl || null,
        categoryId: categoryId || null,
        stock: stock || 0,
        slug: finalSlug,
      },
    })

    // Invalidate list caches
    await delCached('products:list:*')

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}