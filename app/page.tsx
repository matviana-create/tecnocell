import { headers } from 'next/headers'
import { supabasePlataforma } from '@/lib/supabase'
import PaginaPedidosClient from './_components/PaginaPedidosClient'
import { notFound } from 'next/navigation'

export default async function Page() {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? headersList.get('host') ?? ''

  const { data: loja } = await supabasePlataforma
    .from('lojas')
    .select('*')
    .eq('dominio', hostname)
    .eq('ativo', true)
    .single()

  if (!loja) return notFound()

  return <PaginaPedidosClient loja={loja} />
}
