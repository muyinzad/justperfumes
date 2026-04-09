'use client'

import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-bg-secondary border-l border-border
        flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl font-semibold">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <ShoppingBag className="w-12 h-12 text-text-secondary opacity-40" />
            <p className="text-text-secondary text-center">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="text-sm text-accent-gold hover:text-accent-gold-lt transition-colors"
            >
              Continue shopping →
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.map(item => (
                <div key={item.productId} className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-bg-tertiary flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={80} height={80}
                        className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg opacity-30">✨</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary uppercase tracking-wider">{item.brand}</p>
                    <h4 className="text-sm font-medium text-text-primary truncate">{item.name}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-sm font-semibold text-accent-gold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center
                            text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center
                            text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="ml-1 text-text-secondary hover:text-error transition-colors text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total</span>
                <span className="font-mono text-xl font-bold text-accent-gold">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 bg-accent-gold text-bg-primary font-semibold rounded-lg
                  flex items-center justify-center gap-2 hover:bg-accent-gold-lt transition-colors"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={closeCart}
                className="w-full py-2 text-sm text-text-secondary hover:text-accent-gold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
