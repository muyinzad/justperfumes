import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Clock, Truck, Package, MessageCircle } from 'lucide-react'
import Image from 'next/image'

const STATUS_CONFIG = {
  PENDING: { label: 'Order Placed', icon: Clock, color: 'text-yellow-500' },
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-orange-500' },
  DELIVERED: { label: 'Delivered', icon: Package, color: 'text-success' },
  CANCELLED: { label: 'Cancelled', icon: X, color: 'text-error' },
}

function X(props: { className?: string }) { return <span {...props}>✕</span> }

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, items: { include: { product: true } } },
  })
  if (!order) notFound()

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256700000000'
  const trackingText = encodeURIComponent(`Hi, I'm checking on my order ${order.orderNumber}`)
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${trackingText}`

  const statusIndex = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].indexOf(order.status)
  const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Success header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-text-secondary">
              Thank you, {order.customer.name}. We'll begin processing your order shortly.
            </p>
          </div>

          {/* Order number */}
          <div className="bg-bg-secondary rounded-xl p-6 border border-border mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary text-sm">Order Number</span>
              <span className="font-mono font-bold text-accent-gold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Date</span>
              <span>{new Date(order.createdAt).toLocaleDateString('en-UG', { dateStyle: 'long' })}</span>
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-bg-secondary rounded-xl p-6 border border-border mb-6">
            <h2 className="font-semibold mb-6">Order Status</h2>
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
                <div
                  className="h-full bg-accent-gold transition-all duration-500"
                  style={{ width: `${(statusIndex / (steps.length - 1)) * 100}%` }}
                />
              </div>
              {steps.map((step, i) => {
                const config = STATUS_CONFIG[step as keyof typeof STATUS_CONFIG]
                const Icon = config.icon
                const isActive = i <= statusIndex
                return (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-accent-gold text-bg-primary' : 'bg-bg-tertiary text-text-secondary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs ${isActive ? 'text-accent-gold' : 'text-text-secondary'}`}>
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items */}
          <div className="bg-bg-secondary rounded-xl p-6 border border-border mb-6">
            <h2 className="font-semibold mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-bg-tertiary flex-shrink-0">
                    {item.product.imageUrl
                      ? <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="object-cover w-full h-full" />
                      : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">✨</div>
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-text-secondary">{item.product.size} × {item.quantity}</p>
                    <p className="text-sm font-mono font-semibold text-accent-gold">
                      {formatPrice(item.priceAt * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold">
              <span>Total</span>
              <span className="text-accent-gold font-mono">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="bg-bg-secondary rounded-xl p-6 border border-border mb-6">
            <h2 className="font-semibold mb-3">Delivery Details</h2>
            <p className="text-sm text-text-secondary">{order.customer.name}</p>
            <p className="text-sm text-text-secondary">{order.customer.phone}</p>
            <p className="text-sm text-text-secondary mt-1">{order.customer.address}</p>
            {order.notes && <p className="text-sm text-text-secondary mt-2 italic">"{order.notes}"</p>}
          </div>

          {/* WhatsApp tracking */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 border-2 border-[#25D366] text-[#25D366] rounded-lg
              font-semibold flex items-center justify-center gap-2 hover:bg-[#25D366]/10 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Track My Order on WhatsApp
          </a>

          <div className="text-center mt-6">
            <a href="/products" className="text-sm text-accent-gold hover:text-accent-gold-lt">
              Continue Shopping →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
