'use client'

import { Patient } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PatientsTableProps {
  data: Patient[]
}

export function PatientsTable({ data }: PatientsTableProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      DISCHARGED: 'bg-blue-100 text-blue-800',
    }
    return styles[status as keyof typeof styles] || styles.ACTIVE
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>CURP</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                No hay pacientes registrados
              </TableCell>
            </TableRow>
          ) : (
            data.map((patient) => {
              const age = Math.floor(
                (Date.now() - new Date(patient.birthDate).getTime()) / 31557600000
              )

              return (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </TableCell>
                  <TableCell>{patient.curp || 'N/A'}</TableCell>
                  <TableCell>{age} años</TableCell>
                  <TableCell>{patient.phoneNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        patient.status
                      )}`}
                    >
                      {patient.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(patient.createdAt), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
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
