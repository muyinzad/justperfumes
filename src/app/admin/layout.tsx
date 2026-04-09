import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { verifyToken } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  let isAdmin = false
  if (token) {
    const payload = await verifyToken(token)
    isAdmin = !!payload
  }

  if (!isAdmin) {
    redirect('/admin/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
  ]

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-5rem)] bg-bg-secondary border-r border-border hidden md:block">
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-accent-gold font-semibold mb-4">Admin</p>
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary
                    hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6 border-t border-border">
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                text-text-secondary hover:text-error hover:bg-error/10 transition-colors w-full">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-border">
          <div className="flex justify-around py-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 px-3 py-2 text-text-secondary">
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  )
}
