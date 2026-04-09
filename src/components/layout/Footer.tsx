import Link from 'next/link'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256700000000'
  const whatsappMessage = encodeURIComponent('Hi, I\'m interested in your perfumes')
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`

  return (
    <footer className="bg-bg-secondary border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
              JUST<span className="text-accent-gold">PERFUMES</span>
            </Link>
            <p className="mt-4 text-text-secondary text-sm leading-relaxed max-w-sm">
              Uganda's premier luxury perfume destination. Authentic fragrances sourced from 
              the world's finest perfume houses. Every scent tells a story.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                  text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                  text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                  text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-wider text-accent-gold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[['Shop All', '/products'], ['Men', '/products?category=men'],
                ['Women', '/products?category=women'], ['Gift Sets', '/products?category=gift-sets'],
                ['About Us', '/about'], ['FAQ', '/faq']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-wider text-accent-gold mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <a href={whatsappLink} className="hover:text-accent-gold transition-colors">
                  +256 700 000 000
                </a>
              </li>
              <li>info@justperfumes.ug</li>
              <li>Kampala, Uganda</li>
            </ul>
            <div className="mt-6 p-4 bg-bg-tertiary rounded-lg border border-border">
              <p className="text-xs text-text-secondary leading-relaxed">
                💰 <strong className="text-text-primary">Cash on Delivery</strong> available across Uganda
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} JustPerfumes. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-text-secondary">
            <Link href="/privacy" className="hover:text-accent-gold transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent-gold transition-colors">Terms of Service</Link>
            <Link href="/returns" className="hover:text-accent-gold transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
