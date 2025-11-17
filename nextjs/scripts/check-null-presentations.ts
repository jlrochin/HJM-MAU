import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNullPresentations() {
  try {
    const medicationsWithNull = await prisma.medication.findMany({
      where: {
        presentationType: null
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`\n📊 Medicamentos sin tipo de presentación: ${medicationsWithNull.length}\n`)

    medicationsWithNull.forEach((med, index) => {
      console.log(`\n--- Medicamento ${index + 1} ---`)
      console.log(`Código: ${med.code || 'N/A'}`)
      console.log(`Nombre: ${med.name}`)
      console.log(`Descripción completa:`)
      console.log(med.description || 'Sin descripción')
      console.log('---')
    })

    const firstLines = medicationsWithNull.map(med => {
      const firstLine = med.description?.split('\n')[0] || ''
      return {
        name: med.name,
        firstLine
      }
    })

    console.log('\n\n📝 PRIMERAS LÍNEAS DE DESCRIPCIONES:\n')
    firstLines.forEach(item => {
      console.log(`${item.name}: "${item.firstLine}"`)
    })

  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkNullPresentations()
