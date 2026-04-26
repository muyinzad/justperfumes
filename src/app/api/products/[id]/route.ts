import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCached, setCached } from '@/lib/cache'

const PRODUCT_TTL = 300 // 5 minutes

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cacheKey = 'products:detail:' + params.id

  const cached = await getCached(cacheKey)
  if (cached) {
    return NextResponse.json(JSON.parse(cached), { headers: { 'X-Cache': 'HIT' } })
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await setCached(cacheKey, JSON.stringify(product), PRODUCT_TTL)

  return NextResponse.json(product, { headers: { 'X-Cache': 'MISS' } })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, brand, size, price, description, imageUrl, sourceUrl, categoryId, stock, active } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand }),
        ...(size !== undefined && { size }),
        ...(price !== undefined && { price }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(sourceUrl !== undefined && { sourceUrl }),
        ...(categoryId !== undefined && { categoryId }),
        ...(stock !== undefined && { stock }),
        ...(active !== undefined && { active }),
      },
    })

    // Invalidate detail cache
    const { delCached } = await import('@/lib/cache')
    await delCached('products:detail:' + params.id)
    await delCached('products:list:*')

    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } })

    // Invalidate caches
    const { delCached } = await import('@/lib/cache')
    await delCached('products:detail:' + params.id)
    await delCached('products:list:*')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}