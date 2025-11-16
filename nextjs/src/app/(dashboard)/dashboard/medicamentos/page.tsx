import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { MedicationsTable } from '@/components/tables/medications-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function MedicationsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const medications = await prisma.medication.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medicamentos</h1>
          <p className="text-neutral-600">Gestión de inventario de medicamentos</p>
        </div>
        <Link href="/dashboard/medicamentos/nuevo">
          <Button>Nuevo Medicamento</Button>
        </Link>
      </div>

      <MedicationsTable data={medications} />
    </div>
  )
}
