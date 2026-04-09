import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/product/ProductCard'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBag, MessageCircle, Check } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import AddToCartButton from '@/components/product/AddToCartButton'

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })
}

async function getRelatedProducts(categoryId: string | null, excludeId: string) {
  return prisma.product.findMany({
    where: {
      active: true,
      stock: { gt: 0 },
      categoryId: categoryId ?? undefined,
      id: { not: excludeId },
    },
    take: 4,
  })
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.categoryId, product.id)

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256700000000'
  const whatsappText = encodeURIComponent(`Hi, I'm interested in ${product.name} (${product.size}) - ${product.price} UGX`)
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappText}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-secondary mb-8">
            <Link href="/" className="hover:text-accent-gold">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-accent-gold">Shop</Link>
            {product.category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-accent-gold">
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-text-primary">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="relative aspect-square bg-bg-secondary rounded-2xl overflow-hidden border border-border">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">✨</div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-accent-gold text-sm uppercase tracking-wider mb-2">{product.brand}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-text-secondary">{product.size}</span>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1 text-success text-sm">
                    <Check className="w-4 h-4" /> In Stock
                  </span>
                ) : (
                  <span className="text-error text-sm">Out of Stock</span>
                )}
              </div>

              <div className="font-mono text-3xl font-bold text-accent-gold mb-8">
                {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 })
                  .format(product.price)}
              </div>

              {product.description && (
                <p className="text-text-secondary leading-relaxed mb-8">{product.description}</p>
              )}

              <div className="space-y-3">
                <AddToCartButton product={product} />
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 border-2 border-[#25D366] text-[#25D366] rounded-lg
                    font-semibold flex items-center justify-center gap-2 hover:bg-[#25D366]/10 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enquire on WhatsApp
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 pt-8 border-t border-border space-y-3">
                {[
                  '100% Authentic — sourced from authorized dealers',
                  'Cash on Delivery available',
                  'Fast delivery across Uganda',
                  'Easy 7-day returns',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-accent-gold flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-2xl font-semibold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} className={className}>{children}</a>
}
