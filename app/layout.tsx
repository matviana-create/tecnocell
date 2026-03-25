import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pedidos — Tecnocell',
  description: 'Faça seu pedido de peças para celular',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
