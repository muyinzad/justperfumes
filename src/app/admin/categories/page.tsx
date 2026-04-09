'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

interface Category { id: string; name: string; slug: string }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/categories')
    setCategories(await res.json())
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) })
    setNewName('')
    setShowModal(false)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    fetchCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Categories</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-bg-primary rounded-lg font-semibold text-sm hover:bg-accent-gold-lt transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-secondary">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">No categories yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-text-secondary font-medium">Name</th>
                <th className="text-left p-4 text-text-secondary font-medium">Slug</th>
                <th className="text-right p-4 text-text-secondary font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-border/50 hover:bg-bg-tertiary/30 transition-colors">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-text-secondary font-mono text-xs">{cat.slug}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(cat.id)} className="text-xs text-text-secondary hover:text-error transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-secondary rounded-xl border border-border w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold">Add Category</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-secondary hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Category Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Men"
                  className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-gold" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text-secondary">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-accent-gold text-bg-primary rounded-lg font-semibold text-sm hover:bg-accent-gold-lt">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
