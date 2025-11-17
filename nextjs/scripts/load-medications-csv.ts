import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

interface MedicationData {
  group: string | null
  code: string | null
  name: string
  description: string | null
  indications: string | null
}

function parseCSV(content: string): string[][] {
  const rows: string[][] = []
  const lines = content.split('\n')
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0

  while (i < content.length) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        i += 2
        continue
      } else {
        inQuotes = !inQuotes
        i++
        continue
      }
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
      i++
      continue
    }

    if (char === '\n' && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow)
      }
      currentRow = []
      i++
      continue
    }

    currentField += char
    i++
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

async function loadMedications() {
  try {
    const csvPath = '/Users/totewi/Downloads/medicamentos.csv'

    if (!fs.existsSync(csvPath)) {
      console.error(`El archivo no existe: ${csvPath}`)
      process.exit(1)
    }

    console.log(`Leyendo archivo: ${csvPath}`)

    let content = fs.readFileSync(csvPath, 'utf-8')

    if (content.startsWith('\ufeff')) {
      content = content.substring(1)
    }

    const rows = parseCSV(content)
    const medications: MedicationData[] = []

    for (let i = 1; i < rows.length; i++) {
      const fields = rows[i]

      if (fields.length >= 3 && fields[2]) {
        medications.push({
          group: fields[0] || null,
          code: fields[1] || null,
          name: fields[2],
          description: fields[3] || null,
          indications: fields[4] || null,
        })
      }
    }

    console.log(`\nTotal de medicamentos encontrados: ${medications.length}`)
    console.log('Iniciando carga a la base de datos...')

    let inserted = 0
    let updated = 0
    let errors = 0

    for (const med of medications) {
      try {
        const existing = med.code
          ? await prisma.medication.findUnique({ where: { code: med.code } })
          : null

        if (existing) {
          await prisma.medication.update({
            where: { id: existing.id },
            data: med
          })
          updated++
        } else {
          await prisma.medication.create({ data: med })
          inserted++
        }

        if ((inserted + updated) % 50 === 0) {
          console.log(`  Procesados: ${inserted + updated}/${medications.length}`)
        }
      } catch (error: any) {
        console.error(`Error al procesar: ${med.name} - ${error.message}`)
        errors++
      }
    }

    console.log('\n✅ Carga completada!')
    console.log(`   Insertados: ${inserted}`)
    console.log(`   Actualizados: ${updated}`)
    console.log(`   Errores: ${errors}`)
    console.log(`   Total: ${medications.length}`)

  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadMedications()
