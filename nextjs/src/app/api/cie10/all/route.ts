import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const [data, categories] = await Promise.all([
      prisma.cIE10.findMany({
        orderBy: { code: 'asc' }
      }),
      prisma.cIE10.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
      })
    ])

    return NextResponse.json({
      data,
      categories: categories.map(c => c.category)
    })
  } catch (error) {
    console.error('Error fetching CIE-10 data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del catálogo CIE-10' },
      { status: 500 }
    )
  }
}
