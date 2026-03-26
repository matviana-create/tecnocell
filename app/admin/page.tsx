import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminClient from './_components/AdminClient'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const autenticado = cookieStore.get('admin_auth')?.value === 'true'

  if (!autenticado) {
    redirect('/admin/login')
  }

  const { data: lojas } = await supabase
    .from('lojas')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminClient lojas={lojas ?? []} />
}
