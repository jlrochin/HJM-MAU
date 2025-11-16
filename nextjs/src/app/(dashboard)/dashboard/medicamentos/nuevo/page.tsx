import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MedicationForm } from '@/components/forms/medication-form'

export default async function NewMedicationPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Medicamento</h1>
        <p className="text-neutral-600">Registrar un nuevo medicamento en el inventario</p>
      </div>

      <MedicationForm />
    </div>
  )
}
