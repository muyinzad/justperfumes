'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@prisma/client'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  if (!product.active || product.stock <= 0) {
    return (
      <button
        disabled
        className="w-full py-3.5 bg-bg-tertiary text-text-secondary rounded-lg font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={() => addItem({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        size: product.size,
        price: product.price,
        imageUrl: product.imageUrl,
      })}
      className="w-full py-3.5 bg-accent-gold text-bg-primary rounded-lg font-semibold
        flex items-center justify-center gap-2 hover:bg-accent-gold-lt transition-colors"
    >
      <ShoppingBag className="w-5 h-5" />
      Add to Cart
    </button>
  )
}
