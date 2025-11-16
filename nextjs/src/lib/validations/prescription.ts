import { z } from 'zod'

export const prescriptionMedicationSchema = z.object({
  medicationId: z.string().min(1, 'Medicamento requerido'),
  quantity: z.number().int().min(1, 'Cantidad debe ser al menos 1'),
  dosage: z.string().min(1, 'Dosificación requerida'),
  frequency: z.string().min(1, 'Frecuencia requerida'),
  duration: z.string().min(1, 'Duración requerida'),
})

export const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Paciente requerido'),
  diagnosis: z.string().min(1, 'Diagnóstico requerido'),
  cie10Code: z.string().optional(),
  observations: z.string().optional(),
  medications: z.array(prescriptionMedicationSchema).min(1, 'Debe incluir al menos un medicamento'),
})

export type PrescriptionMedicationFormData = z.infer<typeof prescriptionMedicationSchema>
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>
