import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  return NextResponse.json({ id: payload.id, email: payload.email })
}
