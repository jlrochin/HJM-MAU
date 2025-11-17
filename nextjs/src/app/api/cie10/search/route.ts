import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const results = await prisma.cIE10.findMany({
      where: {
        OR: [
          {
            code: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        code: true,
        description: true,
        category: true
      },
      take: limit,
      orderBy: {
        code: 'asc'
      }
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching CIE-10:', error)
    return NextResponse.json(
      { error: 'Error al buscar códigos CIE-10' },
      { status: 500 }
    )
  }
}
