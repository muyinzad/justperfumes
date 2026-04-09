# JustPerfumes — E-Commerce Platform

Luxury perfume e-commerce platform built with Next.js 14, PostgreSQL, and Prisma.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env .env.local
# Edit .env.local with your database URL and secrets
```

### 3. Setup database
```bash
# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed
```

### 4. Run development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Admin panel:** [http://localhost:3000/admin](http://localhost:3000/admin)
- Email: admin@justperfumes.com
- Password: admin123

## Production Deployment

### VPS Setup (Ubuntu 22.04)

1. **SSH to your VPS**
2. **Install Node.js 20:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```

3. **Setup PostgreSQL:**
   ```bash
   sudo apt install postgresql postgresql-contrib
   sudo -u postgres psql
   CREATE DATABASE justperfumes;
   CREATE USER justperfumes_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE justperfumes TO justperfumes_user;
   ```

4. **Clone and setup:**
   ```bash
   git clone https://github.com/muyinzad/justperfumes.git /var/www/justperfumes
   cd /var/www/justperfumes
   npm install
   ```

5. **Configure environment:**
   ```bash
   nano /var/www/justperfumes/.env
   # Set DATABASE_URL, JWT_SECRET, etc.
   ```

6. **Setup PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/justperfumes
   sudo ln -s /etc/nginx/sites-available/justperfumes /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### GitHub Actions (Auto-Deploy)

Add these secrets to your GitHub repo (Settings → Secrets):

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Your VPS IP (72.60.83.198) |
| `VPS_USER` | root (or your user) |
| `VPS_SSH_KEY` | Private SSH key for deployment |
| `DATABASE_URL` | postgresql://... |
| `JWT_SECRET` | Random 64-char string |
| `ADMIN_EMAIL` | admin@justperfumes.com |
| `ADMIN_PASSWORD` | Strong password |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | 256XXXXXXXXX |
| `NEXT_PUBLIC_SITE_URL` | https://yourdomain.com |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Tailwind CSS
- **State:** React Context + React Query
- **Auth:** JWT (admin only)
- **Server:** PM2 + Nginx
- **CI/CD:** GitHub Actions
