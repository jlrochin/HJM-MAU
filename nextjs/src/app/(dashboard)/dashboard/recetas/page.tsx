import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { PrescriptionsTable } from '@/components/tables/prescriptions-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function PrescriptionsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const prescriptions = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      medications: {
        include: {
          medication: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recetas Médicas</h1>
          <p className="text-neutral-600">Gestión de recetas y prescripciones</p>
        </div>
        <Link href="/dashboard/recetas/nueva">
          <Button>Nueva Receta</Button>
        </Link>
      </div>

      <PrescriptionsTable data={prescriptions} />
    </div>
  )
}
