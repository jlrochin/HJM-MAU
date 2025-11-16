import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { Users, FileText, Pill, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const [
    totalPatients,
    totalPrescriptions,
    pendingPrescriptions,
    totalMedications,
    lowStockMedications,
  ] = await Promise.all([
    prisma.patient.count({ where: { status: 'ACTIVE' } }),
    prisma.prescription.count(),
    prisma.prescription.count({ where: { status: 'PENDING' } }),
    prisma.medication.count({ where: { isActive: true } }),
    prisma.medication.findMany({
      where: {
        isActive: true,
      },
    }).then((meds) => meds.filter((m) => m.stock <= m.minimumStock).length),
  ])

  const stats = [
    {
      title: 'Pacientes Activos',
      value: totalPatients,
      icon: Users,
      href: '/dashboard/pacientes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Recetas Totales',
      value: totalPrescriptions,
      icon: FileText,
      href: '/dashboard/recetas',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: `${pendingPrescriptions} pendientes`,
    },
    {
      title: 'Medicamentos',
      value: totalMedications,
      icon: Pill,
      href: '/dashboard/medicamentos',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtitle: lowStockMedications > 0 ? `${lowStockMedications} con stock bajo` : undefined,
    },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-600">
          Bienvenido, {session.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-sm text-neutral-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {lowStockMedications > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
            <div>
              <h3 className="font-semibold text-orange-900">Alerta de Stock Bajo</h3>
              <p className="text-sm text-orange-800 mt-1">
                Hay {lowStockMedications} medicamento(s) con stock por debajo del mínimo.{' '}
                <Link href="/dashboard/medicamentos" className="underline font-medium">
                  Ver detalles
                </Link>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
