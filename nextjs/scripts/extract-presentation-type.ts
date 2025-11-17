import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function extractPresentationType() {
  try {
    const medications = await prisma.medication.findMany()

    console.log(`Procesando ${medications.length} medicamentos...`)

    let updated = 0

    for (const med of medications) {
      if (!med.description) continue

      const firstLine = med.description.split('\n')[0].trim()

      const presentationTypes = [
        'SUSPENSION PARA NEBULIZAR',
        'IMPLANTE DE LIBERACIÓN PROLONGADA',
        'IMPLANTE DE LIBERACION PROLONGADA',
        'SISTEMA DE LIBERACIÓN',
        'FRASCO ÁMPULA',
        'EMULSIÓN DÉRMICA',
        'EMULSION DERMICA',
        'FABOTERAPICO',
        'FABOTERÁPICO',
        'SUSPENSION RECTAL',
        'SUSPENSION ORAL',
        'SOLUCION ORAL',
        'SOLUCION INYECTABLE',
        'SOLUCION PARA DIALISIS',
        'PARCHE ADHESIVO',
        'GRANULADO ORAL',
        'LUBRICANTE VISCOELÁSTICO',
        'COLIRIO',
        'TABLETA',
        'CÁPSULA',
        'CAPSULA',
        'SOLUCIÓN',
        'SOLUCION',
        'SUSPENSIÓN',
        'SUSPENSION',
        'JARABE',
        'AMPOLLETA',
        'SUPOSITORIO',
        'ÓVULO',
        'OVULO',
        'CREMA',
        'UNGÜENTO',
        'UNGUENTO',
        'GEL',
        'POMADA',
        'LOCIÓN',
        'LOCION',
        'INYECTABLE',
        'POLVO',
        'AEROSOL',
        'SPRAY',
        'GOTAS',
        'COMPRIMIDO',
        'PARCHE',
        'IMPLANTE',
        'GRAGEA',
        'GRANULADO',
        'ELÍXIR',
        'ELIXIR',
        'ESPUMA',
        'LÍQUIDO',
        'LIQUIDO',
        'EMULSIÓN',
        'EMULSION',
        'JABÓN',
        'JABON'
      ]

      let presentationType = null
      let remainingDescription = med.description

      for (const type of presentationTypes) {
        if (firstLine.toUpperCase().includes(type)) {
          presentationType = firstLine
          const lines = med.description.split('\n')
          remainingDescription = lines.slice(1).join('\n').trim()
          break
        }
      }

      if (presentationType) {
        await prisma.medication.update({
          where: { id: med.id },
          data: {
            presentationType,
            description: remainingDescription || null
          }
        })
        updated++

        if (updated % 100 === 0) {
          console.log(`  Procesados: ${updated}/${medications.length}`)
        }
      }
    }

    console.log(`\n✅ Actualización completada!`)
    console.log(`   Medicamentos actualizados: ${updated}`)
    console.log(`   Sin tipo de presentación: ${medications.length - updated}`)

  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

extractPresentationType()
