import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { PatientsTable } from '@/components/tables/patients-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function PatientsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-neutral-600">Gestión de pacientes del hospital</p>
        </div>
        <Link href="/dashboard/pacientes/nuevo">
          <Button>Nuevo Paciente</Button>
        </Link>
      </div>

      <PatientsTable data={patients} />
    </div>
  )
}
