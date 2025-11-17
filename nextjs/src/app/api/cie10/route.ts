import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    let allData = await prisma.cIE10.findMany({
      orderBy: { code: 'asc' }
    })

    if (category) {
      allData = allData.filter(item => item.category === category)
    }

    if (search) {
      const normalizedSearch = normalizeText(search)
      allData = allData.filter(item => {
        const normalizedCode = normalizeText(item.code)
        const normalizedDescription = normalizeText(item.description)
        return (
          normalizedCode.includes(normalizedSearch) ||
          normalizedDescription.includes(normalizedSearch)
        )
      })
    }

    const total = allData.length
    const data = allData.slice(skip, skip + limit)

    const categories = await prisma.cIE10.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    })

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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
