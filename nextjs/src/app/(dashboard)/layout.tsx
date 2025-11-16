import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, Pill, BarChart3, LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Pacientes', href: '/dashboard/pacientes', icon: Users },
    { name: 'Recetas', href: '/dashboard/recetas', icon: FileText },
    { name: 'Medicamentos', href: '/dashboard/medicamentos', icon: Pill },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-xl font-bold">MAU Hospital</h1>
          <p className="text-sm text-neutral-600">Sistema de Recetas</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-neutral-900">{session.name}</p>
            <p className="text-xs text-neutral-600">{session.email}</p>
            <p className="text-xs text-neutral-500">{session.role}</p>
          </div>
          <form action="/mau/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
