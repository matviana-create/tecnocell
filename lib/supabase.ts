import { createClient } from '@supabase/supabase-js'

// Cliente da PLATAFORMA (servidor apenas) — armazena a tabela lojas
export function getSupabasePlataforma() {
  return createClient(
    process.env.PLATFORM_SUPABASE_URL!,
    process.env.PLATFORM_SUPABASE_ANON_KEY!
  )
}

// Cria um cliente dinâmico para o Supabase de cada loja
export function createLojaClient(url: string, anonKey: string) {
  return createClient(url, anonKey)
}

export type Peca = {
  tiny_id: number
  nome: string
  codigo: string
  preco: number
  preco_promocional: string | null
  unidade: string | null
  estoque: number | null
  situacao: string | null
}

export type Loja = {
  id: number
  nome: string
  whatsapp: string
  supabase_url: string
  supabase_anon_key: string
  dominio: string | null
  ativo: boolean
}
