import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { medicationSchema } from '@/lib/validations/medication'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = medicationSchema.parse(body)

    const medication = await prisma.medication.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        genericName: validatedData.genericName,
        presentation: validatedData.presentation,
        dosage: validatedData.dosage,
        stock: validatedData.stock,
        minimumStock: validatedData.minimumStock,
        price: validatedData.price,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Error updating medication:', error)
    return NextResponse.json(
      { error: 'Error al actualizar medicamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.medication.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting medication:', error)
    return NextResponse.json(
      { error: 'Error al eliminar medicamento' },
      { status: 500 }
    )
  }
}
