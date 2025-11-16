import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { medicationSchema } from '@/lib/validations/medication'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = medicationSchema.parse(body)

    const medication = await prisma.medication.create({
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

    return NextResponse.json(medication, { status: 201 })
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json(
      { error: 'Error al crear medicamento' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { genericName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const medications = await prisma.medication.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(medications)
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { error: 'Error al obtener medicamentos' },
      { status: 500 }
    )
  }
}
