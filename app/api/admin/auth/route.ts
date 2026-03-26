import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { senha } = await request.json()
  const senhaCorreta = process.env.ADMIN_PASSWORD

  if (!senhaCorreta || senha !== senhaCorreta) {
    return NextResponse.json({ erro: 'Senha incorreta' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
