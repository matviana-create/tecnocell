'use client'

import { useState, useMemo, Suspense } from 'react'
import type { Peca } from '@/lib/supabase'

type ItemCarrinho = Peca & { quantidade: number }

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarTelefone(valor: string) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return nums
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

type Props = {
  pecas: Peca[]
  lojaInfo: { nome: string; whatsapp: string; logo_url: string | null; cor_primaria: string }
  clienteInfo: { nome: string; telefone: string } | null
}

export default function PaginaPedidosClient({ pecas, lojaInfo, clienteInfo }: Props) {
  const cor = lojaInfo.cor_primaria
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState<Map<number, number>>(new Map())
  const [cliente, setCliente] = useState({
    nome: clienteInfo?.nome ?? '',
    telefone: clienteInfo?.telefone ?? '',
  })

  const clienteIdentificado = clienteInfo !== null

  const pecasFiltradas = useMemo(() => {
    if (!busca.trim()) return pecas
    const termo = busca.toLowerCase()
    return pecas.filter(
      (p) => p.nome?.toLowerCase().includes(termo) || p.codigo?.toLowerCase().includes(termo)
    )
  }, [pecas, busca])

  function alterarQuantidade(peca: Peca, delta: number) {
    setCarrinho((prev) => {
      const novo = new Map(prev)
      const proxima = (novo.get(peca.tiny_id) ?? 0) + delta
      if (proxima <= 0) novo.delete(peca.tiny_id)
      else novo.set(peca.tiny_id, proxima)
      return novo
    })
  }

  const itensCarrinho: ItemCarrinho[] = useMemo(() => {
    return Array.from(carrinho.entries())
      .map(([id, qtd]) => {
        const peca = pecas.find((p) => p.tiny_id === id)
        return peca ? { ...peca, quantidade: qtd } : null
      })
      .filter(Boolean) as ItemCarrinho[]
  }, [carrinho, pecas])

  const total = itensCarrinho.reduce((acc, item) => {
    const preco =
      item.preco_promocional && parseFloat(item.preco_promocional) > 0
        ? parseFloat(item.preco_promocional)
        : item.preco
    return acc + preco * item.quantidade
  }, 0)

  function enviarPedido() {
    if (!cliente.nome.trim()) return alert('Por favor, informe seu nome.')
    if (!cliente.telefone.trim() || cliente.telefone.replace(/\D/g, '').length < 10)
      return alert('Por favor, informe um telefone válido.')
    if (itensCarrinho.length === 0) return alert('Adicione ao menos uma peça ao pedido.')

    const linhasItens = itensCarrinho
      .map((item) => {
        const preco =
          item.preco_promocional && parseFloat(item.preco_promocional) > 0
            ? parseFloat(item.preco_promocional)
            : item.preco
        return `• ${item.quantidade}x ${item.nome}${item.codigo ? ` (COD: ${item.codigo})` : ''} - ${formatarPreco(preco)} cada = ${formatarPreco(preco * item.quantidade)}`
      })
      .join('\n')

    const mensagem =
      `🛒 *PEDIDO ${lojaInfo.nome.toUpperCase()}*\n\n` +
      `*Cliente:* ${cliente.nome}\n` +
      `*Telefone:* ${cliente.telefone}\n\n` +
      `*Itens:*\n${linhasItens}\n\n` +
      `*Total: ${formatarPreco(total)}*`

    window.open(`https://wa.me/${lojaInfo.whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        {lojaInfo.logo_url && (
          <img src={lojaInfo.logo_url} alt={lojaInfo.nome} className="h-16 w-auto mx-auto mb-3 object-contain" />
        )}
        <h1 className="text-3xl font-bold text-gray-900">{lojaInfo.nome}</h1>
        {clienteIdentificado && cliente.nome ? (
          <p className="text-gray-500 mt-1">
            Olá, <span className="font-semibold text-gray-700">{cliente.nome.split(' ')[0]}</span>! Selecione as peças que deseja pedir.
          </p>
        ) : (
          <p className="text-gray-500 mt-1">Faça seu pedido de peças abaixo</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!clienteIdentificado && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Seus dados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cliente.nome}
                    onChange={(e) => setCliente((c) => ({ ...c, nome: e.target.value }))}
                    placeholder="Seu nome"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={cliente.telefone}
                    onChange={(e) =>
                      setCliente((c) => ({ ...c, telefone: formatarTelefone(e.target.value) }))
                    }
                    placeholder="(00) 00000-0000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Peças disponíveis</h2>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {pecasFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Nenhuma peça encontrada.</div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {pecasFiltradas.map((peca) => {
                  const qtd = carrinho.get(peca.tiny_id) ?? 0
                  const noCarrinho = qtd > 0
                  const precoFinal =
                    peca.preco_promocional && parseFloat(peca.preco_promocional) > 0
                      ? parseFloat(peca.preco_promocional)
                      : peca.preco

                  return (
                    <div
                      key={peca.tiny_id}
                      className="flex items-center justify-between rounded-xl px-4 py-3 border transition-colors"
                      style={noCarrinho ? { borderColor: cor, backgroundColor: cor + '15' } : undefined}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-800 truncate">{peca.nome}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {peca.codigo && <span className="text-xs text-gray-400">COD: {peca.codigo}</span>}
                          {peca.preco_promocional && parseFloat(peca.preco_promocional) > 0 ? (
                            <span className="flex items-center gap-1">
                              <span className="text-xs line-through text-gray-400">{formatarPreco(peca.preco)}</span>
                              <span className="text-xs font-semibold" style={{ color: cor }}>{formatarPreco(parseFloat(peca.preco_promocional))}</span>
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-gray-700">{formatarPreco(precoFinal)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {noCarrinho && (
                          <>
                            <button onClick={() => alterarQuantidade(peca, -1)} className="w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-600 text-lg leading-none flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors">−</button>
                            <span className="w-6 text-center text-sm font-semibold text-gray-800">{qtd}</span>
                          </>
                        )}
                        <button onClick={() => alterarQuantidade(peca, 1)} className="w-7 h-7 rounded-full text-white text-lg leading-none flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: cor }}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Resumo do pedido{' '}
              {itensCarrinho.length > 0 && (
                <span className="ml-1 text-white text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: cor }}>{itensCarrinho.length}</span>
              )}
            </h2>

            {itensCarrinho.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhuma peça adicionada ainda.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {itensCarrinho.map((item) => {
                  const preco = item.preco_promocional && parseFloat(item.preco_promocional) > 0
                    ? parseFloat(item.preco_promocional) : item.preco
                  return (
                    <div key={item.tiny_id} className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{item.nome}</p>
                        <p className="text-xs text-gray-400">{item.quantidade}x {formatarPreco(preco)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs font-semibold text-gray-800">{formatarPreco(preco * item.quantidade)}</span>
                        <button onClick={() => setCarrinho((prev) => { const n = new Map(prev); n.delete(item.tiny_id); return n })} className="text-gray-300 hover:text-red-400 ml-1 text-base leading-none">×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-base font-bold text-gray-900">{formatarPreco(total)}</span>
              </div>
              <button
                onClick={enviarPedido}
                disabled={itensCarrinho.length === 0}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: cor }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar Pedido via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
