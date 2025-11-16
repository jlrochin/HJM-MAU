'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { prescriptionSchema, PrescriptionFormData } from '@/lib/validations/prescription'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Patient, Medication, CIE10 } from '@prisma/client'
import { Trash2, Plus } from 'lucide-react'

export function PrescriptionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [cie10Search, setCie10Search] = useState('')
  const [cie10Results, setCie10Results] = useState<CIE10[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medications: [{ medicationId: '', quantity: 1, dosage: '', frequency: '', duration: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  })

  useEffect(() => {
    fetchPatients()
    fetchMedications()
  }, [])

  useEffect(() => {
    if (cie10Search.length >= 2) {
      searchCIE10(cie10Search)
    } else {
      setCie10Results([])
    }
  }, [cie10Search])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/mau/api/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchMedications = async () => {
    try {
      const response = await fetch('/mau/api/medications')
      if (response.ok) {
        const data = await response.json()
        setMedications(data.filter((m: Medication) => m.isActive))
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    }
  }

  const searchCIE10 = async (query: string) => {
    try {
      const response = await fetch(`/mau/api/cie10?search=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setCie10Results(data)
      }
    } catch (error) {
      console.error('Error searching CIE-10:', error)
    }
  }

  const onSubmit = async (data: PrescriptionFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/mau/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear receta')
      }

      router.push('/dashboard/recetas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente *</Label>
            <Select onValueChange={(value) => setValue('patientId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.curp || 'Sin CURP'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-sm text-red-600">{errors.patientId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico *</Label>
            <Input
              id="diagnosis"
              {...register('diagnosis')}
              placeholder="Rinofaringitis aguda"
            />
            {errors.diagnosis && (
              <p className="text-sm text-red-600">{errors.diagnosis.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cie10Search">Código CIE-10 (opcional)</Label>
            <Input
              id="cie10Search"
              value={cie10Search}
              onChange={(e) => setCie10Search(e.target.value)}
              placeholder="Buscar por código o descripción..."
            />
            {cie10Results.length > 0 && (
              <div className="border rounded-md mt-2 max-h-48 overflow-y-auto">
                {cie10Results.map((cie10) => (
                  <button
                    key={cie10.id}
                    type="button"
                    onClick={() => {
                      setValue('cie10Code', cie10.code)
                      setCie10Search(`${cie10.code} - ${cie10.description}`)
                      setCie10Results([])
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-100 border-b last:border-0"
                  >
                    <div className="font-medium">{cie10.code}</div>
                    <div className="text-sm text-neutral-600">{cie10.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Input
              id="observations"
              {...register('observations')}
              placeholder="Reposo y abundantes líquidos"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg">Medicamentos *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ medicationId: '', quantity: 1, dosage: '', frequency: '', duration: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Medicamento
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 bg-neutral-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Medicamento</Label>
                  <Select onValueChange={(value) => setValue(`medications.${index}.medicationId`, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} - {med.presentation} {med.dosage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.medications?.[index]?.medicationId && (
                    <p className="text-sm text-red-600">{errors.medications[index]?.medicationId?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    {...register(`medications.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="10"
                  />
                  {errors.medications?.[index]?.quantity && (
                    <p className="text-sm text-red-600">{errors.medications[index]?.quantity?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Dosis</Label>
                  <Input
                    {...register(`medications.${index}.dosage`)}
                    placeholder="500mg"
                  />
                  {errors.medications?.[index]?.dosage && (
                    <p className="text-sm text-red-600">{errors.medications[index]?.dosage?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Input
                    {...register(`medications.${index}.frequency`)}
                    placeholder="Cada 8 horas"
                  />
                  {errors.medications?.[index]?.frequency && (
                    <p className="text-sm text-red-600">{errors.medications[index]?.frequency?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Duración</Label>
                  <Input
                    {...register(`medications.${index}.duration`)}
                    placeholder="7 días"
                  />
                  {errors.medications?.[index]?.duration && (
                    <p className="text-sm text-red-600">{errors.medications[index]?.duration?.message}</p>
                  )}
                </div>

                {fields.length > 1 && (
                  <div className="md:col-span-5 flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {errors.medications && typeof errors.medications.message === 'string' && (
            <p className="text-sm text-red-600">{errors.medications.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Receta'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
