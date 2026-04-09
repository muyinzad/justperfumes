'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string; name: string; brand: string; size: string; price: number
  description: string | null; imageUrl: string | null; stock: number; active: boolean
  category: { id: string; name: string } | null
}

interface Category { id: string; name: string }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', brand: '', size: '', price: '', description: '', imageUrl: '', stock: '', categoryId: '', active: true })

  useEffect(() => { fetchProducts(); fetchCategories() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch('/api/products?active=&perPage=100')
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  const openCreate = () => { setEditProduct(null); setForm({ name: '', brand: '', size: '', price: '', description: '', imageUrl: '', stock: '0', categoryId: '', active: true }); setShowModal(true) }
  const openEdit = (p: Product) => { setEditProduct(p); setForm({ name: p.name, brand: p.brand, size: p.size, price: String(p.price), description: p.description || '', imageUrl: p.imageUrl || '', stock: String(p.stock), categoryId: (p.category as {id:string}|null)?.id || '', active: p.active }); setShowModal(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, price: parseInt(form.price), stock: parseInt(form.stock) }
    const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
    const method = editProduct ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setShowModal(false)
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-bg-primary rounded-lg font-semibold text-sm hover:bg-accent-gold-lt transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input type="text" placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:border-accent-gold" />
      </div>

      {/* Table */}
      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-secondary">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            {search ? 'No products match your search.' : 'No products yet. Add your first one!'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-text-secondary font-medium">Product</th>
                <th className="text-left p-4 text-text-secondary font-medium">Brand</th>
                <th className="text-left p-4 text-text-secondary font-medium">Size</th>
                <th className="text-left p-4 text-text-secondary font-medium">Price</th>
                <th className="text-left p-4 text-text-secondary font-medium">Stock</th>
                <th className="text-left p-4 text-text-secondary font-medium">Status</th>
                <th className="text-right p-4 text-text-secondary font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-bg-tertiary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-tertiary flex-shrink-0">
                        {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="object-cover w-full h-full" /> : <span className="text-sm">✨</span>}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{p.brand}</td>
                  <td className="p-4 text-text-secondary">{p.size}</td>
                  <td className="p-4 font-mono text-accent-gold">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <span className={p.stock <= 0 ? 'text-error' : 'text-text-secondary'}>{p.stock}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-text-secondary hover:text-accent-gold transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-text-secondary hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-secondary rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold text-lg">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-secondary hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: 'Product Name *', key: 'name', placeholder: 'e.g. BOIS SIKAR' },
                { label: 'Brand *', key: 'brand', placeholder: 'e.g. ATELIER DES ORS' },
                { label: 'Size *', key: 'size', placeholder: 'e.g. 100ML' },
                { label: 'Price (UGX) *', key: 'price', placeholder: 'e.g. 1140850', type: 'number' },
                { label: 'Stock', key: 'stock', placeholder: '0', type: 'number' },
                { label: 'Image URL', key: 'imageUrl', placeholder: 'https://...' },
                { label: 'Description', key: 'description', placeholder: 'Optional description' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm text-text-secondary mb-1">{label}</label>
                  {key === 'description' ? (
                    <textarea value={String((form as Record<string, unknown>)[key])} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} rows={3}
                      className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:border-accent-gold resize-none" />
                  ) : (
                    <input type={type || 'text'} value={String((form as Record<string, unknown>)[key])} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                      className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:border-accent-gold" />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm text-text-secondary mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-gold">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-accent-gold" />
                <label htmlFor="active" className="text-sm text-text-secondary">Active (visible on store)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:border-text-secondary transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-accent-gold text-bg-primary rounded-lg font-semibold text-sm hover:bg-accent-gold-lt transition-colors">
                  {editProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
