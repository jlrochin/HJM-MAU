import { z } from 'zod'

export const medicationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  genericName: z.string().min(1, 'El nombre genérico es requerido').max(255),
  presentation: z.string().min(1, 'La presentación es requerida').max(100),
  dosage: z.string().min(1, 'La dosificación es requerida').max(100),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  minimumStock: z.number().int().min(0, 'El stock mínimo no puede ser negativo'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  isActive: z.boolean().default(true),
})

export type MedicationFormData = z.infer<typeof medicationSchema>
