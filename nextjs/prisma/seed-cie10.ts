import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

async function main() {
  console.log('🔄 Limpiando tabla CIE10...')
  await prisma.cIE10.deleteMany({})

  console.log('📂 Leyendo archivo CSV...')
  const csvPath = path.join(__dirname, '../public/cie10.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  const lines = csvContent.split('\n')
  const headers = parseCSVLine(lines[0])

  const catalogKeyIndex = headers.indexOf('CATALOG_KEY')
  const nombreIndex = headers.indexOf('NOMBRE')
  const capituloIndex = headers.indexOf('CAPITULO')

  console.log(`📊 Procesando ${lines.length - 1} registros...`)

  const batchSize = 100
  let batch: any[] = []
  let totalInserted = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const values = parseCSVLine(line)

    if (values.length > Math.max(catalogKeyIndex, nombreIndex, capituloIndex)) {
      batch.push({
        code: values[catalogKeyIndex] || '',
        description: values[nombreIndex] || '',
        category: values[capituloIndex] || ''
      })

      if (batch.length >= batchSize) {
        await prisma.cIE10.createMany({
          data: batch,
          skipDuplicates: true
        })
        totalInserted += batch.length
        console.log(`✅ Insertados ${totalInserted} registros...`)
        batch = []
      }
    }
  }

  if (batch.length > 0) {
    await prisma.cIE10.createMany({
      data: batch,
      skipDuplicates: true
    })
    totalInserted += batch.length
  }

  console.log(`✅ ¡Completado! Total de registros insertados: ${totalInserted}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
