interface OrderNotifyParams {
  orderNumber: string
  customerName: string
  customerPhone: string
  items: Array<{ name: string; quantity: number; priceAt: number }>
  total: number
  notes?: string | null
}

/**
 * Sends WhatsApp notification to admin on new order.
 * Uses WhatsApp click-to-chat link since no Business API credentials are configured.
 * Full automation (sending without clicking) requires WhatsApp Business API setup.
 */
export async function notifyAdminNewOrder(order: OrderNotifyParams): Promise<void> {
  const adminNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256700000000'
  const cleaned = adminNumber.replace(/\D/g, '')
  
  const itemsList = order.items
    .map(i => `• ${i.name} x${i.quantity} @ ${formatPrice(order.total)}`)
    .join('\n')
  
  const message = [
    `🛒 *NEW ORDER: #${order.orderNumber}*`,
    ``,
    `👤 Customer: ${order.customerName}`,
    `📞 Phone: ${order.customerPhone}`,
    ``,
    `📦 Items:`,
    itemsList,
    ``,
    `💰 Total: ${formatPrice(order.total)}`,
    order.notes ? `\n📝 Notes: ${order.notes}` : '',
    ``,
    `🔗 View in admin: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://justperfumes.ug'}/admin/orders`,
  ].filter(Boolean).join('\n')

  const encoded = encodeURIComponent(message)
  const whatsappLink = `https://wa.me/${cleaned}?text=${encoded}`

  // Log the notification (in production, hook this to a webhook or email)
  console.log(`[OrderNotification] New order ${order.orderNumber} - WhatsApp link: ${whatsappLink}`)
  
  // For now, store the link in Redis so admin can retrieve it
  // In a full implementation, you'd send this via WhatsApp Business API
  try {
    const { redis } = await import('@/lib/cache')
    await redis.setex(`pending-notification:${order.orderNumber}`, 86400, whatsappLink)
  } catch {
    // non-critical if Redis is down
  }
}

function formatPrice(amount: number): string {
  return 'USh ' + amount.toLocaleString('en-US')
}
