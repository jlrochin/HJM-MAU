import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PatientForm } from '@/components/forms/patient-form'

export default async function NewPatientPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Paciente</h1>
        <p className="text-neutral-600">Registra un nuevo paciente en el sistema</p>
      </div>

      <PatientForm />
    </div>
  )
}
