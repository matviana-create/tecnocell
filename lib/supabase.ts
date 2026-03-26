import { createClient } from '@supabase/supabase-js'

// Cliente central (Tecnocell) — usado para buscar lojas
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cria um cliente dinâmico para qualquer loja
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
