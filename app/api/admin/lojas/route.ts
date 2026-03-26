import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabasePlataformaAdmin as getSupabasePlataforma } from '@/lib/supabase'

async function verificarAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

export async function POST(request: Request) {
  if (!(await verificarAuth())) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const supabase = getSupabasePlataforma()
  const body = await request.json()
  const { data, error } = await supabase.from('lojas').insert(body).select()
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 })
  return NextResponse.json(data?.[0] ?? {})
}

export async function PUT(request: Request) {
  if (!(await verificarAuth())) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const supabase = getSupabasePlataforma()
  const body = await request.json()
  const { id, ...dados } = body
  const { error } = await supabase.from('lojas').update(dados).eq('id', id)
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 })
  // Busca a loja atualizada
  const { data } = await supabase.from('lojas').select('*').eq('id', id).single()
  return NextResponse.json(data ?? { id })
}

export async function DELETE(request: Request) {
  if (!(await verificarAuth())) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const supabase = getSupabasePlataforma()
  const { id } = await request.json()
  const { error } = await supabase.from('lojas').delete().eq('id', id)
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
