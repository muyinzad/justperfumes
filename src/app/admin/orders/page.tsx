'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { Eye, CheckCircle } from 'lucide-react'

interface Order {
  id: string; orderNumber: string; total: number; status: string; createdAt: string
  customer: { name: string; phone: string; address: string }
  items: { id: string; quantity: number; priceAt: number; product: { name: string; size: string } }[]
}

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const res = await fetch('/api/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchOrders()
    if (selected) setSelected({ ...selected, status })
  }

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <div className="flex gap-2">
          {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map(s => (
            <button key={s} onClick={() => setFilter(filter === s ? '' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s ? 'bg-accent-gold text-bg-primary' : 'border border-border text-text-secondary hover:border-accent-gold hover:text-accent-gold'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-secondary">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">No orders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-text-secondary font-medium">Order #</th>
                <th className="text-left p-4 text-text-secondary font-medium">Customer</th>
                <th className="text-left p-4 text-text-secondary font-medium">Items</th>
                <th className="text-left p-4 text-text-secondary font-medium">Total</th>
                <th className="text-left p-4 text-text-secondary font-medium">Status</th>
                <th className="text-left p-4 text-text-secondary font-medium">Date</th>
                <th className="text-right p-4 text-text-secondary font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-bg-tertiary/30 transition-colors">
                  <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-text-secondary">{order.customer.phone}</p>
                  </td>
                  <td className="p-4 text-text-secondary">{order.items.length} item(s)</td>
                  <td className="p-4 font-mono text-accent-gold">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 focus:outline-none ${
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'SHIPPED' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'DELIVERED' ? 'bg-success/20 text-success' :
                        'bg-error/20 text-error'
                      }`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-text-secondary">{new Date(order.createdAt).toLocaleDateString('en-UG')}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelected(order)} className="p-2 text-text-secondary hover:text-accent-gold transition-colors"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-secondary rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <p className="font-mono text-sm text-accent-gold">{selected.orderNumber}</p>
                <p className="text-xs text-text-secondary mt-0.5">{new Date(selected.createdAt).toLocaleString('en-UG')}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-text-secondary hover:text-text-primary">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-accent-gold font-semibold mb-2">Customer</h3>
                <p className="text-sm font-medium">{selected.customer.name}</p>
                <p className="text-sm text-text-secondary">{selected.customer.phone}</p>
                <p className="text-sm text-text-secondary">{selected.customer.address}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wider text-accent-gold font-semibold mb-2">Items</h3>
                {selected.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span className="font-mono text-accent-gold">{formatPrice(item.priceAt * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span className="font-mono text-accent-gold">{formatPrice(selected.total)}</span>
                </div>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wider text-accent-gold font-semibold mb-2">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => { updateStatus(selected.id, s); setSelected({ ...selected, status: s }) }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selected.status === s ? 'bg-accent-gold text-bg-primary' : 'border border-border text-text-secondary hover:border-accent-gold hover:text-accent-gold'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
