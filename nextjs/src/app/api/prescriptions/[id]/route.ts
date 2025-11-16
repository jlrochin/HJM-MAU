import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        medications: {
          include: {
            medication: true,
          },
        },
      },
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 })
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error fetching prescription:', error)
    return NextResponse.json(
      { error: 'Error al obtener receta' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['PENDING', 'DISPENSED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const prescription = await prisma.prescription.update({
      where: { id: params.id },
      data: { status },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        medications: {
          include: {
            medication: true,
          },
        },
      },
    })

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error updating prescription:', error)
    return NextResponse.json(
      { error: 'Error al actualizar receta' },
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

    await prisma.prescription.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prescription:', error)
    return NextResponse.json(
      { error: 'Error al eliminar receta' },
      { status: 500 }
    )
  }
}
