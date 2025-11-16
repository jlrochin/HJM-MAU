import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { createSession } from '@/lib/auth'

const loginSchema = z.object({
  username: z.string().min(3, 'Usuario inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedFields = loginSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { username, password } = validatedFields.data

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 })
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
