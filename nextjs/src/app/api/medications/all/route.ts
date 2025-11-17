import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const medications = await prisma.medication.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        group: true,
        presentationType: true,
        description: true,
        indications: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    const groupsSet = new Set<string>()
    medications.forEach(m => {
      if (m.group) {
        const splitGroups = m.group.split(/\n\n/)
        splitGroups.forEach(g => {
          const trimmed = g.trim().replace(/\s+/g, ' ')
          if (trimmed && trimmed.startsWith('Grupo Nº')) {
            groupsSet.add(trimmed)
          }
        })
      }
    })

    const groups = Array.from(groupsSet).sort((a, b) => {
      const numA = parseInt(a.match(/Grupo Nº (\d+)/)?.[1] || '0')
      const numB = parseInt(b.match(/Grupo Nº (\d+)/)?.[1] || '0')
      return numA - numB
    })

    return NextResponse.json({
      data: medications,
      groups
    })
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { error: 'Error al cargar los medicamentos' },
      { status: 500 }
    )
  }
}
