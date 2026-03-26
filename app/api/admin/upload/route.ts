import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabasePlataformaAdmin as getSupabasePlataforma } from '@/lib/supabase'

async function verificarAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

export async function POST(request: Request) {
  if (!(await verificarAuth())) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ erro: 'Arquivo não enviado' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const supabase = getSupabasePlataforma()
  const { error } = await supabase.storage
    .from('logos')
    .upload(fileName, buffer, { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 400 })

  const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl })
}
