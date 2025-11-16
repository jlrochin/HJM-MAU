'use client'

import { Prescription, Patient, User, PrescriptionMedication, Medication } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type PrescriptionWithRelations = Prescription & {
  patient: Patient
  doctor: Pick<User, 'id' | 'firstName' | 'lastName'>
  medications: (PrescriptionMedication & {
    medication: Medication
  })[]
}

interface PrescriptionsTableProps {
  data: PrescriptionWithRelations[]
}

const statusConfig = {
  PENDING: { label: 'Pendiente', variant: 'default' as const, color: 'bg-yellow-600' },
  DISPENSED: { label: 'Dispensada', variant: 'default' as const, color: 'bg-green-600' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' as const, color: 'bg-red-600' },
}

export function PrescriptionsTable({ data }: PrescriptionsTableProps) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'DISPENSED' | 'CANCELLED') => {
    setUpdatingId(id)
    try {
      const response = await fetch(`/mau/api/prescriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Diagnóstico</TableHead>
            <TableHead>CIE-10</TableHead>
            <TableHead>Medicamentos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-neutral-500">
                No hay recetas registradas
              </TableCell>
            </TableRow>
          ) : (
            data.map((prescription) => {
              const statusInfo = statusConfig[prescription.status as keyof typeof statusConfig]
              const isUpdating = updatingId === prescription.id

              return (
                <TableRow key={prescription.id}>
                  <TableCell>
                    {format(new Date(prescription.createdAt), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {prescription.patient.firstName} {prescription.patient.lastName}
                  </TableCell>
                  <TableCell>
                    Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                  </TableCell>
                  <TableCell>{prescription.diagnosis}</TableCell>
                  <TableCell>
                    {prescription.cie10Code ? (
                      <Badge variant="outline">{prescription.cie10Code}</Badge>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {prescription.medications.length} medicamento(s)
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant} className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {prescription.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(prescription.id, 'DISPENSED')}
                          disabled={isUpdating}
                        >
                          Dispensar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(prescription.id, 'CANCELLED')}
                          disabled={isUpdating}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
