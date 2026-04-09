'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', notes: '', codConfirm: false,
  })

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary mb-4">Your cart is empty</p>
            <a href="/products" className="text-accent-gold hover:text-accent-gold-lt">Browse products →</a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.codConfirm) { setError('Please confirm Cash on Delivery'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, notes: form.notes },
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, priceAt: i.price })),
          total: totalPrice,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')
      clearCart()
      router.push(`/orders/${data.order.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 bg-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4">
                  <h2 className="font-semibold text-lg mb-2">Contact & Delivery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Full Name *</label>
                      <input required type="text" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg
                          text-text-primary placeholder:text-text-secondary
                          focus:outline-none focus:border-accent-gold transition-colors"
                        placeholder="Sarah Namuli" />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Phone Number *</label>
                      <input required type="tel" value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg
                          text-text-primary placeholder:text-text-secondary
                          focus:outline-none focus:border-accent-gold transition-colors"
                        placeholder="0700 000 000" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-text-secondary mb-1">Email (optional)</label>
                      <input type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg
                          text-text-primary placeholder:text-text-secondary
                          focus:outline-none focus:border-accent-gold transition-colors"
                        placeholder="sarah@email.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-text-secondary mb-1">Delivery Address *</label>
                      <input required type="text" value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg
                          text-text-primary placeholder:text-text-secondary
                          focus:outline-none focus:border-accent-gold transition-colors"
                        placeholder="Plot 12, Kampala Road, Kampala" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-text-secondary mb-1">Order Notes (optional)</label>
                      <textarea value={form.notes} rows={3}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg
                          text-text-primary placeholder:text-text-secondary
                          focus:outline-none focus:border-accent-gold transition-colors resize-none"
                        placeholder="Any special instructions..." />
                    </div>
                  </div>
                </div>

                <div className="bg-bg-secondary rounded-xl p-6 border border-border">
                  <div className="flex items-start gap-3">
                    <input required type="checkbox" id="cod" checked={form.codConfirm}
                      onChange={e => setForm({ ...form, codConfirm: e.target.checked })}
                      className="mt-1 w-4 h-4 accent-accent-gold" />
                    <label htmlFor="cod" className="text-sm text-text-secondary leading-snug">
                      I confirm that I will pay <strong className="text-text-primary">{formatPrice(totalPrice)}</strong> in cash
                      upon delivery. I understand that if I'm not available or refuse the order,
                      the delivery fee may be forfeited.
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-error text-sm p-4 bg-error/10 rounded-lg border border-error/30">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent-gold text-bg-primary font-semibold rounded-lg
                    hover:bg-accent-gold-lt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : `Place Order — ${formatPrice(totalPrice)}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-bg-secondary rounded-xl p-6 border border-border sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map(item => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-tertiary flex-shrink-0">
                        {item.imageUrl
                          ? <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                          : <div className="w-full h-full flex items-center justify-center text-lg opacity-30">✨</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                        <p className="text-sm font-mono font-semibold text-accent-gold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Delivery</span>
                    <span>Calculated at delivery</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-accent-gold font-mono">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
