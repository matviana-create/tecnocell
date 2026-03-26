import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import PaginaPedidosClient from './_components/PaginaPedidosClient'

export default async function Page() {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? headersList.get('host') ?? ''
  const dominioLimpo = hostname.split(':')[0]

  const platformUrl = process.env.PLATFORM_SUPABASE_URL
  const platformKey = process.env.PLATFORM_SUPABASE_ANON_KEY

  // Debug: mostra estado das variáveis
  if (!platformUrl || !platformKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-sm text-gray-600 space-y-1">
          <p className="font-bold text-red-600 mb-3">Variáveis de ambiente ausentes</p>
          <p>PLATFORM_SUPABASE_URL: <strong>{platformUrl ? '✅ ok' : '❌ não definida'}</strong></p>
          <p>PLATFORM_SUPABASE_ANON_KEY: <strong>{platformKey ? '✅ ok' : '❌ não definida'}</strong></p>
          <p className="text-gray-400 mt-3">Hostname: {dominioLimpo}</p>
        </div>
      </div>
    )
  }

  try {
    const supabase = createClient(platformUrl, platformKey)
    const { data: loja, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('dominio', dominioLimpo)
      .eq('ativo', true)
      .single()

    if (!loja) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-sm text-gray-600 space-y-1">
            <p className="font-bold text-gray-900 mb-3">Loja não encontrada</p>
            <p><strong>Domínio buscado:</strong> {dominioLimpo}</p>
            {error && <p className="text-red-500"><strong>Erro:</strong> {error.message}</p>}
          </div>
        </div>
      )
    }

    return <PaginaPedidosClient loja={loja} />
  } catch (e: unknown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-sm">
          <p className="font-bold text-red-600 mb-2">Erro inesperado</p>
          <p className="text-gray-600">{e instanceof Error ? e.message : String(e)}</p>
        </div>
      </div>
    )
  }
}
