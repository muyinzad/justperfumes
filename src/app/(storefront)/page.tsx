import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/product/ProductCard'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { Shield, Truck, RotateCcw, MessageCircle } from 'lucide-react'

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
}

async function getBestsellers() {
  return prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    take: 6,
    orderBy: { price: 'desc' },
  })
}

const CATEGORIES = [
  { name: 'For Him', slug: 'men', emoji: '🧴', desc: 'Bold, confident scents' },
  { name: 'For Her', slug: 'women', emoji: '🌸', desc: 'Elegant, timeless fragrances' },
  { name: 'Unisex', slug: 'unisex', emoji: '✨', desc: 'Scent knows no gender' },
  { name: 'Gift Sets', slug: 'gift-sets', emoji: '🎁', desc: 'Perfect for any occasion' },
]

export default async function HomePage() {
  const [featured, bestsellers] = await Promise.all([getFeaturedProducts(), getBestsellers()])

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256700000000'
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-[85vh] flex items-center grain-overlay overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-primary to-bg-secondary" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="max-w-2xl stagger-fade-up">
              <p className="text-accent-gold text-sm uppercase tracking-[0.2em] font-medium mb-4">
                Uganda's Finest
              </p>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
                Where Scent<br />
                <span className="text-accent-gold">Meets Soul</span>
              </h1>
              <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10 max-w-md">
                Discover authentic luxury fragrances from the world's most prestigious perfume houses.
                Delivered to your doorstep across Uganda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="px-8 py-4 bg-accent-gold text-bg-primary font-semibold rounded-lg
                    hover:bg-accent-gold-lt transition-all duration-200 text-center"
                >
                  Explore Collection
                </Link>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-accent-gold text-accent-gold font-semibold rounded-lg
                    hover:bg-accent-gold/10 transition-all duration-200 text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat With Us
                </a>
              </div>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-5">
            <Image src="/hero-perfume.jpg" alt="" fill className="object-cover" />
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">Shop by Category</h2>
              <p className="text-text-secondary">Find the perfect fragrance for every moment</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-fade-up">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group p-6 bg-bg-tertiary rounded-xl border border-border
                    hover:border-accent-gold/40 transition-all duration-200 text-center"
                >
                  <span className="text-4xl mb-3 block">{cat.emoji}</span>
                  <h3 className="font-body font-semibold text-text-primary mb-1 group-hover:text-accent-gold transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-text-secondary">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featured.length > 0 && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-accent-gold text-sm uppercase tracking-wider mb-2">New Arrivals</p>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold">Latest Fragrances</h2>
                </div>
                <Link href="/products" className="text-sm text-accent-gold hover:text-accent-gold-lt transition-colors hidden sm:block">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 stagger-fade-up">
                {featured.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/products" className="text-sm text-accent-gold hover:text-accent-gold-lt transition-colors">
                  View all →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Bestsellers */}
        {bestsellers.length > 0 && (
          <section className="py-20 bg-bg-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-accent-gold text-sm uppercase tracking-wider mb-2">Most Loved</p>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold">Bestsellers</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 stagger-fade-up">
                {bestsellers.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust Badges */}
        <section className="py-16 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: '100% Authentic', desc: 'Every product sourced directly from authorized dealers' },
                { icon: Truck, title: 'Fast Delivery', desc: 'Same-day delivery in Kampala, 2-3 days across Uganda' },
                { icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free return policy' },
                { icon: MessageCircle, title: 'COD Available', desc: 'Pay when you receive your order' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="w-12 h-12 rounded-full border border-accent-gold/30 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-accent-gold" />
                  </div>
                  <h4 className="font-body font-semibold text-sm mb-1">{title}</h4>
                  <p className="text-xs text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
