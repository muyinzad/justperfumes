import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
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

  return NextResponse.json({ products, total, page, perPage, totalPages: Math.ceil(total / perPage) })
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

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
