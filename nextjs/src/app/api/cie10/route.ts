import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    if (!search || search.length < 2) {
      return NextResponse.json([])
    }

    const cie10Codes = await prisma.cIE10.findMany({
      where: {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { code: 'asc' },
    })

    return NextResponse.json(cie10Codes)
  } catch (error) {
    console.error('Error searching CIE-10:', error)
    return NextResponse.json(
      { error: 'Error al buscar códigos CIE-10' },
      { status: 500 }
    )
  }
}
