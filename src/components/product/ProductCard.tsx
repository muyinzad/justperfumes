'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@prisma/client'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      size: product.size,
      price: product.price,
      imageUrl: product.imageUrl,
    })
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border
        transition-all duration-200 group-hover:border-accent-gold/30 group-hover:shadow-lg
        group-hover:shadow-accent-gold/5 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-bg-tertiary overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl opacity-20">✨</span>
            </div>
          )}
          {/* Overlay add to cart */}
          {product.active && product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-accent-gold
                flex items-center justify-center opacity-0 group-hover:opacity-100
                transition-all duration-200 hover:bg-accent-gold-lt hover:scale-110
                shadow-lg shadow-accent-gold/30"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4 text-bg-primary" />
            </button>
          )}
          {!product.active || product.stock <= 0 ? (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-bg-primary/90 text-text-secondary text-xs rounded">
                Out of Stock
              </span>
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="font-body font-medium text-sm text-text-primary line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">{product.size}</span>
            <span className="font-mono text-sm font-semibold text-accent-gold">
              {formatPrice(product.price)}
            </span>
          </div>
          {/* Mobile add to cart — always visible */}
          {product.active && product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="md:hidden w-full mt-3 py-2 bg-accent-gold text-bg-primary text-sm
                font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-accent-gold-lt transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
