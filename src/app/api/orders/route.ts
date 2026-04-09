import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, total, notes } = body

    if (!customer?.name || !customer?.phone || !customer?.address || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create or find customer
    let dbCustomer = await prisma.customer.findFirst({
      where: { phone: customer.phone },
    })

    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          address: customer.address,
          notes: customer.notes || null,
        },
      })
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: dbCustomer.id,
        total,
        notes: notes || null,
        items: {
          create: items.map((item: { productId: string; quantity: number; priceAt: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAt: item.priceAt,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
