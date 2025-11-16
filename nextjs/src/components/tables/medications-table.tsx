'use client'

import { Medication } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MedicationsTableProps {
  data: Medication[]
}

export function MedicationsTable({ data }: MedicationsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Comercial</TableHead>
            <TableHead>Nombre Genérico</TableHead>
            <TableHead>Presentación</TableHead>
            <TableHead>Dosificación</TableHead>
            <TableHead className="text-right">Stock Actual</TableHead>
            <TableHead className="text-right">Stock Mínimo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-neutral-500">
                No hay medicamentos registrados
              </TableCell>
            </TableRow>
          ) : (
            data.map((medication) => {
              const isLowStock = medication.stock <= medication.minimumStock

              return (
                <TableRow key={medication.id}>
                  <TableCell className="font-medium">{medication.name}</TableCell>
                  <TableCell>{medication.genericName}</TableCell>
                  <TableCell>{medication.presentation}</TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell className="text-right">
                    <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                      {medication.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{medication.minimumStock}</TableCell>
                  <TableCell className="text-right">
                    ${medication.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {medication.isActive ? (
                      <Badge variant="default" className="bg-green-600">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
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
