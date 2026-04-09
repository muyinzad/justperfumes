import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@justperfumes.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        name: 'Admin',
      },
    })
    console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`)
  } else {
    console.log('✅ Admin already exists')
  }

  // Create categories
  const categoryData = [
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'Unisex', slug: 'unisex' },
    { name: 'Gift Sets', slug: 'gift-sets' },
  ]

  const categories: Record<string, string> = {}
  for (const cat of categoryData) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })
    if (!existing) {
      const created = await prisma.category.create({ data: cat })
      categories[cat.slug] = created.id
      console.log(`✅ Category: ${cat.name}`)
    } else {
      categories[cat.slug] = existing.id
    }
  }

  // Import perfume data from Excel (via CSV export we create from the source)
  const dataPath = join(__dirname, 'perfumes_seed.csv')
  let perfumeData: { name: string; brand: string; size: string; price: number; link: string }[] = []

  try {
    const content = readFileSync(dataPath, 'utf-8')
    const rows = content.split('\n').slice(1) // skip header
    for (const row of rows) {
      const [name, size, priceStr, link] = row.split(',').map(s => s.replace(/"/g, '').trim())
      if (!name || name === 'NAME') continue
      const price = parseInt(priceStr || '0')
      if (name) perfumeData.push({ name, brand: name.split(' ')[0], size: size || '100ML', price, link })
    }
    console.log(`📦 Found ${perfumeData.length} perfumes in CSV`)
  } catch {
    console.log('⚠️  perfumes_seed.csv not found — skipping perfume import')
  }

  let imported = 0
  for (const p of perfumeData) {
    const slug = slugify(`${p.name}-${p.size}`)
    const existing = await prisma.product.findFirst({ where: { name: p.name } })
    if (!existing) {
      // Try to guess category
      let categoryId: string | null = null
      const nameLower = p.name.toLowerCase()
      const brandLower = p.brand.toLowerCase()
      if (nameLower.includes('women') || nameLower.includes('woman') || brandLower.includes('women')) {
        categoryId = categories['women']
      } else if (nameLower.includes('men') || nameLower.includes('man')) {
        categoryId = categories['men']
      } else if (nameLower.includes('gift') || nameLower.includes('box') || nameLower.includes('set')) {
        categoryId = categories['gift-sets']
      }

      await prisma.product.create({
        data: {
          name: p.name,
          brand: p.brand,
          size: p.size,
          price: p.price,
          slug: `${slug}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sourceUrl: p.link || null,
          categoryId,
          stock: 5,
          active: true,
        },
      })
      imported++
    }
  }

  if (imported > 0) {
    console.log(`✅ Imported ${imported} perfumes`)
  } else {
    console.log('ℹ️  No new perfumes to import (all already exist)')
  }

  console.log('\n🎉 Seed complete!')
  console.log(`   Admin: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log('   Change these in production!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
