import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearMedications() {
  try {
    const result = await prisma.medication.deleteMany({})

    console.log(`✅ ${result.count} medicamentos eliminados de la base de datos`)

  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearMedications()
