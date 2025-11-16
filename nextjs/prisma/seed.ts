import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      email: 'admin@hospital.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN',
    },
  })

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      email: 'doctor@hospital.com',
      username: 'doctor1',
      password: hashedPassword,
      firstName: 'Dr. Juan',
      lastName: 'Pérez',
      role: 'DOCTOR',
    },
  })

  const enfermera = await prisma.user.upsert({
    where: { email: 'enfermera@hospital.com' },
    update: {},
    create: {
      email: 'enfermera@hospital.com',
      username: 'enfermera1',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'García',
      role: 'ENFERMERA',
    },
  })

  console.log('✅ Users created:', { admin, doctor, enfermera })

  const patient1 = await prisma.patient.upsert({
    where: { curp: 'PEJU850101HDFRNN09' },
    update: {},
    create: {
      curp: 'PEJU850101HDFRNN09',
      firstName: 'Juan',
      lastName: 'Pérez',
      birthDate: new Date('1985-01-01'),
      gender: 'M',
      phoneNumber: '5551234567',
      email: 'juan.perez@email.com',
      address: 'Calle Principal 123, CDMX',
      bloodType: 'O+',
      allergies: 'Penicilina',
      status: 'ACTIVE',
    },
  })

  const patient2 = await prisma.patient.upsert({
    where: { curp: 'GAMA900515MDFRRC01' },
    update: {},
    create: {
      curp: 'GAMA900515MDFRRC01',
      firstName: 'María',
      lastName: 'García',
      birthDate: new Date('1990-05-15'),
      gender: 'F',
      phoneNumber: '5559876543',
      email: 'maria.garcia@email.com',
      address: 'Av. Insurgentes 456, CDMX',
      bloodType: 'A+',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Patients created:', { patient1, patient2 })

  const medication1 = await prisma.medication.create({
    data: {
      name: 'Paracetamol',
      genericName: 'Acetaminofén',
      presentation: 'Tabletas',
      dosage: '500mg',
      stock: 1000,
      minimumStock: 100,
      price: 5.5,
    },
  })

  const medication2 = await prisma.medication.create({
    data: {
      name: 'Ibuprofeno',
      genericName: 'Ibuprofeno',
      presentation: 'Tabletas',
      dosage: '400mg',
      stock: 800,
      minimumStock: 100,
      price: 8.0,
    },
  })

  const medication3 = await prisma.medication.create({
    data: {
      name: 'Amoxicilina',
      genericName: 'Amoxicilina',
      presentation: 'Cápsulas',
      dosage: '500mg',
      stock: 500,
      minimumStock: 50,
      price: 15.0,
    },
  })

  console.log('✅ Medications created:', { medication1, medication2, medication3 })

  const cie10_1 = await prisma.cIE10.create({
    data: {
      code: 'J00',
      description: 'Rinofaringitis aguda (resfriado común)',
      category: 'Enfermedades del sistema respiratorio',
    },
  })

  const cie10_2 = await prisma.cIE10.create({
    data: {
      code: 'K29',
      description: 'Gastritis y duodenitis',
      category: 'Enfermedades del sistema digestivo',
    },
  })

  const cie10_3 = await prisma.cIE10.create({
    data: {
      code: 'I10',
      description: 'Hipertensión esencial (primaria)',
      category: 'Enfermedades del sistema circulatorio',
    },
  })

  console.log('✅ CIE-10 codes created:', { cie10_1, cie10_2, cie10_3 })

  const prescription1 = await prisma.prescription.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor.id,
      diagnosis: 'Rinofaringitis aguda',
      cie10Code: cie10_1.code,
      observations: 'Reposo y abundantes líquidos',
      status: 'PENDING',
      medications: {
        create: [
          {
            medicationId: medication1.id,
            quantity: 10,
            frequency: 'Cada 8 horas',
            duration: '5 días',
            instructions: 'Tomar después de los alimentos',
          },
        ],
      },
    },
  })

  console.log('✅ Prescription created:', prescription1)

  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
