# JUSTPERFUMES — E-Commerce Platform Spec

## 1. Concept & Vision

**JUSTPERFUMES** is a premium, luxury-focused perfume e-commerce platform targeting Uganda's discerning fragrance enthusiasts. The experience should feel like walking into a high-end boutique — warm, intimate, and sophisticated. Every interaction should communicate quality and care. The word "just" reflects simplicity and confidence — no clutter, just perfect scents.

**Tagline:** *"Just Perfumes — Where Scent Meets Soul"*

---

## 2. Design Language

### Aesthetic Direction
**Warm Luxury Minimal** — Think Byredo meets Aesop. Dark, rich backgrounds with warm gold accents. Editorial-quality product presentation. Nothing flashy, everything intentional.

### Color Palette
```
--bg-primary:      #0D0D0D   (near-black, main background)
--bg-secondary:    #1A1A1A   (card/section backgrounds)
--bg-tertiary:    #242424   (input fields, subtle divisions)
--text-primary:    #F5F0E8   (warm off-white, main text)
--text-secondary:  #9A9488   (muted, secondary info)
--accent-gold:     #C9A84C   (warm gold, CTAs and highlights)
--accent-gold-lt:  #E8D5A3   (lighter gold, hover states)
--border:          #2E2E2E   (subtle borders)
--error:           #E05050   (validation errors)
--success:         #50C878   (confirmations)
```

### Typography
- **Display/Headings:** `Playfair Display` (serif) — Google Fonts
- **Body/UI:** `DM Sans` (sans-serif) — Google Fonts
- **Accent/Prices:** `Space Grotesk` (geometric sans) — Google Fonts
- Scale: 12/14/16/18/24/32/48/64px

### Spatial System
- Base unit: 8px
- Section padding: 80px vertical, 24px horizontal (mobile: 48px/16px)
- Card padding: 24px
- Grid: 12-column, max-width 1280px, gap 24px

### Motion Philosophy
- **Entrance:** Fade up (opacity 0→1, translateY 20px→0), 500ms ease-out, staggered 80ms
- **Hover:** Scale 1→1.02, 200ms ease — subtle, never jarring
- **Page transitions:** Crossfade 300ms
- **Cart:** Slide in from right, 350ms cubic-bezier(0.4, 0, 0.2, 1)
- **Loading:** Pulsing gold shimmer on skeletons
- **Philosophy:** Motion should feel like a gentle breath, never mechanical

### Visual Assets
- **Icons:** Lucide React — consistent 1.5px stroke
- **Images:** Product images from external source URLs in spreadsheet; fallback to elegant placeholder
- **Decorative:** Subtle grain texture overlay on hero sections, thin gold horizontal rules

---

## 3. Layout & Structure

### Storefront Pages

**`/` — Home**
- Full-width hero with tagline + CTA
- Featured categories (Men / Women / Unisex / Gift Sets)
- Bestsellers section (6 products)
- New arrivals section (6 products)
- Brand showcase strip
- Trust badges (Authenticity guarantee, Cash on Delivery, Fast delivery)
- Footer with contact + links

**`/products` — Catalog**
- Sticky sidebar filters (brand, category, price range, size)
- Sort dropdown (price low/high, newest, popularity)
- 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Pagination (24 per page)
- Product count display
- "Clear filters" when active

**`/products/[slug]` — Product Detail**
- Large product image (zoomable)
- Product name, brand, size, price (UGX)
- "Add to Cart" button
- WhatsApp inquiry button (pre-filled message with product name)
- Description section
- Related products carousel

**`/cart` — Cart**
- Line items with image, name, price, quantity stepper, remove
- Order summary sidebar
- "Proceed to Checkout" CTA
- "Continue Shopping" link

**`/checkout` — Checkout**
- Contact info (name, phone, email)
- Delivery address (area/town, detailed address)
- Order notes (optional)
- Cash on Delivery confirmation checkbox
- Place Order button
- Order summary

**`/orders/[id]` — Order Confirmation**
- Order number
- Items ordered
- Delivery address
- Order status timeline
- WhatsApp tracking link

### Admin Panel (`/admin`)

Protected by simple email/password login (JWT).

**`/admin` — Dashboard**
- Today's orders count
- Orders awaiting processing
- Revenue this week/month
- Recent orders table

**`/admin/products` — Product Management**
- Data table with search
- Add new product (name, brand, size, price, category, stock, image URL)
- Edit existing products
- Toggle active/inactive

**`/admin/orders` — Order Management**
- Orders table with status filter
- Status update (Pending → Confirmed → Shipped → Delivered)
- View order details

**`/admin/categories` — Category Management**
- Add/edit/delete categories

---

## 4. Features & Interactions

### Customer Features
- **Search:** Instant search in header (searches product name/brand as user types)
- **Filter:** Brand multi-select, category, price slider, size filter
- **Cart:** Persisted in localStorage + server sync on login, quantity update, remove
- **Checkout:** Form validation, WhatsApp confirmation link post-order
- **Order tracking:** Via order ID + phone number lookup

### Admin Features
- **Login:** Email + password, JWT stored in httpOnly cookie
- **Products CRUD:** Full create/read/update/delete with form validation
- **Orders:** List with filters, single-click status updates
- **Dashboard:** Stats cards with counts and revenue

### Error Handling
- **Empty cart:** Elegant empty state with CTA to browse
- **No search results:** Friendly message with suggestion to clear filters
- **Form errors:** Inline red text below field, field border turns red
- **Network errors:** Toast notification at top of page, retry option
- **404:** Custom styled "Scent not found" page

---

## 5. Component Inventory

### Storefront Components

**`<Navbar />`**
- Logo (left), Search bar (center), Cart icon with badge (right)
- Sticky on scroll, background darkens slightly
- Mobile: hamburger menu

**`<ProductCard />`**
- Image (aspect-ratio 1:1, object-cover)
- Brand name (small, muted)
- Product name (truncated to 2 lines)
- Price (gold accent)
- "Add to Cart" appears on hover (desktop), always visible (mobile)
- States: default, hover (lift shadow), loading (shimmer), out-of-stock (greyed, "Notify Me")

**`<ProductGrid />`**
- Responsive grid container
- Handles loading skeleton state

**`<FilterSidebar />`**
- Accordion sections (brand, category, price, size)
- Mobile: slides up from bottom as drawer
- "Apply Filters" button on mobile

**`<CartDrawer />`**
- Slides in from right
- Backdrop overlay
- Line items, summary, checkout button
- Empty state when no items

**`<CheckoutForm />`**
- Controlled form fields
- Inline validation
- Loading state on submit

**`<Footer />`**
- Logo, tagline
- Quick links (Shop, About, Contact, FAQ)
- WhatsApp contact button
- Social icons
- Copyright

### Admin Components

**`<AdminNav />`**
- Sidebar navigation
- Active state highlighting
- User info + logout

**`<DataTable />`**
- Sortable columns
- Search filter
- Pagination
- Row actions (edit, delete)

**`<ProductForm />`**
- All product fields
- Image URL preview
- Save/Cancel buttons

**`<StatusBadge />`**
- Color-coded order status

---

## 6. Technical Approach

### Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** PostgreSQL (existing local Postgres on VPS)
- **ORM:** Prisma
- **Styling:** Tailwind CSS + CSS custom properties for theme
- **State:** React Context (cart), React Query (server state)
- **Auth:** JWT (admin only — simple email/password)
- **Icons:** Lucide React
- **Email:** Nodemailer (order confirmations via SMTP)
- **Deployment:** PM2 on VPS, GitHub Actions for CI/CD

### API Design

```
POST   /api/auth/login          — Admin login
POST   /api/auth/logout         — Admin logout
GET    /api/auth/me             — Get current admin

GET    /api/products            — List products (filterable, paginated)
GET    /api/products/[id]       — Get single product
POST   /api/products            — Create product (admin)
PUT    /api/products/[id]        — Update product (admin)
DELETE /api/products/[id]        — Delete product (admin)

GET    /api/categories           — List categories
POST   /api/categories           — Create category (admin)
PUT    /api/categories/[id]      — Update category (admin)
DELETE /api/categories/[id]      — Delete category (admin)

GET    /api/orders               — List orders (admin, filterable)
GET    /api/orders/[id]           — Get order details
POST   /api/orders               — Create order (customer checkout)
PUT    /api/orders/[id]/status   — Update order status (admin)

POST   /api/cart/sync            — Sync cart from localStorage to server
```

### Data Model

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  brand       String
  size        String
  price       Int      // UGX, in whole numbers
  description String?
  imageUrl    String?
  sourceUrl   String?  // original product link
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  stock       Int      @default(0)
  active      Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orderItems  OrderItem[]
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  products  Product[]
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String
  email     String?
  address   String
  notes     String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique
  customerId  String
  customer    Customer    @relation(fields: [customerId], references: [id])
  items       OrderItem[]
  total       Int         // UGX
  status      OrderStatus @default(PENDING)
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  priceAt   Int     // price snapshot
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  createdAt DateTime @default(now())
}
```

### Deployment Architecture

```
GitHub (main branch)
    ↓ push
GitHub Actions
    ↓ build + test
    ↓ SSH to VPS (72.60.83.198)
    ↓ pull latest code
    ↓ npm install + prisma migrate + pm2 restart
    ↓
Next.js app runs on :3000 behind nginx
PostgreSQL on local port 5432
Redis (optional) for session/cache
```

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@localhost:5432/justperfumes
JWT_SECRET=random-secret-string
ADMIN_EMAIL=admin@justperfumes.com
ADMIN_PASSWORD= (set on first run / seed)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NEXT_PUBLIC_WHATSAPP_NUMBER=256XXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://justperfumes.ug
```
