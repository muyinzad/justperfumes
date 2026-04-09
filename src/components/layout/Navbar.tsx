'use client'

import Link from 'next/link'
import { Search, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Navbar() {
  const { totalItems, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <nav className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-xl md:text-2xl font-semibold text-text-primary tracking-tight">
                JUST<span className="text-accent-gold">PERFUMES</span>
              </span>
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg
                    text-text-primary placeholder:text-text-secondary text-sm
                    focus:outline-none focus:border-accent-gold transition-colors"
                />
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                Shop
              </Link>
              <Link href="/products?category=men" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                Men
              </Link>
              <Link href="/products?category=women" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                Women
              </Link>
              <Link href="/products?category=gift-sets" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                Gift Sets
              </Link>
            </div>

            {/* Cart + Mobile menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={openCart}
                className="relative p-2 text-text-secondary hover:text-accent-gold transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-gold text-bg-primary
                    text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-text-secondary"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {mobileOpen && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg
                    text-text-primary placeholder:text-text-secondary text-sm
                    focus:outline-none focus:border-accent-gold"
                />
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/products" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-accent-gold text-sm">Shop All</Link>
                <Link href="/products?category=men" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-accent-gold text-sm">Men</Link>
                <Link href="/products?category=women" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-accent-gold text-sm">Women</Link>
                <Link href="/products?category=gift-sets" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-accent-gold text-sm">Gift Sets</Link>
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-accent-gold text-sm">Admin</Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      <CartDrawer />
    </>
  )
}
