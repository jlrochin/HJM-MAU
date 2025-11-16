'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, PatientFormData } from '@/lib/validations/patient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PatientForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  })

  const onSubmit = async (data: PatientFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/mau/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear paciente')
      }

      router.push('/dashboard/pacientes')
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
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Juan"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Pérez García"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="curp">CURP</Label>
            <Input
              id="curp"
              {...register('curp')}
              placeholder="PEGJ850101HDFRNN09"
            />
            {errors.curp && (
              <p className="text-sm text-red-600">{errors.curp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
            <Input
              id="birthDate"
              type="date"
              {...register('birthDate')}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-600">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género *</Label>
            <Select onValueChange={(value) => setValue('gender', value as 'M' | 'F' | 'OTHER')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Femenino</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Teléfono</Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="5551234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="paciente@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodType">Tipo de Sangre</Label>
            <Input
              id="bloodType"
              {...register('bloodType')}
              placeholder="O+"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Calle Principal #123, Colonia, CDMX"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Input
              id="allergies"
              {...register('allergies')}
              placeholder="Penicilina, Polen, etc."
            />
          </div>
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
            {loading ? 'Guardando...' : 'Guardar Paciente'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
