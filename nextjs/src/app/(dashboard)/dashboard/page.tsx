import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <p className="text-sm text-neutral-600">Bienvenido</p>
        <p className="text-lg font-medium">{session.name}</p>
        <p className="text-sm text-neutral-500">{session.email}</p>
        <p className="text-sm text-neutral-500">Rol: {session.role}</p>
      </div>
    </div>
  )
}
