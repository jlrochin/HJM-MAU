import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrescriptionForm } from '@/components/forms/prescription-form'

export default async function NewPrescriptionPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Receta Médica</h1>
        <p className="text-neutral-600">Crear una nueva receta con medicamentos</p>
      </div>

      <PrescriptionForm />
    </div>
  )
}
