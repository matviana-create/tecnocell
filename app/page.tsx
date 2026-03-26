import { headers } from 'next/headers'
import { supabasePlataforma } from '@/lib/supabase'
import PaginaPedidosClient from './_components/PaginaPedidosClient'

export default async function Page() {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? headersList.get('host') ?? ''

  // Remove porta se existir (ex: localhost:3000 → localhost)
  const dominioLimpo = hostname.split(':')[0]

  const { data: loja, error } = await supabasePlataforma
    .from('lojas')
    .select('*')
    .eq('dominio', dominioLimpo)
    .eq('ativo', true)
    .single()

  // Debug temporário — remover depois
  if (!loja) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-sm text-gray-600">
          <p className="font-bold text-gray-900 mb-3">Loja não encontrada</p>
          <p><strong>Hostname detectado:</strong> {hostname}</p>
          <p><strong>Domínio buscado:</strong> {dominioLimpo}</p>
          {error && <p className="text-red-500 mt-2"><strong>Erro:</strong> {error.message}</p>}
        </div>
      </div>
    )
  }

  return <PaginaPedidosClient loja={loja} />
}
