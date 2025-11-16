import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { prescriptionSchema } from '@/lib/validations/prescription'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = prescriptionSchema.parse(body)

    const prescription = await prisma.prescription.create({
      data: {
        patientId: validatedData.patientId,
        doctorId: session.id,
        diagnosis: validatedData.diagnosis,
        cie10Code: validatedData.cie10Code || null,
        observations: validatedData.observations || null,
        status: 'PENDING',
        medications: {
          create: validatedData.medications.map((med) => ({
            medicationId: med.medicationId,
            quantity: med.quantity,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
          })),
        },
      },
      include: {
        patient: true,
        doctor: true,
        medications: {
          include: {
            medication: true,
          },
        },
      },
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: 'Error al crear receta' },
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
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (patientId) {
      where.patientId = patientId
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { error: 'Error al obtener recetas' },
      { status: 500 }
    )
  }
}
