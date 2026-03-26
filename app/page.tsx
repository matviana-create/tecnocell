import { headers } from 'next/headers'
import { supabase, type Loja } from '@/lib/supabase'
import PaginaPedidosClient from './_components/PaginaPedidosClient'

const TECNOCELL_FALLBACK: Loja = {
  id: 1,
  nome: 'Tecnocell',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5519986094786',
  supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  dominio: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'tecnocell-one.vercel.app',
  ativo: true,
}

export default async function Page() {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? headersList.get('host') ?? ''

  // Busca a loja pelo domínio
  const { data: loja } = await supabase
    .from('lojas')
    .select('*')
    .eq('dominio', hostname)
    .eq('ativo', true)
    .single()

  return <PaginaPedidosClient loja={loja ?? TECNOCELL_FALLBACK} />
}
