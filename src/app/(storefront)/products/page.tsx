export const revalidate = 60

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/product/ProductCard'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SlidersHorizontal, X } from 'lucide-react'

interface SearchParams {
  q?: string
  category?: string
  brand?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
}

async function getProducts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const perPage = 24

  const where: Record<string, unknown> = { active: true }

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { brand: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }
  if (searchParams.category) {
    where.category = { slug: searchParams.category }
  }
  if (searchParams.brand) {
    where.brand = searchParams.brand
  }
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {}
    if (searchParams.minPrice) (where.price as Record<string, number>).gte = parseInt(searchParams.minPrice)
    if (searchParams.maxPrice) (where.price as Record<string, number>).lte = parseInt(searchParams.maxPrice)
  }

  const orderBy: Record<string, string> = {}
  switch (searchParams.sort) {
    case 'price-asc': orderBy.price = 'asc'; break
    case 'price-desc': orderBy.price = 'desc'; break
    case 'newest': orderBy.createdAt = 'desc'; break
    default: orderBy.name = 'asc'
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const brands = await prisma.product.groupBy({
    by: ['brand'],
    where: { active: true },
    _count: true,
    orderBy: { _count: { brand: 'desc' } },
    take: 20,
  })

  return { products, total, categories, brands, page, perPage }
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { products, total, categories, brands, page, perPage } = await getProducts(searchParams)
  const totalPages = Math.ceil(total / perPage)

  const hasFilters = searchParams.q || searchParams.category || searchParams.brand ||
    searchParams.minPrice || searchParams.maxPrice

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <div className="bg-bg-secondary border-b border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
              {searchParams.category
                ? categories.find(c => c.slug === searchParams.category)?.name || 'Shop'
                : searchParams.q ? `Results for "${searchParams.q}"` : 'All Fragrances'}
            </h1>
            <p className="text-text-secondary text-sm">
              {total} {total === 1 ? 'product' : 'products'} found
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="md:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Clear filters */}
                {hasFilters && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Active Filters</span>
                    <Link href="/products" className="text-xs text-accent-gold hover:text-accent-gold-lt flex items-center gap-1">
                      <X className="w-3 h-3" /> Clear all
                    </Link>
                  </div>
                )}

                {/* Search */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-accent-gold mb-3 font-semibold">Search</h3>
                  <form method="GET" action="/products">
                    <input
                      type="text"
                      name="q"
                      defaultValue={searchParams.q}
                      placeholder="Product or brand..."
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg
                        text-text-primary text-sm placeholder:text-text-secondary
                        focus:outline-none focus:border-accent-gold"
                    />
                    {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
                    <button type="submit" className="mt-2 w-full py-2 bg-accent-gold text-bg-primary text-sm font-medium rounded-lg">
                      Search
                    </button>
                  </form>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-accent-gold mb-3 font-semibold">Category</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/products" className={`text-sm ${!searchParams.category ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'}`}>
                        All Products
                      </Link>
                    </li>
                    {categories.map(cat => (
                      <li key={cat.id}>
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className={`text-sm ${searchParams.category === cat.slug ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-accent-gold mb-3 font-semibold">Brand</h3>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {brands.map(b => (
                      <li key={b.brand}>
                        <Link
                          href={`/products?brand=${encodeURIComponent(b.brand)}`}
                          className={`text-sm flex justify-between ${searchParams.brand === b.brand ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                          <span>{b.brand}</span>
                          <span className="text-xs opacity-60">{b._count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-accent-gold mb-3 font-semibold">Price Range</h3>
                  <form method="GET" action="/products" className="space-y-2">
                    <input type="number" name="minPrice" placeholder="Min (UGX)"
                      defaultValue={searchParams.minPrice}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg
                        text-text-primary text-sm placeholder:text-text-secondary
                        focus:outline-none focus:border-accent-gold" />
                    <input type="number" name="maxPrice" placeholder="Max (UGX)"
                      defaultValue={searchParams.maxPrice}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg
                        text-text-primary text-sm placeholder:text-text-secondary
                        focus:outline-none focus:border-accent-gold" />
                    {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
                    {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
                    {searchParams.brand && <input type="hidden" name="brand" value={searchParams.brand} />}
                    <button type="submit" className="w-full py-2 bg-bg-tertiary border border-border text-text-primary text-sm rounded-lg hover:border-accent-gold transition-colors">
                      Apply
                    </button>
                  </form>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Sort by:</span>
                  {[
                    { label: 'Name', value: 'name' },
                    { label: 'Price: Low', value: 'price-asc' },
                    { label: 'Price: High', value: 'price-desc' },
                    { label: 'Newest', value: 'newest' },
                  ].map(s => (
                    <Link
                      key={s.value}
                      href={`/products?${new URLSearchParams({ ...searchParams, sort: s.value, page: '1' }).toString()}`}
                      className={`px-2 py-1 rounded text-xs ${searchParams.sort === s.value || (!searchParams.sort && s.value === 'name') ? 'bg-accent-gold text-bg-primary' : 'hover:text-accent-gold'}`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-text-secondary mb-4">No fragrances found matching your filters.</p>
                  <Link href="/products" className="text-accent-gold hover:text-accent-gold-lt text-sm">
                    Clear filters
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      {page > 1 && (
                        <Link href={`/products?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}
                          className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors">
                          ← Previous
                        </Link>
                      )}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = i + 1
                        return (
                          <Link key={p}
                            href={`/products?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
                            className={`px-4 py-2 rounded-lg text-sm ${page === p ? 'bg-accent-gold text-bg-primary' : 'border border-border text-text-secondary hover:border-accent-gold hover:text-accent-gold'}`}>
                            {p}
                          </Link>
                        )
                      })}
                      {page < totalPages && (
                        <Link href={`/products?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}
                          className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors">
                          Next →
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
