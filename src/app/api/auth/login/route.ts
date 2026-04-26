import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/utils'
import { rateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // Get client IP for rate limiting
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  // Rate limit: 5 attempts per 15 minutes per IP
  const { success, limit, remaining, reset } = await rateLimit(ip, 5, 900)
  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please try again later.',
        retryAfter: reset - Math.ceil(Date.now() / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(reset - Math.ceil(Date.now() / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = await signToken({ id: admin.id, email: admin.email })

    const response = NextResponse.json({ admin: { id: admin.id, email: admin.email, name: admin.name } })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}