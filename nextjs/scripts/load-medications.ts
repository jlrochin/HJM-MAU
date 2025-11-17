import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface MedicationRow {
  Grupo?: string
  Clave?: string
  Insumo?: string
  Descripción?: string
  Indicaciones?: string
}

async function loadMedications() {
  try {
    const excelPath = process.argv[2]

    if (!excelPath) {
      console.error('Por favor proporciona la ruta al archivo Excel')
      console.log('Uso: pnpm tsx scripts/load-medications.ts <ruta-al-archivo.xlsx>')
      process.exit(1)
    }

    if (!fs.existsSync(excelPath)) {
      console.error(`El archivo no existe: ${excelPath}`)
      process.exit(1)
    }

    console.log(`Leyendo archivo: ${excelPath}`)
    const workbook = XLSX.readFile(excelPath)

    console.log(`Hojas encontradas: ${workbook.SheetNames.length}`)
    console.log(`Nombres de hojas: ${workbook.SheetNames.join(', ')}`)

    let totalMedications = 0
    const allMedications: any[] = []

    for (const sheetName of workbook.SheetNames) {
      console.log(`\nProcesando hoja: ${sheetName}`)

      const worksheet = workbook.Sheets[sheetName]
      const data: MedicationRow[] = XLSX.utils.sheet_to_json(worksheet)

      console.log(`  Registros encontrados: ${data.length}`)

      for (const row of data) {
        if (!row.Insumo || row.Insumo.trim() === '') {
          continue
        }

        const medication = {
          code: row.Clave?.toString().trim() || null,
          name: row.Insumo.trim(),
          group: row.Grupo?.trim() || null,
          description: row.Descripción?.trim() || null,
          indications: row.Indicaciones?.trim() || null,
        }

        allMedications.push(medication)
      }
    }

    console.log(`\nTotal de medicamentos a importar: ${allMedications.length}`)
    console.log('Iniciando carga a la base de datos...')

    let inserted = 0
    let updated = 0
    let errors = 0

    for (const med of allMedications) {
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
          console.log(`  Procesados: ${inserted + updated}/${allMedications.length}`)
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
    console.log(`   Total: ${allMedications.length}`)

  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadMedications()
