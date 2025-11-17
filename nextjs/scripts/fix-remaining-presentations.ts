import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRemainingPresentations() {
  try {
    const updates = [
      {
        code: '010.000.6313.00',
        presentationType: 'CAPSULA',
        description: 'Citrato de ixazomib 4.30 mg equivalente a 3.0 mg de ixazomib\n\nCaja colectiva con 3 cápsulas de 3 mg. Cada cápsula está contenida en un envase de burbuja sellada en una cartera de cartón, dentro de una caja individual.'
      },
      {
        code: '010.000.6314.00',
        presentationType: 'CAPSULA',
        description: 'Citrato de ixazomib 5.70 mg equivalente a 4.0 mg de ixazomib\n\nCaja colectiva con 3 cápsulas. Cada cápsula está contenida en un envase de burbuja sellada en una cartera de cartón, dentro de una caja individual.'
      },
      {
        code: '010.000.5452.01',
        presentationType: 'JERINGA PRELLENADA',
        description: 'Cada jeringa prellenada con 6mg/0.60 mL contiene:\nPegfilgrastim 6 mg\n\nCaja de cartón con una jeringa prellenada con tapa y un inyector corporal en envase de burbuja e instructivo anexo.'
      },
      {
        code: '020.000.6507.00',
        presentationType: 'VACUNA',
        description: 'Vacuna contra Herpes zóster recombinante con adyuvante AS01B\n\nCaja con 1 frasco ámpula con polvo liofilizado con antígeno herpes zóster y 1 frasco ámpula con suspensión con adyuvante AS01B'
      },
      {
        code: '010.000.6226.00',
        presentationType: 'TABLETA',
        description: 'Mantenimiento\nCaja con un frasco con 120 tabletas de 100 mg'
      },
      {
        code: '010.000.0804.00',
        presentationType: 'PASTA',
        description: 'Cada 100 g contienen:\nÓxido de zinc 25.0 g.\n\nEnvase con 30 g.'
      }
    ]

    for (const update of updates) {
      await prisma.medication.updateMany({
        where: { code: update.code },
        data: {
          presentationType: update.presentationType
        }
      })
      console.log(`✓ Actualizado: ${update.code} - ${update.presentationType}`)
    }

    const systemMedications = await prisma.medication.findMany({
      where: {
        name: {
          contains: 'SISTEMA INTEGRAL'
        },
        presentationType: null
      }
    })

    for (const med of systemMedications) {
      await prisma.medication.update({
        where: { id: med.id },
        data: {
          presentationType: 'SISTEMA INTEGRAL'
        }
      })
      console.log(`✓ Actualizado: ${med.code} - SISTEMA INTEGRAL`)
    }

    console.log('\n✅ Todos los medicamentos actualizados!')

  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixRemainingPresentations()
