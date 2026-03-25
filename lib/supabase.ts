import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
