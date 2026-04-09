import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react'

export default async function AdminDashboard() {
  const [orderCount, productCount, pendingOrders, recentOrders, thisMonthRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { total: true },
    }),
  ])

  const stats = [
    { label: 'Total Products', value: productCount.toString(), icon: Package, color: 'text-blue-400' },
    { label: 'Pending Orders', value: pendingOrders.toString(), icon: Clock, color: 'text-yellow-400' },
    { label: 'Total Orders', value: orderCount.toString(), icon: ShoppingBag, color: 'text-purple-400' },
    { label: 'Revenue (This Month)', value: formatPrice(thisMonthRevenue._sum.total || 0), icon: TrendingUp, color: 'text-success' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-bg-secondary rounded-xl p-5 border border-border">
            <div className={`${color} mb-3`}><Icon className="w-6 h-6" /></div>
            <p className="text-2xl font-bold font-mono mb-1">{value}</p>
            <p className="text-xs text-text-secondary">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent-gold hover:text-accent-gold-lt">
            View all →
          </Link>
        </div>
        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">No orders yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-text-secondary font-medium">Order</th>
                  <th className="text-left p-4 text-text-secondary font-medium">Customer</th>
                  <th className="text-left p-4 text-text-secondary font-medium">Total</th>
                  <th className="text-left p-4 text-text-secondary font-medium">Status</th>
                  <th className="text-left p-4 text-text-secondary font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-bg-tertiary/50 transition-colors">
                    <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                    <td className="p-4">{order.customer.name}</td>
                    <td className="p-4 font-mono text-accent-gold">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'SHIPPED' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'DELIVERED' ? 'bg-success/20 text-success' :
                        'bg-error/20 text-error'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString('en-UG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
