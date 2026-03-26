export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PaginaPedidosClient from './_components/PaginaPedidosClient'
import type { Peca } from '@/lib/supabase'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'tecnocell-one.vercel.app'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>
}) {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? headersList.get('host') ?? ''
  const dominioLimpo = hostname.split(':')[0]

  // Domínio raiz → redireciona para o painel admin
  if (dominioLimpo === ROOT_DOMAIN || dominioLimpo === 'localhost') {
    redirect('/admin')
  }

  const { cliente: clienteId } = await searchParams

  const platformUrl = process.env.PLATFORM_SUPABASE_URL
  const platformKey = process.env.PLATFORM_SUPABASE_ANON_KEY

  if (!platformUrl || !platformKey) {
    return <Erro mensagem="Variáveis de ambiente ausentes" />
  }

  try {
    const plataforma = createClient(platformUrl, platformKey)
    const { data: loja, error: lojaError } = await plataforma
      .from('lojas')
      .select('*')
      .eq('dominio', dominioLimpo)
      .eq('ativo', true)
      .single()

    if (!loja) {
      return <Erro mensagem={`Loja não encontrada: ${dominioLimpo}`} detalhe={lojaError?.message} />
    }

    const lojaDb = createClient(
      loja.supabase_url.trim(),
      loja.supabase_anon_key.replace(/\s/g, '')
    )

    const [{ data: pecas }, { data: clienteData }] = await Promise.all([
      lojaDb
        .from('estoque')
        .select('tiny_id, nome, codigo, preco, preco_promocional, unidade, estoque, situacao')
        .eq('situacao', 'A')
        .order('nome'),
      clienteId
        ? lojaDb.from('clientes').select('nome_cliente, celular, telefone').eq('id_tiny', clienteId).single()
        : Promise.resolve({ data: null }),
    ])

    return (
      <PaginaPedidosClient
        pecas={(pecas ?? []) as Peca[]}
        lojaInfo={{ nome: loja.nome, whatsapp: loja.whatsapp }}
        clienteInfo={clienteData ? {
          nome: clienteData.nome_cliente ?? '',
          telefone: clienteData.celular || clienteData.telefone || '',
        } : null}
      />
    )
  } catch (e: unknown) {
    return <Erro mensagem="Erro inesperado" detalhe={e instanceof Error ? e.message : String(e)} />
  }
}

function Erro({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-sm text-gray-600 space-y-1">
        <p className="font-bold text-gray-900 mb-2">{mensagem}</p>
        {detalhe && <p className="text-red-500">{detalhe}</p>}
      </div>
    </div>
  )
}
