import { z } from 'zod'

export const patientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  curp: z.string().optional(),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['M', 'F', 'OTHER'], {
    required_error: 'Selecciona un género',
  }),
  phoneNumber: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
})

export type PatientFormData = z.infer<typeof patientSchema>
