'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medicationSchema, MedicationFormData } from '@/lib/validations/medication'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function MedicationForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      isActive: true,
    },
  })

  const onSubmit = async (data: MedicationFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/mau/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear medicamento')
      }

      router.push('/dashboard/medicamentos')
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
            <Label htmlFor="name">Nombre Comercial *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Paracetamol"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="genericName">Nombre Genérico *</Label>
            <Input
              id="genericName"
              {...register('genericName')}
              placeholder="Acetaminofén"
            />
            {errors.genericName && (
              <p className="text-sm text-red-600">{errors.genericName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentation">Presentación *</Label>
            <Input
              id="presentation"
              {...register('presentation')}
              placeholder="Tabletas"
            />
            {errors.presentation && (
              <p className="text-sm text-red-600">{errors.presentation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosificación *</Label>
            <Input
              id="dosage"
              {...register('dosage')}
              placeholder="500mg"
            />
            {errors.dosage && (
              <p className="text-sm text-red-600">{errors.dosage.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Actual *</Label>
            <Input
              id="stock"
              type="number"
              {...register('stock', { valueAsNumber: true })}
              placeholder="1000"
            />
            {errors.stock && (
              <p className="text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumStock">Stock Mínimo *</Label>
            <Input
              id="minimumStock"
              type="number"
              {...register('minimumStock', { valueAsNumber: true })}
              placeholder="100"
            />
            {errors.minimumStock && (
              <p className="text-sm text-red-600">{errors.minimumStock.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              placeholder="5.50"
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Estado *</Label>
            <Select
              defaultValue="true"
              onValueChange={(value) => setValue('isActive', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            {errors.isActive && (
              <p className="text-sm text-red-600">{errors.isActive.message}</p>
            )}
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
            {loading ? 'Guardando...' : 'Guardar Medicamento'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
