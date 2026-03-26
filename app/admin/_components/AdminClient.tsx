'use client'

import { useState, useRef } from 'react'
import type { Loja } from '@/lib/supabase'

const VAZIO: Omit<Loja, 'id' | 'created_at' | 'ativo'> = {
  nome: '',
  whatsapp: '',
  supabase_url: '',
  supabase_anon_key: '',
  dominio: '',
  logo_url: null,
  cor_primaria: '#22c55e',
}

export default function AdminClient({ lojas: lojasIniciais }: { lojas: Loja[] }) {
  const [lojas, setLojas] = useState<Loja[]>(lojasIniciais)
  const [modal, setModal] = useState<'novo' | 'editar' | null>(null)
  const [form, setForm] = useState<Partial<Loja>>(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [uploadando, setUploadando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function abrirNovo() {
    setForm(VAZIO)
    setErro('')
    setModal('novo')
  }

  function abrirEditar(loja: Loja) {
    setForm(loja)
    setErro('')
    setModal('editar')
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadando(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setForm((f) => ({ ...f, logo_url: data.url }))
    } else {
      setErro(data.erro ?? 'Erro ao fazer upload.')
    }
    setUploadando(false)
  }

  async function salvar() {
    setSalvando(true)
    setErro('')
    const method = modal === 'novo' ? 'POST' : 'PUT'
    const res = await fetch('/api/admin/lojas', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setErro(data.erro ?? 'Erro ao salvar.')
    } else {
      if (modal === 'novo') setLojas((l) => [data, ...l])
      else setLojas((l) => l.map((x) => (x.id === data.id ? data : x)))
      setModal(null)
    }
    setSalvando(false)
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta loja?')) return
    await fetch('/api/admin/lojas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLojas((l) => l.filter((x) => x.id !== id))
  }

  function copiarUrl(dominio: string) {
    navigator.clipboard.writeText(`https://${dominio}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cell Sistem</h1>
            <p className="text-sm text-gray-500 mt-0.5">{lojas.length} loja{lojas.length !== 1 ? 's' : ''} cadastrada{lojas.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={abrirNovo}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
          >
            + Nova loja
          </button>
        </div>

        <div className="space-y-3">
          {lojas.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              Nenhuma loja cadastrada ainda.
            </div>
          )}
          {lojas.map((loja) => (
            <div key={loja.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {loja.logo_url && (
                  <img src={loja.logo_url} alt={loja.nome} className="w-10 h-10 rounded-lg object-contain border border-gray-100" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {loja.cor_primaria && (
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: loja.cor_primaria }} />
                    )}
                    <h3 className="font-semibold text-gray-900">{loja.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${loja.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {loja.ativo ? 'ativo' : 'inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">WhatsApp: {loja.whatsapp}</p>
                  {loja.dominio && (
                    <p className="text-xs text-blue-500 mt-0.5 truncate">{loja.dominio}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {loja.dominio && (
                  <button
                    onClick={() => copiarUrl(loja.dominio!)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    Copiar URL
                  </button>
                )}
                <button
                  onClick={() => abrirEditar(loja)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluir(loja.id)}
                  className="text-xs border border-red-200 text-red-500 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {modal === 'novo' ? 'Nova loja' : 'Editar loja'}
            </h2>

            <div className="space-y-3">
              {[
                { key: 'nome', label: 'Nome da loja', placeholder: 'Ex: Tecnocell Campinas' },
                { key: 'whatsapp', label: 'WhatsApp (com DDI)', placeholder: '5511999998888' },
                { key: 'supabase_url', label: 'Supabase URL', placeholder: 'https://xxx.supabase.co' },
                { key: 'supabase_anon_key', label: 'Supabase Anon Key', placeholder: 'eyJ...' },
                { key: 'dominio', label: 'Domínio', placeholder: 'pedidos.outra-loja.com.br' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={key === 'supabase_anon_key' ? 'password' : 'text'}
                    value={(form as Record<string, string>)[key] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo da loja</label>
                <div className="flex items-center gap-3">
                  {form.logo_url ? (
                    <div className="relative">
                      <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-gray-200 bg-gray-50" />
                      <button
                        onClick={() => setForm((f) => ({ ...f, logo_url: null }))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >×</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
                    >
                      {uploadando ? (
                        <span className="text-xs text-gray-400">...</span>
                      ) : (
                        <span className="text-2xl text-gray-300">+</span>
                      )}
                    </div>
                  )}
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadando}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {uploadando ? 'Enviando...' : form.logo_url ? 'Trocar logo' : 'Selecionar arquivo'}
                    </button>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG ou SVG</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              {/* Cor principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.cor_primaria ?? '#22c55e'}
                    onChange={(e) => setForm((f) => ({ ...f, cor_primaria: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-gray-500">{form.cor_primaria ?? '#22c55e'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={form.ativo ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="ativo" className="text-sm text-gray-700">Loja ativa</label>
              </div>
            </div>

            {erro && <p className="text-sm text-red-500 mt-3">{erro}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando || uploadando}
                className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
