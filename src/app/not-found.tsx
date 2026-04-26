import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className=min-h-[70vh] flex items-center justify-center px-4>
        <div className="text-center">
          <div className="text-8xl mb-6">🧴</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Scent Not Found</h1>
          <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
            This fragrance seems to have evaporated. Let&apos;s find you something equally captivating.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-6 py-3 bg-accent-gold text-bg-primary font-semibold rounded-lg hover:bg-accent-gold-lt transition-colors">
              Browse Collection
            </Link>
            <a href="https://wa.me/256700000000" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-accent-gold text-accent-gold font-semibold rounded-lg hover:bg-accent-gold/10 transition-colors">
              Chat With Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
