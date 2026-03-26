'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)
  const router = useRouter()

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ senha }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setErro(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Cell Sistem</h1>
        <p className="text-sm text-gray-500 mb-6">Painel de controle de lojas</p>

        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(false) }}
              placeholder="••••••••"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${erro ? 'border-red-400' : 'border-gray-200'}`}
              autoFocus
            />
            {erro && <p className="text-xs text-red-500 mt-1">Senha incorreta.</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
